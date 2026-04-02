'use client';

import { useState } from 'react';
import type { StageViewModel, StageTaskViewModel } from '@/adapters/presenters/view-models';
import type { StageStatus } from '@/domain';
import styles from './TableView.module.css';

const STATUS_COLORS: Record<StageStatus, string> = {
  pending: 'var(--ccv-status-pending)',
  in_progress: 'var(--ccv-status-active)',
  completed: 'var(--ccv-status-complete)',
  blocked: 'var(--ccv-status-blocked)',
  skipped: 'var(--ccv-text-tertiary)',
};

const STAGE_DISPLAY: Record<string, string> = {
  analysis: 'Analysis',
  design: 'Design',
  implementation: 'Implementation',
  review: 'Review',
  complete: 'Complete',
};

interface FlatTask extends StageTaskViewModel {
  stageName: string;
  stageDisplayName: string;
}

type SortField = 'description' | 'assignedTo' | 'stage' | 'status' | 'tokens' | 'duration';

interface TableViewProps {
  stages: StageViewModel[];
  onTaskClick: (taskId: string) => void;
}

export function TableView({ stages, onTaskClick }: TableViewProps) {
  const [sortField, setSortField] = useState<SortField>('stage');
  const [sortAsc, setSortAsc] = useState(true);

  // Flatten all tasks from all stages
  const tasks: FlatTask[] = stages.flatMap((stage) =>
    stage.tasks.map((task) => ({
      ...task,
      stageName: stage.name,
      stageDisplayName: STAGE_DISPLAY[stage.name] ?? stage.name,
    })),
  );

  // Sort
  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'description': cmp = a.description.localeCompare(b.description); break;
      case 'assignedTo': cmp = a.assignedTo.localeCompare(b.assignedTo); break;
      case 'stage': cmp = a.stageName.localeCompare(b.stageName); break;
      case 'status': cmp = a.status.localeCompare(b.status); break;
      case 'tokens': cmp = a.tokens.localeCompare(b.tokens); break;
      case 'duration': cmp = a.duration.localeCompare(b.duration); break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return '';
    return sortAsc ? ' \u25B2' : ' \u25BC';
  };

  if (tasks.length === 0) {
    return <div className={styles.emptyTable}>No tasks yet</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort('description')}>
              Task<span className={styles.sortIcon}>{sortIcon('description')}</span>
            </th>
            <th onClick={() => handleSort('assignedTo')}>
              Assigned To<span className={styles.sortIcon}>{sortIcon('assignedTo')}</span>
            </th>
            <th onClick={() => handleSort('stage')}>
              Stage<span className={styles.sortIcon}>{sortIcon('stage')}</span>
            </th>
            <th onClick={() => handleSort('status')}>
              Status<span className={styles.sortIcon}>{sortIcon('status')}</span>
            </th>
            <th onClick={() => handleSort('tokens')}>
              Tokens<span className={styles.sortIcon}>{sortIcon('tokens')}</span>
            </th>
            <th onClick={() => handleSort('duration')}>
              Duration<span className={styles.sortIcon}>{sortIcon('duration')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => (
            <tr key={task.id} onClick={() => onTaskClick(task.id)} style={{ cursor: 'pointer' }}>
              <td>{task.description}</td>
              <td>
                <div className={styles.assigneeCell}>
                  <span className={styles.assigneeDot} style={{ background: task.memberColor }} />
                  {task.assignedTo}
                </div>
              </td>
              <td className={styles.stageCell}>{task.stageDisplayName}</td>
              <td>
                <div className={styles.statusCell}>
                  <span className={styles.statusDot} style={{ background: STATUS_COLORS[task.status] }} />
                  {task.status.replace('_', ' ')}
                </div>
              </td>
              <td>{task.tokens || '-'}</td>
              <td>{task.duration || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
