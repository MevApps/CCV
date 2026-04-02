import type { TeamMemberRole, StageName, MissionType } from '@/domain';

export type FeedItemType =
  | 'user-message'
  | 'agent-message'
  | 'stage-transition'
  | 'error-recovery'
  | 'completion';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  timestamp: Date;
}

export interface UserMessageFeedItem extends FeedItem {
  type: 'user-message';
  content: string;
}

export interface AgentMessageFeedItem extends FeedItem {
  type: 'agent-message';
  role: TeamMemberRole;
  roleColor: string;
  roleInitial: string;
  status: 'working' | 'done' | 'idle';
  content: string;
  artifacts: ArtifactCard[];
  terminalLines: string[];
}

export interface ArtifactCard {
  id: string;
  filename: string;
  filePath: string;
  lineCount: number;
  fileType: string;
}

export interface StageTransitionFeedItem extends FeedItem {
  type: 'stage-transition';
  fromStage: StageName;
  toStage: StageName;
  duration: string;
}

export interface ErrorRecoveryFeedItem extends FeedItem {
  type: 'error-recovery';
  errorTitle: string;
  codeSnippet: string;
  fileLocation: string;
}

export interface CompletionFeedItem extends FeedItem {
  type: 'completion';
  tasksCompleted: number;
  totalTasks: number;
  totalDuration: string;
  totalTokens: string;
  estimatedCost: string;
  filesChanged: number;
}
