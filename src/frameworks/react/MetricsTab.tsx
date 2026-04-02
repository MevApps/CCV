'use client';
import type { Mission } from '@/domain';
import styles from './MetricsTab.module.css';

interface MetricsTabProps { mission: Mission | null; }

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function MetricsTab({ mission }: MetricsTabProps) {
  if (!mission) return <div className={styles.empty}>No mission selected</div>;
  const { metrics } = mission;
  const budgetPercent = metrics.totalTokens > 0 ? Math.min(100, (metrics.totalTokens / 100000) * 100) : 0;

  return (
    <div className={styles.metrics}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>Elapsed Time</div>
        <div className={styles.cardValue}>{formatDuration(metrics.totalDurationMs)}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardLabel}>Tokens Used</div>
        <div className={styles.cardValue}>{formatTokens(metrics.totalTokens)}</div>
        <div className={styles.budgetBar}><div className={styles.budgetFill} style={{ width: `${budgetPercent}%` }} /></div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardLabel}>Task Progress</div>
        <div className={styles.cardValue}>{metrics.completedTaskCount}/{metrics.taskCount}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardLabel}>Estimated Cost</div>
        <div className={styles.cardValue}>${metrics.estimatedCostUsd.toFixed(2)}</div>
      </div>
    </div>
  );
}
