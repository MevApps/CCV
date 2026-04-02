/**
 * ClaudeCliAdapter — spawns Claude Code CLI as a child process
 * and parses its structured output into domain CliEvents.
 *
 * Implements the CliExecutor port. The use case layer never knows
 * this is a child process — it calls an interface.
 */

import { spawn, type ChildProcess } from 'child_process';
import { v4 as uuid } from 'uuid';
import type { CliExecutor, CliCommand, CliEvent } from '@/use-cases/ports';

export class ClaudeCliAdapter implements CliExecutor {
  private processes = new Map<string, ChildProcess>();
  private cliPath: string;

  constructor(cliPath = 'claude') {
    this.cliPath = cliPath;
  }

  async *execute(command: CliCommand): AsyncGenerator<CliEvent> {
    const args = [
      '--print',
      '--output-format', 'stream-json',
      '--model', command.model,
    ];

    if (command.maxTokens) {
      args.push('--max-tokens', String(command.maxTokens));
    }

    args.push(command.prompt);

    const proc = spawn(this.cliPath, args, {
      cwd: command.workingDirectory,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const executionId = uuid();
    this.processes.set(executionId, proc);

    const startTime = Date.now();

    // Yield execution ID as first event so callers can cancel
    yield {
      type: 'output',
      content: `execution:${executionId}`,
      stream: 'stdout',
    };

    // Stream stdout and parse JSON events
    yield* this.streamOutput(proc, startTime);

    // Handle process exit
    const exitCode = await new Promise<number>((resolve) => {
      proc.on('close', (code) => resolve(code ?? 1));
    });

    this.processes.delete(executionId);

    yield { type: 'completed', exitCode };
  }

  async cancel(executionId: string): Promise<void> {
    const proc = this.processes.get(executionId);
    if (!proc) return;

    proc.kill('SIGTERM');

    // Grace period, then SIGKILL
    const killTimeout = setTimeout(() => {
      if (!proc.killed) {
        proc.kill('SIGKILL');
      }
    }, 5000);

    proc.on('close', () => {
      clearTimeout(killTimeout);
      this.processes.delete(executionId);
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      const proc = spawn(this.cliPath, ['--version'], { stdio: 'pipe' });
      const code = await new Promise<number>((resolve) => {
        proc.on('close', (c) => resolve(c ?? 1));
        proc.on('error', () => resolve(1));
      });
      return code === 0;
    } catch {
      return false;
    }
  }

  private async *streamOutput(
    proc: ChildProcess,
    startTime: number,
  ): AsyncGenerator<CliEvent> {
    // Buffer for incomplete lines
    let buffer = '';

    const lineQueue: CliEvent[] = [];
    let resolve: (() => void) | null = null;
    let done = false;

    function enqueue(event: CliEvent) {
      lineQueue.push(event);
      if (resolve) {
        resolve();
        resolve = null;
      }
    }

    proc.stdout?.on('data', (chunk: Buffer) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const events = parseCliLine(line, startTime);
        for (const event of events) {
          enqueue(event);
        }
      }
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      const content = chunk.toString();
      if (content.trim()) {
        enqueue({ type: 'error', message: content, recoverable: true });
      }
    });

    proc.on('close', () => {
      // Flush remaining buffer
      if (buffer.trim()) {
        const events = parseCliLine(buffer, startTime);
        for (const event of events) {
          enqueue(event);
        }
      }
      done = true;
      if (resolve) {
        resolve();
        resolve = null;
      }
    });

    proc.on('error', (err) => {
      enqueue({
        type: 'error',
        message: err.message,
        recoverable: false,
      });
      done = true;
      if (resolve) {
        resolve();
        resolve = null;
      }
    });

    // Yield events as they arrive
    while (true) {
      if (lineQueue.length > 0) {
        yield lineQueue.shift()!;
        continue;
      }
      if (done) break;
      await new Promise<void>((r) => { resolve = r; });
    }
  }
}

/**
 * Parse a single line of Claude Code's stream-json output into domain events.
 *
 * Claude Code's --output-format stream-json emits one JSON object per line.
 * We map these to our CliEvent types.
 */
function parseCliLine(raw: string, startTime: number): CliEvent[] {
  const events: CliEvent[] = [];

  try {
    const parsed = JSON.parse(raw);

    // Claude Code stream-json emits objects with a `type` field
    switch (parsed.type) {
      case 'assistant':
      case 'text':
        events.push({
          type: 'output',
          content: parsed.content ?? parsed.text ?? raw,
          stream: 'stdout',
        });
        break;

      case 'tool_use':
        events.push({
          type: 'output',
          content: `[tool] ${parsed.name ?? 'unknown'}: ${JSON.stringify(parsed.input ?? {}).slice(0, 200)}`,
          stream: 'stdout',
        });
        break;

      case 'tool_result':
      case 'result':
        events.push({
          type: 'output',
          content: parsed.content ?? parsed.text ?? JSON.stringify(parsed).slice(0, 500),
          stream: 'stdout',
        });
        if (parsed.usage) {
          events.push({
            type: 'metrics_update',
            tokens: (parsed.usage.input_tokens ?? 0) + (parsed.usage.output_tokens ?? 0),
            elapsed: Date.now() - startTime,
          });
        }
        break;

      case 'error':
        events.push({
          type: 'error',
          message: parsed.message ?? parsed.error ?? 'Unknown error',
          recoverable: parsed.recoverable ?? true,
        });
        break;

      default:
        // Pass through any unrecognized output as raw text
        events.push({
          type: 'output',
          content: raw,
          stream: 'stdout',
        });
    }
  } catch {
    // Not JSON — treat as raw text output
    if (raw.trim()) {
      events.push({
        type: 'output',
        content: raw,
        stream: 'stdout',
      });
    }
  }

  return events;
}
