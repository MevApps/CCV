/**
 * Stage — a phase of execution within a mission.
 * Stages map 1:1 to Kanban columns.
 */

import type { TeamMemberRole } from './team-member';

export type StageName =
  | 'analysis'
  | 'design'
  | 'implementation'
  | 'review'
  | 'complete';

export type StageStatus =
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'skipped';

export interface Stage {
  readonly name: StageName;
  readonly status: StageStatus;
  readonly assignedMembers: readonly TeamMemberRole[];
  readonly tasks: readonly StageTask[];
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly output: string;
}

export interface StageTask {
  readonly id: string;
  readonly description: string;
  readonly assignedTo: TeamMemberRole;
  readonly status: StageStatus;
  readonly output: string;
  readonly tokensUsed: number;
  readonly durationMs: number;
}
