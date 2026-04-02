/**
 * View Models — data shapes consumed by React components.
 *
 * Presenters transform domain entities into these view models.
 * React components never receive raw domain entities.
 */

import type {
  MissionType,
  MissionStatus,
  TeamMemberRole,
  StageName,
  StageStatus,
} from '@/domain';

export interface MissionSummary {
  id: string;
  title: string;
  type: MissionType;
  status: MissionStatus;
  progress: number;
  activeTeamMembers: TeamMemberRole[];
  tokenCount: number;
  duration: string;
  updatedAt: string;
}

export interface StageViewModel {
  name: StageName;
  displayName: string;
  status: StageStatus;
  tasks: StageTaskViewModel[];
  memberColors: string[];
}

export interface StageTaskViewModel {
  id: string;
  description: string;
  assignedTo: TeamMemberRole;
  memberColor: string;
  status: StageStatus;
  tokens: string;
  duration: string;
}

export interface TerminalLine {
  id: string;
  content: string;
  timestamp: Date;
  source: TeamMemberRole | 'system';
  type: 'stdout' | 'stderr' | 'info' | 'stage-transition';
}
