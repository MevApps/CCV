'use client';

import { useState } from 'react';
import type { MissionType } from '@/domain';
import styles from './MissionTypePills.module.css';

const TYPE_CONFIG: Array<{
  type: MissionType;
  label: string;
  team: string;
  color: string;
  subSuggestions: string[];
}> = [
  { type: 'brainstorm', label: 'Brainstorm', team: 'Arch \u00B7 Dev', color: 'var(--ccv-type-brainstorm)',
    subSuggestions: ['Explore architecture options', 'Compare frameworks', 'Design data model', 'Evaluate trade-offs'] },
  { type: 'spec', label: 'Spec', team: 'Arch \u00B7 Prod', color: 'var(--ccv-type-spec)',
    subSuggestions: ['Write API spec', 'Define requirements', 'Create user stories', 'Document interfaces'] },
  { type: 'task', label: 'Task', team: 'Dev \u00B7 QA', color: 'var(--ccv-type-task)',
    subSuggestions: ['Implement endpoint', 'Refactor module', 'Add tests', 'Migration'] },
  { type: 'bug', label: 'Bug fix', team: 'Dev \u00B7 QA', color: 'var(--ccv-type-bug)',
    subSuggestions: ['Fix crash', 'Debug performance issue', 'Resolve data inconsistency', 'Fix UI regression'] },
  { type: 'epic', label: 'Epic', team: 'Arch \u00B7 Dev \u00B7 QA', color: 'var(--ccv-type-epic)',
    subSuggestions: ['Build feature end-to-end', 'Migrate system', 'Platform integration', 'New module'] },
  { type: 'review', label: 'Review', team: 'Rev \u00B7 QA', color: 'var(--ccv-type-review)',
    subSuggestions: ['Code review', 'Architecture review', 'Security audit', 'Performance review'] },
  { type: 'plan', label: 'Plan', team: 'Arch \u00B7 Prod', color: 'var(--ccv-type-plan)',
    subSuggestions: ['Sprint planning', 'Roadmap item', 'Technical design', 'Migration plan'] },
  { type: 'profiling', label: 'Profile', team: 'Dev', color: 'var(--ccv-type-profiling)',
    subSuggestions: ['Profile API latency', 'Memory usage analysis', 'Bundle size audit', 'Query optimization'] },
];

interface MissionTypePillsProps {
  onSelect: (prompt: string, type: MissionType) => void;
}

export function MissionTypePills({ onSelect }: MissionTypePillsProps) {
  const [expandedType, setExpandedType] = useState<MissionType | null>(null);

  const expanded = expandedType ? TYPE_CONFIG.find((c) => c.type === expandedType) : null;

  if (expanded) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => setExpandedType(null)}>
          \u2190 Back
        </button>
        <div className={styles.subSuggestions}>
          {expanded.subSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              className={styles.subPill}
              style={{ '--pill-color': expanded.color } as React.CSSProperties}
              onClick={() => onSelect(suggestion, expanded.type)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pills}>
        {TYPE_CONFIG.map((config) => (
          <button
            key={config.type}
            className={styles.pill}
            style={{ '--pill-color': config.color } as React.CSSProperties}
            onClick={() => setExpandedType(config.type)}
          >
            <span className={styles.pillDot} />
            <span className={styles.pillLabel}>{config.label}</span>
            <span className={styles.pillTeam}>{config.team}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
