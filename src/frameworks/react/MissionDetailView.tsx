'use client';

import { useState } from 'react';
import type { Mission, MissionType, MissionMetrics } from '@/domain';
import type { StageViewModel, TerminalLine } from '@/adapters/presenters/view-models';
import { TerminalPanel } from './TerminalPanel';
import { KanbanBoard } from './KanbanBoard';
import { TableView } from './TableView';
import { MetricsSidebar } from './MetricsSidebar';
import styles from './MissionDetailView.module.css';

const TYPE_COLORS: Record<MissionType, string> = {
  brainstorm: 'var(--ccv-type-brainstorm)',
  spec:       'var(--ccv-type-spec)',
  plan:       'var(--ccv-type-plan)',
  task:       'var(--ccv-type-task)',
  epic:       'var(--ccv-type-epic)',
  review:     'var(--ccv-type-review)',
  bug:        'var(--ccv-type-bug)',
  profiling:  'var(--ccv-type-profiling)',
};

interface MissionDetailViewProps {
  mission: Mission;
  stages: StageViewModel[];
  terminalLines: TerminalLine[];
  isStreaming: boolean;
}

export function MissionDetailView({
  mission,
  stages,
  terminalLines,
  isStreaming,
}: MissionDetailViewProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [terminalExpanded, setTerminalExpanded] = useState(false);

  const isLive = mission.status === 'active';
  const startTime = mission.createdAt.getTime();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={styles.missionDetail}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.missionTitle}>{mission.title}</h1>
          <span
            className={styles.missionTypeBadge}
            style={{ '--badge-color': TYPE_COLORS[mission.type] } as React.CSSProperties}
          >
            {mission.type}
          </span>
        </div>
        <div className={styles.controls}>
          {isLive && (
            <>
              <button className={styles.controlButton}>Pause</button>
              <button className={`${styles.controlButton} ${styles.danger}`}>Cancel</button>
            </>
          )}
          {mission.status === 'failed' && (
            <button className={styles.controlButton}>Retry</button>
          )}
        </div>
      </div>

      {/* Panels */}
      <div className={styles.panels}>
        <div className={styles.leftPanel}>
          {/* Terminal */}
          {terminalExpanded ? (
            <div className={styles.terminalExpanded}>
              <TerminalPanel
                lines={terminalLines}
                isStreaming={isStreaming}
                onCopy={handleCopy}
              />
            </div>
          ) : (
            <div className={styles.terminalCollapsed}>
              <button
                className={styles.terminalExpandBar}
                onClick={() => setTerminalExpanded(true)}
              >
                {isStreaming && (
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--ccv-status-active)',
                    display: 'inline-block',
                  }} />
                )}
                Terminal — {terminalLines.length} lines
                {terminalLines.length > 0 && ` — ${terminalLines[terminalLines.length - 1].content.slice(0, 60)}`}
              </button>
            </div>
          )}

          {/* View Toggle + Work Area */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'kanban' ? styles.active : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>

          <div className={styles.workArea}>
            {viewMode === 'kanban' ? (
              <KanbanBoard stages={stages} onTaskClick={() => {}} />
            ) : (
              <TableView stages={stages} onTaskClick={() => {}} />
            )}
          </div>
        </div>

        {/* Metrics Sidebar */}
        <MetricsSidebar
          metrics={mission.metrics}
          isLive={isLive}
          tokenBudget={null}
          teamMembers={mission.teamMembers}
          startTime={startTime}
        />
      </div>
    </div>
  );
}
