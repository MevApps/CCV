'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Mission } from '@/domain';
import { useAppStore } from './store';
import { MissionTopbar } from './MissionTopbar';
import { ActivityFeed } from './ActivityFeed';
import { AgentMessage } from './FeedMessage';
import { CompletionBanner } from './CompletionBanner';
import { ActionChips } from './ActionChips';
import { Composer } from './Composer';
import styles from './ActiveMissionView.module.css';

interface ActiveMissionViewProps {
  mission: Mission;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}

export function ActiveMissionView({ mission }: ActiveMissionViewProps) {
  const router = useRouter();
  const setActiveMission = useAppStore((s) => s.setActiveMission);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const terminalLines = useAppStore(
    (s) => s.realtime.streamingLines.get(mission.id) ?? [],
  );

  const isLive = mission.status === 'active';
  const isCompleted = mission.status === 'completed';

  useEffect(() => {
    setActiveMission(mission);
    return () => setActiveMission(null);
  }, [mission, setActiveMission]);

  useEffect(() => {
    if (isCompleted) {
      setRightPanelTab('team');
    }
  }, [isCompleted, setRightPanelTab]);

  const handlePause = async () => {
    await fetch(`/api/missions/${mission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paused' }),
    });
  };

  const handleCancel = async () => {
    await fetch(`/api/missions/${mission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
  };

  const handleMessage = (message: string) => {
    // Send mid-mission intervention via WebSocket
    console.log('Mid-mission message:', message);
  };

  return (
    <div className={styles.missionView}>
      <MissionTopbar
        type={mission.type}
        title={mission.title}
        status={mission.status}
        startTime={mission.createdAt.getTime()}
        onPause={isLive ? handlePause : undefined}
        onCancel={isLive ? handleCancel : undefined}
        onRetry={!isLive ? () => {} : undefined}
      />

      <ActivityFeed isStreaming={isLive}>
        {terminalLines.map((line) => {
          if (line.type === 'stage-transition' || line.source === 'system') {
            return null;
          }
          return (
            <AgentMessage
              key={line.id}
              role={line.source}
              status={isLive ? 'working' : 'done'}
              content={line.content}
            />
          );
        })}

        {isCompleted && (
          <CompletionBanner
            tasksCompleted={mission.metrics.completedTaskCount}
            totalTasks={mission.metrics.taskCount}
            totalDuration={formatDuration(mission.metrics.totalDurationMs)}
            totalTokens={formatTokens(mission.metrics.totalTokens)}
            estimatedCost={`$${mission.metrics.estimatedCostUsd.toFixed(2)}`}
            filesChanged={0}
            onViewRetro={() => setRightPanelTab('team')}
            onNewMission={() => router.push('/')}
            onViewFiles={() => setRightPanelTab('code')}
          />
        )}
      </ActivityFeed>

      <div className={styles.composerArea}>
        <div className={styles.composerWrapper}>
          {isLive && <ActionChips chips={[
            { label: 'Skip stage', onClick: () => {} },
            { label: 'Add constraint', onClick: () => {} },
            { label: 'Change model', onClick: () => {} },
            { label: 'Attach file', onClick: () => {} },
          ]} />}
          <Composer
            variant="mission"
            placeholder={
              isCompleted
                ? 'Mission completed. Ask follow-ups or start a new mission...'
                : 'Redirect, correct, or add context...'
            }
            onSubmit={handleMessage}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
}
