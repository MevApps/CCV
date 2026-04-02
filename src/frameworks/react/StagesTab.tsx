'use client';
import type { Mission, StageName, StageStatus } from '@/domain';
import styles from './StagesTab.module.css';

const STATUS_ICONS: Record<StageStatus, string> = {
  completed: '\u2714', in_progress: '\u25CF', pending: '\u25CB', blocked: '\u26A0', skipped: '\u2014',
};
const STAGE_NAMES: Record<StageName, string> = {
  analysis: 'Analysis', design: 'Design', implementation: 'Implementation', review: 'Review', complete: 'Complete',
};

interface StagesTabProps { mission: Mission | null; }

export function StagesTab({ mission }: StagesTabProps) {
  if (!mission) return <div className={styles.empty}>No mission selected</div>;
  return (
    <div className={styles.stageList}>
      {mission.stages.map((stage) => (
        <div key={stage.name} className={`${styles.stageItem} ${styles[stage.status]}`}>
          <span className={styles.statusIcon}>{STATUS_ICONS[stage.status]}</span>
          <div className={styles.stageInfo}>
            <div className={styles.stageName}>{STAGE_NAMES[stage.name]}</div>
            <div className={styles.stageMeta}>
              {stage.tasks.length} tasks
              {stage.assignedMembers.length > 0 && (
                <span className={styles.assignees}>
                  {stage.assignedMembers.map((role) => (
                    <span key={role} className={styles.memberDot} style={{ background: `var(--ccv-team-${role})` }} />
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
