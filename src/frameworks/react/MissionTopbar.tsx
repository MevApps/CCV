'use client';

import { useEffect, useState } from 'react';
import type { MissionType, MissionStatus } from '@/domain';
import styles from './MissionTopbar.module.css';

interface MissionTopbarProps {
  type: MissionType;
  title: string;
  status: MissionStatus;
  startTime: number;
  onPause?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

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

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function MissionTopbar({
  type,
  title,
  status,
  startTime,
  onPause,
  onCancel,
  onRetry,
}: MissionTopbarProps) {
  const [elapsed, setElapsed] = useState(Date.now() - startTime);
  const isLive = status === 'active';

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(interval);
  }, [isLive, startTime]);

  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <span
          className={styles.typeBadge}
          style={{ '--badge-color': TYPE_COLORS[type] } as React.CSSProperties}
        >
          {type}
        </span>
      </div>

      <div className={styles.center}>
        <span className={styles.title}>{title}</span>
        <span className={styles.statusGroup}>
          {isLive && <span className={styles.liveDot} />}
          <span className={styles.statusText}>
            {status === 'completed' ? 'Completed' : status === 'active' ? 'Running' : status}
          </span>
          <span className={styles.elapsed}>{formatElapsed(elapsed)}</span>
        </span>
      </div>

      <div className={styles.right}>
        {isLive && (
          <>
            {onPause && (
              <button className={`${styles.controlBtn} ${styles.pauseBtn}`} onClick={onPause}>
                Pause
              </button>
            )}
            {onCancel && (
              <button className={`${styles.controlBtn} ${styles.cancelBtn}`} onClick={onCancel}>
                Cancel
              </button>
            )}
          </>
        )}
        {(status === 'completed' || status === 'failed') && onRetry && (
          <button className={`${styles.controlBtn} ${styles.retryBtn}`} onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
