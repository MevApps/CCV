'use client';

import type { StageViewModel, StageTaskViewModel } from '@/adapters/presenters/view-models';
import type { StageStatus } from '@/domain';
import styles from './KanbanBoard.module.css';

const STAGE_DISPLAY_NAMES: Record<string, string> = {
  analysis: 'Analysis',
  design: 'Design',
  implementation: 'Implementation',
  review: 'Review',
  complete: 'Complete',
};

function StatusIndicator({ status }: { status: StageStatus }) {
  switch (status) {
    case 'in_progress':
      return <span className={`${styles.statusIndicator} ${styles.statusActive}`}>&#x25E0;</span>;
    case 'completed':
      return <span className={`${styles.statusIndicator} ${styles.statusCompleted}`}>&#x2713;</span>;
    case 'blocked':
      return <span className={`${styles.statusIndicator} ${styles.statusBlocked}`}>&#x2717;</span>;
    case 'pending':
    default:
      return <span className={`${styles.statusIndicator} ${styles.statusPending}`}>&#x25CB;</span>;
  }
}

function TaskCard({
  task,
  onClick,
}: {
  task: StageTaskViewModel;
  onClick: (id: string) => void;
}) {
  return (
    <div className={styles.taskCard} onClick={() => onClick(task.id)}>
      <div className={styles.taskCardHeader}>
        <StatusIndicator status={task.status} />
      </div>
      <div className={styles.taskDescription}>{task.description}</div>
      <div className={styles.taskMeta}>
        <div
          className={styles.taskAssignee}
          style={{ color: task.memberColor }}
        >
          <span
            className={styles.assigneeDot}
            style={{ background: task.memberColor }}
          />
          {task.assignedTo}
        </div>
        <div className={styles.taskStats}>
          {task.tokens && <span>{task.tokens} tok</span>}
          {task.duration && <span>{task.duration}</span>}
        </div>
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  onTaskClick,
}: {
  stage: StageViewModel;
  onTaskClick: (taskId: string) => void;
}) {
  const isActive = stage.status === 'in_progress';

  return (
    <div className={styles.stageColumn}>
      <div className={`${styles.columnHeader} ${isActive ? styles.active : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={styles.columnName}>
            {STAGE_DISPLAY_NAMES[stage.name] ?? stage.name}
          </span>
          {stage.tasks.length > 0 && (
            <span className={styles.columnCount}>{stage.tasks.length}</span>
          )}
        </div>
        {stage.memberColors.length > 0 && (
          <div className={styles.columnMemberDots}>
            {stage.memberColors.map((color, i) => (
              <span
                key={i}
                className={styles.memberDot}
                style={{ background: color }}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.columnBody}>
        {stage.tasks.length === 0 ? (
          <div className={styles.emptyColumn}>No tasks</div>
        ) : (
          stage.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  stages: StageViewModel[];
  onTaskClick: (taskId: string) => void;
}

export function KanbanBoard({ stages, onTaskClick }: KanbanBoardProps) {
  return (
    <div className={styles.kanban}>
      {stages.map((stage) => (
        <StageColumn key={stage.name} stage={stage} onTaskClick={onTaskClick} />
      ))}
    </div>
  );
}
