'use client';

import { useEffect, useState } from 'react';
import type { AccountSettings, UsageStats } from '@/domain';
import styles from './AccountPopup.module.css';

interface AccountData {
  settings: AccountSettings;
  usageStats: UsageStats;
  tokensByDay: { date: string; tokens: number; type: string }[];
}

function formatTokens(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

function formatCost(usd: number): string {
  if (usd < 0.01) return '<$0.01';
  return `$${usd.toFixed(2)}`;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

const TYPE_COLORS: Record<string, string> = {
  brainstorm: 'var(--ccv-type-brainstorm)',
  spec: 'var(--ccv-type-spec)',
  plan: 'var(--ccv-type-plan)',
  task: 'var(--ccv-type-task)',
  epic: 'var(--ccv-type-epic)',
  review: 'var(--ccv-type-review)',
  bug: 'var(--ccv-type-bug)',
  profiling: 'var(--ccv-type-profiling)',
};

function UsageChart({ data }: { data: { date: string; tokens: number; type: string }[] }) {
  if (data.length === 0) {
    return (
      <div style={{ color: 'var(--ccv-text-tertiary)', fontSize: 'var(--ccv-text-xs)', padding: 'var(--ccv-space-4) 0', textAlign: 'center' }}>
        No usage data yet
      </div>
    );
  }

  // Group by date, stack by type
  const byDate = new Map<string, Map<string, number>>();
  for (const item of data) {
    if (!byDate.has(item.date)) byDate.set(item.date, new Map());
    const types = byDate.get(item.date)!;
    types.set(item.type, (types.get(item.type) ?? 0) + item.tokens);
  }

  const dates = Array.from(byDate.keys()).sort();
  const maxTokens = Math.max(...dates.map((d) => {
    let sum = 0;
    for (const v of byDate.get(d)!.values()) sum += v;
    return sum;
  }));

  return (
    <div>
      <div className={styles.chart}>
        {dates.map((date) => {
          const types = byDate.get(date)!;
          let total = 0;
          for (const v of types.values()) total += v;
          const height = maxTokens > 0 ? (total / maxTokens) * 100 : 0;
          // Use the dominant type's color
          let dominantType = 'task';
          let maxTypeTokens = 0;
          for (const [t, v] of types) {
            if (v > maxTypeTokens) { dominantType = t; maxTypeTokens = v; }
          }

          return (
            <div
              key={date}
              className={styles.chartBar}
              style={{
                height: `${Math.max(height, 2)}%`,
                background: TYPE_COLORS[dominantType] ?? 'var(--ccv-accent-primary)',
              }}
              title={`${date}: ${formatTokens(total)} tokens`}
            />
          );
        })}
      </div>
      <div className={styles.chartLabels}>
        <span>{dates[0]}</span>
        <span>{dates[dates.length - 1]}</span>
      </div>
    </div>
  );
}

function SettingsPanel({
  settings,
  onUpdate,
}: {
  settings: AccountSettings;
  onUpdate: (updates: Partial<AccountSettings>) => void;
}) {
  return (
    <div>
      <div className={styles.settingRow}>
        <span className={styles.settingLabel}>Default Model</span>
        <input
          className={styles.settingInput}
          value={settings.defaultModel}
          onChange={(e) => onUpdate({ defaultModel: e.target.value })}
        />
      </div>
      <div className={styles.settingRow}>
        <span className={styles.settingLabel}>CLI Path</span>
        <input
          className={styles.settingInput}
          value={settings.cliPath}
          onChange={(e) => onUpdate({ cliPath: e.target.value })}
        />
      </div>
      <div className={styles.settingRow}>
        <span className={styles.settingLabel}>Port</span>
        <input
          className={styles.settingInput}
          type="number"
          value={settings.port}
          onChange={(e) => onUpdate({ port: Number(e.target.value) })}
        />
      </div>
      <div className={styles.settingRow}>
        <span className={styles.settingLabel}>Token Budget</span>
        <input
          className={styles.settingInput}
          type="number"
          placeholder="No limit"
          value={settings.tokenBudgetPerMission ?? ''}
          onChange={(e) => onUpdate({ tokenBudgetPerMission: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
      <div className={styles.settingRow}>
        <span className={styles.settingLabel}>Auto-open Browser</span>
        <button
          className={`${styles.toggleSwitch} ${settings.autoOpenBrowser ? styles.active : ''}`}
          onClick={() => onUpdate({ autoOpenBrowser: !settings.autoOpenBrowser })}
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>
      <div className={styles.configPath}>~/.ccv/data.db</div>
    </div>
  );
}

interface AccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountPopup({ isOpen, onClose }: AccountPopupProps) {
  const [data, setData] = useState<AccountData | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/account')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateSettings = async (updates: Partial<AccountSettings>) => {
    try {
      const res = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const newSettings = await res.json();
      setData((prev) => prev ? { ...prev, settings: newSettings } : null);
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <span className={styles.popupTitle}>Account</span>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        {data ? (
          <>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Usage</div>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{data.usageStats.totalMissions}</span>
                  <span className={styles.statLabel}>Total Missions</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{formatTokens(data.usageStats.totalTokens)}</span>
                  <span className={styles.statLabel}>Total Tokens</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{formatCost(data.usageStats.estimatedTotalCostUsd)}</span>
                  <span className={styles.statLabel}>Estimated Cost</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{formatDuration(data.usageStats.totalDurationMs)}</span>
                  <span className={styles.statLabel}>Total Time</span>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Token Consumption (30 days)</div>
              <UsageChart data={data.tokensByDay} />
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Settings</div>
              <SettingsPanel settings={data.settings} onUpdate={handleUpdateSettings} />
            </div>
          </>
        ) : (
          <div className={styles.section} style={{ textAlign: 'center', color: 'var(--ccv-text-tertiary)' }}>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
