/**
 * Account — represents the user's relationship with the tool.
 *
 * The account screen is where users build identity with the tool:
 * their history, their patterns, their mastery.
 */

import type { MissionType, MissionStatus } from './mission';

export interface Account {
  readonly id: string;
  readonly createdAt: Date;
  readonly settings: AccountSettings;
  readonly usageStats: UsageStats;
  readonly sessionHistory: readonly SessionSummary[];
}

export interface AccountSettings {
  readonly defaultModel: string;
  readonly defaultWorkingDirectory: string;
  readonly theme: 'dark' | 'light' | 'system';
  readonly cliPath: string;
  readonly tokenBudgetPerMission: number | null;
  readonly autoOpenBrowser: boolean;
  readonly port: number;
}

export interface UsageStats {
  readonly totalMissions: number;
  readonly totalTokens: number;
  readonly totalDurationMs: number;
  readonly estimatedTotalCostUsd: number;
  readonly missionsByType: Record<MissionType, number>;
  readonly missionsByStatus: Record<MissionStatus, number>;
  readonly averageTokensPerMission: number;
  readonly averageDurationPerMission: number;
}

export interface SessionSummary {
  readonly sessionId: string;
  readonly startedAt: Date;
  readonly endedAt: Date;
  readonly missionsCreated: number;
  readonly missionsCompleted: number;
  readonly totalTokens: number;
}
