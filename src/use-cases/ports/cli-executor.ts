/**
 * CliExecutor port — CLI subprocess contract.
 *
 * The use case calls an interface; it doesn't know
 * it's spawning a child process.
 */

import type { StageName } from '@/domain';
import type { TeamMemberRole } from '@/domain';

export interface CliCommand {
  prompt: string;
  workingDirectory: string;
  model: string;
  constraints: string[];
  maxTokens?: number;
}

export type CliEvent =
  | { type: 'output'; content: string; stream: 'stdout' | 'stderr' }
  | { type: 'stage_transition'; from: StageName; to: StageName }
  | { type: 'team_member_active'; role: TeamMemberRole; task: string }
  | { type: 'team_member_complete'; role: TeamMemberRole; tokens: number }
  | { type: 'metrics_update'; tokens: number; elapsed: number }
  | { type: 'completed'; exitCode: number }
  | { type: 'error'; message: string; recoverable: boolean };

export interface CliExecutor {
  execute(command: CliCommand): AsyncGenerator<CliEvent>;
  cancel(executionId: string): Promise<void>;
  isAvailable(): Promise<boolean>;
}
