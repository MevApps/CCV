'use client';

import { useEffect, useState } from 'react';
import type { MissionMetrics, TeamMemberRole } from '@/domain';
import type { TeamMemberAssignment } from '@/domain';
import { useAnimatedNumber } from './useAnimatedNumber';
import styles from './MetricsSidebar.module.css';

const TEAM_COLORS: Record<TeamMemberRole, string> = {
  architect: 'var(--ccv-team-architect)',
  developer: 'var(--ccv-team-developer)',
  qa:        'var(--ccv-team-qa)',
  reviewer:  'var(--ccv-team-reviewer)',
  product:   'var(--ccv-team-product)',
  learner:   'var(--ccv-team-learner)',
};

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}

function formatCost(usd: number): string {
  if (usd < 0.01) return '<$0.01';
  return `$${usd.toFixed(2)}`;
}

function LiveTimer({ startTime, isLive }: { startTime: number; isLive: boolean }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isLive]);

  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>Elapsed Time</div>
      <div className={styles.metricValue}>{formatDuration(isLive ? elapsed : 0)}</div>
    </div>
  );
}

function TokenCounter({
  metrics,
  tokenBudget,
}: {
  metrics: MissionMetrics;
  tokenBudget: number | null;
}) {
  const animatedTokens = useAnimatedNumber(metrics.totalTokens);
  const percentage = tokenBudget ? (animatedTokens / tokenBudget) * 100 : 0;
  const budgetClass = percentage > 90 ? styles.danger : percentage > 70 ? styles.warning : '';

  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>Tokens Used</div>
      <div className={styles.metricValue}>{formatTokens(animatedTokens)}</div>
      {tokenBudget && (
        <div className={styles.budgetBar}>
          <div className={styles.budgetTrack}>
            <div
              className={`${styles.budgetFill} ${budgetClass}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className={styles.budgetLabels}>
            <span>{formatTokens(metrics.totalTokens)}</span>
            <span>{formatTokens(tokenBudget)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const animatedCompleted = useAnimatedNumber(completed);
  const animatedTotal = useAnimatedNumber(total);
  const percentage = animatedTotal > 0 ? (animatedCompleted / animatedTotal) * 100 : 0;

  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>Tasks</div>
      <div className={styles.metricValue}>{animatedCompleted} / {animatedTotal}</div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TeamActivityFeed({
  teamMembers,
}: {
  teamMembers: readonly TeamMemberAssignment[];
}) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>Team Activity</div>
      <div className={styles.activityFeed}>
        {teamMembers.map((tm) => (
          <div key={tm.member.role} className={styles.activityItem}>
            <span
              className={`${styles.activityDot} ${tm.status === 'working' ? styles.working : ''}`}
              style={{ background: TEAM_COLORS[tm.member.role] }}
            />
            <div className={styles.activityContent}>
              <div
                className={styles.activityRole}
                style={{ color: TEAM_COLORS[tm.member.role] }}
              >
                {tm.member.displayName}
              </div>
              {tm.currentTask && (
                <div className={styles.activityTask}>{tm.currentTask}</div>
              )}
              <div className={styles.activityStatus}>
                {tm.status} {tm.tasksCompleted > 0 && `\u00B7 ${tm.tasksCompleted} done`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MetricsSidebarProps {
  metrics: MissionMetrics;
  isLive: boolean;
  tokenBudget: number | null;
  teamMembers: readonly TeamMemberAssignment[];
  startTime: number;
}

export function MetricsSidebar({
  metrics,
  isLive,
  tokenBudget,
  teamMembers,
  startTime,
}: MetricsSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <LiveTimer startTime={startTime} isLive={isLive} />
      <TokenCounter metrics={metrics} tokenBudget={tokenBudget} />
      <TaskProgress
        completed={metrics.completedTaskCount}
        total={metrics.taskCount}
      />
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Estimated Cost</div>
        <div className={styles.costValue}>{formatCost(metrics.estimatedCostUsd)}</div>
      </div>
      <TeamActivityFeed teamMembers={teamMembers} />
    </aside>
  );
}
