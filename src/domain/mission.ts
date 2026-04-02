/**
 * Mission — the core unit of work in the system.
 *
 * Single responsibility: represents the work unit and its lifecycle.
 * Zero framework imports. Zero UI concerns.
 */

import type { Stage } from './stage';
import type { TeamMemberAssignment } from './team-member';
import type { MissionMetrics } from './metrics';

export type MissionType =
  | 'brainstorm'
  | 'spec'
  | 'plan'
  | 'task'
  | 'epic'
  | 'review'
  | 'bug'
  | 'profiling';

export type MissionStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface MissionContext {
  readonly workingDirectory: string;
  readonly targetFiles: readonly string[];
  readonly constraints: readonly string[];
  readonly model: string;
}

export interface Mission {
  readonly id: string;
  readonly type: MissionType;
  readonly title: string;
  readonly description: string;
  readonly status: MissionStatus;
  readonly stages: readonly Stage[];
  readonly teamMembers: readonly TeamMemberAssignment[];
  readonly metrics: MissionMetrics;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly completedAt: Date | null;
  readonly parentMissionId: string | null;
  readonly tags: readonly string[];
  readonly context: MissionContext;
}
