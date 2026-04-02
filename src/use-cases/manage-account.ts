/**
 * ManageAccount use case — reads and updates account settings,
 * computes usage statistics.
 */

import type Database from 'better-sqlite3';
import type { AccountSettings, UsageStats } from '@/domain';

const DEFAULT_SETTINGS: AccountSettings = {
  defaultModel: 'claude-sonnet-4-6',
  defaultWorkingDirectory: '',
  theme: 'dark',
  cliPath: 'claude',
  tokenBudgetPerMission: null,
  autoOpenBrowser: true,
  port: 3117,
};

export class ManageAccount {
  constructor(private db: Database.Database) {}

  getSettings(): AccountSettings {
    const rows = this.db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const overrides: Record<string, string> = {};
    for (const row of rows) {
      overrides[row.key] = row.value;
    }

    return {
      defaultModel: overrides.defaultModel ?? DEFAULT_SETTINGS.defaultModel,
      defaultWorkingDirectory: overrides.defaultWorkingDirectory ?? DEFAULT_SETTINGS.defaultWorkingDirectory,
      theme: (overrides.theme as AccountSettings['theme']) ?? DEFAULT_SETTINGS.theme,
      cliPath: overrides.cliPath ?? DEFAULT_SETTINGS.cliPath,
      tokenBudgetPerMission: overrides.tokenBudgetPerMission ? Number(overrides.tokenBudgetPerMission) : DEFAULT_SETTINGS.tokenBudgetPerMission,
      autoOpenBrowser: overrides.autoOpenBrowser !== undefined ? overrides.autoOpenBrowser === 'true' : DEFAULT_SETTINGS.autoOpenBrowser,
      port: overrides.port ? Number(overrides.port) : DEFAULT_SETTINGS.port,
    };
  }

  updateSettings(updates: Partial<AccountSettings>): void {
    const upsert = this.db.prepare(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    );
    const txn = this.db.transaction(() => {
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          upsert.run(key, String(value));
        }
      }
    });
    txn();
  }

  getUsageStats(): UsageStats {
    const totals = this.db.prepare(`
      SELECT
        COUNT(*) as total_missions,
        COALESCE(SUM(metrics_total_tokens), 0) as total_tokens,
        COALESCE(SUM(metrics_total_duration_ms), 0) as total_duration_ms,
        COALESCE(SUM(metrics_estimated_cost_usd), 0) as estimated_total_cost_usd,
        COALESCE(AVG(metrics_total_tokens), 0) as avg_tokens,
        COALESCE(AVG(metrics_total_duration_ms), 0) as avg_duration
      FROM missions
    `).get() as any;

    const byType = this.db.prepare(
      'SELECT type, COUNT(*) as count FROM missions GROUP BY type',
    ).all() as { type: string; count: number }[];

    const byStatus = this.db.prepare(
      'SELECT status, COUNT(*) as count FROM missions GROUP BY status',
    ).all() as { status: string; count: number }[];

    const missionsByType: Record<string, number> = {};
    for (const row of byType) missionsByType[row.type] = row.count;

    const missionsByStatus: Record<string, number> = {};
    for (const row of byStatus) missionsByStatus[row.status] = row.count;

    return {
      totalMissions: totals.total_missions,
      totalTokens: totals.total_tokens,
      totalDurationMs: totals.total_duration_ms,
      estimatedTotalCostUsd: totals.estimated_total_cost_usd,
      missionsByType: missionsByType as any,
      missionsByStatus: missionsByStatus as any,
      averageTokensPerMission: Math.round(totals.avg_tokens),
      averageDurationPerMission: Math.round(totals.avg_duration),
    };
  }

  getTokensByDay(days = 30): { date: string; tokens: number; type: string }[] {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.db.prepare(`
      SELECT
        DATE(created_at) as date,
        type,
        SUM(metrics_total_tokens) as tokens
      FROM missions
      WHERE created_at >= ?
      GROUP BY DATE(created_at), type
      ORDER BY date ASC
    `).all(since.toISOString()) as any[];
  }
}
