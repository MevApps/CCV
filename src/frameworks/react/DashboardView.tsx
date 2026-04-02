'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { MissionSummary } from '@/adapters/presenters/view-models';
import type { MissionType, MissionStatus } from '@/domain';
import { useAppStore } from './store';
import { toMissionSummary } from '@/adapters/presenters/mission-presenter';
import styles from './DashboardView.module.css';

const TYPE_COLORS: Record<MissionType, string> = {
  brainstorm: 'var(--ccv-type-brainstorm)',
  spec: 'var(--ccv-type-spec)',
  plan: 'var(--ccv-type-plan)',
  task: 'var(--ccv-type-task)',
  epic: 'var(--ccv-type-epic)',
  review: 'var(--ccv-type-review)',
  bug: 'var(--ccv-type-bug)',
  profiling: 'var(--ccv-type-profiling)',
};

const STATUS_COLORS: Record<MissionStatus, string> = {
  draft: 'var(--ccv-status-pending)',
  active: 'var(--ccv-status-active)',
  paused: 'var(--ccv-status-paused)',
  completed: 'var(--ccv-status-complete)',
  failed: 'var(--ccv-status-blocked)',
  cancelled: 'var(--ccv-text-tertiary)',
};

function MetricsSummaryBar({
  activeMissions,
  completedToday,
  totalTokensToday,
  completionRate,
}: {
  activeMissions: number;
  completedToday: number;
  totalTokensToday: number;
  completionRate: number;
}) {
  return (
    <div className={styles.metricsBar}>
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Active Missions</div>
        <div className={styles.metricValue}>{activeMissions}</div>
      </div>
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Completed Today</div>
        <div className={styles.metricValue}>{completedToday}</div>
      </div>
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Tokens Today</div>
        <div className={styles.metricValue}>{formatTokenCount(totalTokensToday)}</div>
      </div>
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Completion Rate</div>
        <div className={styles.metricValue}>{completionRate}%</div>
      </div>
    </div>
  );
}

function MissionCard({ mission, onClick }: { mission: MissionSummary; onClick: () => void }) {
  return (
    <button className="ccv-card" onClick={onClick} style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--ccv-space-3)' }}>
        <span
          className="ccv-badge"
          style={{ '--badge-color': TYPE_COLORS[mission.type] } as React.CSSProperties}
        >
          {mission.type}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ccv-space-1)' }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: STATUS_COLORS[mission.status],
            display: 'inline-block',
          }} />
          <span style={{
            fontSize: 'var(--ccv-text-xs)',
            fontFamily: 'var(--ccv-font-mono)',
            color: 'var(--ccv-text-tertiary)',
            textTransform: 'uppercase',
          }}>
            {mission.status}
          </span>
        </span>
      </div>
      <div style={{
        fontSize: 'var(--ccv-text-sm)',
        fontWeight: 600,
        color: 'var(--ccv-text-primary)',
        marginBottom: 'var(--ccv-space-2)',
      }}>
        {mission.title}
      </div>
      <div style={{
        display: 'flex', gap: 'var(--ccv-space-4)',
        fontSize: 'var(--ccv-text-xs)',
        fontFamily: 'var(--ccv-font-mono)',
        color: 'var(--ccv-text-tertiary)',
      }}>
        <span>{formatTokenCount(mission.tokenCount)} tokens</span>
        <span>{mission.duration}</span>
        <span>{mission.updatedAt}</span>
      </div>
      {mission.progress > 0 && (
        <div style={{
          height: 3, borderRadius: 2, marginTop: 'var(--ccv-space-3)',
          background: 'var(--ccv-bg-tertiary)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2, width: `${mission.progress}%`,
            background: 'var(--ccv-status-active)',
            transition: 'width 300ms ease',
          }} />
        </div>
      )}
    </button>
  );
}

function EmptyState({ onCreateMission }: { onCreateMission: () => void }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{'\u25C7'}</div>
      <h2 className={styles.emptyTitle}>Welcome to Claude Code Visualizer</h2>
      <p className={styles.emptyDescription}>
        Dispatch AI teams to tackle your development missions.
        Watch them work in real-time with a visual Kanban board,
        live terminal output, and detailed metrics.
      </p>
      <div className={styles.emptySteps}>
        <div className={styles.emptyStep}>
          <div className={styles.stepNumber}>1</div>
          <span className={styles.stepLabel}>Create your first mission</span>
        </div>
        <div className={styles.emptyStep}>
          <div className={styles.stepNumber}>2</div>
          <span className={styles.stepLabel}>Watch your AI team work</span>
        </div>
        <div className={styles.emptyStep}>
          <div className={styles.stepNumber}>3</div>
          <span className={styles.stepLabel}>Review the results</span>
        </div>
      </div>
      <button className={styles.ctaButton} onClick={onCreateMission}>
        Create Your First Mission
      </button>
    </div>
  );
}

function formatTokenCount(count: number): string {
  if (count === 0) return '0';
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}

export function DashboardView() {
  const router = useRouter();
  const missions = useAppStore((s) => s.missions);
  const setMissions = useAppStore((s) => s.setMissions);

  // Fetch missions on mount
  useEffect(() => {
    fetch('/api/missions')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const summaries = data.map((m: any) => {
            m.createdAt = new Date(m.createdAt);
            m.updatedAt = new Date(m.updatedAt);
            if (m.completedAt) m.completedAt = new Date(m.completedAt);
            return toMissionSummary(m);
          });
          setMissions(summaries);
        }
      })
      .catch(console.error);
  }, [setMissions]);

  const activeMissions = missions.filter((m) => m.status === 'active');
  const recentMissions = missions.filter((m) => m.status !== 'active');
  const completedToday = missions.filter((m) => m.status === 'completed').length;
  const totalTokens = missions.reduce((sum, m) => sum + m.tokenCount, 0);
  const total = missions.length;
  const completed = missions.filter((m) => m.status === 'completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const isEmpty = missions.length === 0;

  return (
    <div className={styles.dashboard}>
      <MetricsSummaryBar
        activeMissions={activeMissions.length}
        completedToday={completedToday}
        totalTokensToday={totalTokens}
        completionRate={completionRate}
      />

      {isEmpty ? (
        <EmptyState onCreateMission={() => router.push('/missions/create')} />
      ) : (
        <>
          {activeMissions.length > 0 && (
            <section>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Active Missions</h2>
              </div>
              <div className={styles.missionsGrid}>
                {activeMissions.map((m) => (
                  <MissionCard
                    key={m.id}
                    mission={m}
                    onClick={() => router.push(`/missions/${m.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {recentMissions.length > 0 && (
            <section>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recent Missions</h2>
              </div>
              <div className={styles.missionsGrid}>
                {recentMissions.map((m) => (
                  <MissionCard
                    key={m.id}
                    mission={m}
                    onClick={() => router.push(`/missions/${m.id}`)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
