/**
 * Metrics — first-class domain entities for system state communication.
 *
 * Token counts, durations, and team breakdowns answer
 * "what happened" and "how much did it cost."
 */

import type { TeamMemberRole } from './team-member';
import type { StageName } from './stage';

export interface MissionMetrics {
  readonly totalTokens: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalDurationMs: number;
  readonly taskCount: number;
  readonly completedTaskCount: number;
  readonly failedTaskCount: number;
  readonly teamBreakdown: readonly TeamMemberMetrics[];
  readonly stageBreakdown: readonly StageMetrics[];
  readonly estimatedCostUsd: number;
}

export interface TeamMemberMetrics {
  readonly role: TeamMemberRole;
  readonly tokensUsed: number;
  readonly tasksCompleted: number;
  readonly durationMs: number;
  readonly percentageOfTotal: number;
}

export interface StageMetrics {
  readonly stage: StageName;
  readonly tokensUsed: number;
  readonly durationMs: number;
  readonly taskCount: number;
}
