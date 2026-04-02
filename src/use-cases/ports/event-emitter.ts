/**
 * EventEmitter port — real-time event broadcasting contract.
 *
 * Used by use cases to push updates (stage transitions, metrics,
 * team activity) without knowing about WebSockets.
 */

import type { MissionStatus, MissionMetrics, TeamMemberAssignment, StageName, StageStatus } from '@/domain';

export interface MissionEvent {
  missionId: string;
  timestamp: Date;
}

export interface CliOutputEvent extends MissionEvent {
  type: 'cli_output';
  content: string;
  stream: 'stdout' | 'stderr';
  source: string;
}

export interface StageUpdateEvent extends MissionEvent {
  type: 'stage_update';
  stage: StageName;
  status: StageStatus;
}

export interface MetricsUpdateEvent extends MissionEvent {
  type: 'metrics_update';
  metrics: MissionMetrics;
}

export interface TeamActivityEvent extends MissionEvent {
  type: 'team_activity';
  activity: TeamMemberAssignment;
}

export interface MissionStatusEvent extends MissionEvent {
  type: 'mission_status';
  status: MissionStatus;
}

export type AppEvent =
  | CliOutputEvent
  | StageUpdateEvent
  | MetricsUpdateEvent
  | TeamActivityEvent
  | MissionStatusEvent;

export interface EventEmitter {
  emit(event: AppEvent): void;
  subscribe(missionId: string, listener: (event: AppEvent) => void): () => void;
  subscribeAll(listener: (event: AppEvent) => void): () => void;
}
