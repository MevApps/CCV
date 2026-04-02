/**
 * ExecuteMission use case — dispatches a mission to the CLI
 * and streams events through the EventEmitter.
 */

import type { Mission } from '@/domain';
import type { MissionRepository, CliExecutor, EventEmitter } from './ports';

export class ExecuteMission {
  constructor(
    private missionRepo: MissionRepository,
    private cliExecutor: CliExecutor,
    private eventEmitter: EventEmitter,
  ) {}

  async execute(missionId: string): Promise<void> {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) throw new Error(`Mission not found: ${missionId}`);

    // Transition to active
    await this.missionRepo.updateStatus(missionId, 'active');
    this.eventEmitter.emit({
      type: 'mission_status',
      missionId,
      status: 'active',
      timestamp: new Date(),
    });

    // Build the CLI command from mission context
    const command = {
      prompt: this.buildPrompt(mission),
      workingDirectory: mission.context.workingDirectory || process.cwd(),
      model: mission.context.model || 'claude-sonnet-4-6',
      constraints: [...mission.context.constraints],
      maxTokens: undefined,
    };

    try {
      for await (const event of this.cliExecutor.execute(command)) {
        switch (event.type) {
          case 'output':
            this.eventEmitter.emit({
              type: 'cli_output',
              missionId,
              content: event.content,
              stream: event.stream,
              source: 'system',
              timestamp: new Date(),
            });
            break;

          case 'metrics_update':
            this.eventEmitter.emit({
              type: 'metrics_update',
              missionId,
              metrics: {
                totalTokens: event.tokens,
                inputTokens: 0,
                outputTokens: 0,
                totalDurationMs: event.elapsed,
                taskCount: 0,
                completedTaskCount: 0,
                failedTaskCount: 0,
                teamBreakdown: [],
                stageBreakdown: [],
                estimatedCostUsd: 0,
              },
              timestamp: new Date(),
            });
            break;

          case 'completed':
            await this.missionRepo.updateStatus(
              missionId,
              event.exitCode === 0 ? 'completed' : 'failed',
            );
            this.eventEmitter.emit({
              type: 'mission_status',
              missionId,
              status: event.exitCode === 0 ? 'completed' : 'failed',
              timestamp: new Date(),
            });
            break;

          case 'error':
            this.eventEmitter.emit({
              type: 'cli_output',
              missionId,
              content: event.message,
              stream: 'stderr',
              source: 'system',
              timestamp: new Date(),
            });
            if (!event.recoverable) {
              await this.missionRepo.updateStatus(missionId, 'failed');
              this.eventEmitter.emit({
                type: 'mission_status',
                missionId,
                status: 'failed',
                timestamp: new Date(),
              });
            }
            break;
        }
      }
    } catch (err) {
      await this.missionRepo.updateStatus(missionId, 'failed');
      this.eventEmitter.emit({
        type: 'mission_status',
        missionId,
        status: 'failed',
        timestamp: new Date(),
      });
    }
  }

  private buildPrompt(mission: Mission): string {
    const parts = [mission.description];

    if (mission.context.targetFiles.length > 0) {
      parts.push(`\nFocus on these files: ${mission.context.targetFiles.join(', ')}`);
    }

    if (mission.context.constraints.length > 0) {
      parts.push(`\nConstraints:\n${mission.context.constraints.map((c) => `- ${c}`).join('\n')}`);
    }

    return parts.join('\n');
  }
}
