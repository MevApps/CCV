'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MissionType, TeamMemberRole } from '@/domain';
import { DEFAULT_TEAM_BY_TYPE } from '@/domain';
import { useAppStore } from './store';
import { toMissionSummary } from '@/adapters/presenters/mission-presenter';
import styles from './CreateMissionView.module.css';

/** Per section 4.2: each type shows an icon and one-line description */
const MISSION_TYPES: {
  type: MissionType;
  icon: string;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    type: 'brainstorm',
    icon: '💡',
    label: 'Brainstorm',
    description: 'Generate and explore ideas with Architect, Product, and Developer',
    color: 'var(--ccv-type-brainstorm)',
  },
  {
    type: 'spec',
    icon: '📋',
    label: 'Spec',
    description: 'Write detailed specifications with Product, Architect, Developer, and QA',
    color: 'var(--ccv-type-spec)',
  },
  {
    type: 'plan',
    icon: '🗺',
    label: 'Plan',
    description: 'Design implementation plans with Architect, Product, and Developer',
    color: 'var(--ccv-type-plan)',
  },
  {
    type: 'task',
    icon: '⚡',
    label: 'Task',
    description: 'Execute a focused task with Developer, Reviewer, and QA',
    color: 'var(--ccv-type-task)',
  },
  {
    type: 'epic',
    icon: '🏔',
    label: 'Epic',
    description: 'Tackle a large initiative with the full team',
    color: 'var(--ccv-type-epic)',
  },
  {
    type: 'review',
    icon: '🔍',
    label: 'Review',
    description: 'Review code or architecture with Reviewer, QA, and Developer',
    color: 'var(--ccv-type-review)',
  },
  {
    type: 'bug',
    icon: '🐛',
    label: 'Bug',
    description: 'Diagnose and fix bugs with Developer, QA, and Reviewer',
    color: 'var(--ccv-type-bug)',
  },
  {
    type: 'profiling',
    icon: '📊',
    label: 'Profiling',
    description: 'Profile and optimize performance with Developer, Architect, and Learner',
    color: 'var(--ccv-type-profiling)',
  },
];

const TEAM_MEMBER_DISPLAY: Record<TeamMemberRole, { label: string; color: string }> = {
  architect: { label: 'Architect', color: 'var(--ccv-team-architect)' },
  developer: { label: 'Developer', color: 'var(--ccv-team-developer)' },
  qa:        { label: 'QA',        color: 'var(--ccv-team-qa)' },
  reviewer:  { label: 'Reviewer',  color: 'var(--ccv-team-reviewer)' },
  product:   { label: 'Product',   color: 'var(--ccv-team-product)' },
  learner:   { label: 'Learner',   color: 'var(--ccv-team-learner)' },
};

interface FormState {
  type: MissionType | null;
  title: string;
  description: string;
  workingDirectory: string;
  targetFiles: string;
  constraints: string;
  model: string;
}

function TypeSelector({
  selected,
  onSelect,
}: {
  selected: MissionType | null;
  onSelect: (type: MissionType) => void;
}) {
  return (
    <div className={styles.typeGrid}>
      {MISSION_TYPES.map((mt) => (
        <button
          key={mt.type}
          className={`${styles.typeOption} ${selected === mt.type ? styles.selected : ''}`}
          style={{ '--type-color': mt.color } as React.CSSProperties}
          onClick={() => onSelect(mt.type)}
        >
          <span className={styles.typeIcon}>{mt.icon}</span>
          <span className={styles.typeName}>{mt.label}</span>
          <span className={styles.typeDescription}>{mt.description}</span>
        </button>
      ))}
    </div>
  );
}

function TeamPreviewPanel({ roles }: { roles: TeamMemberRole[] }) {
  return (
    <div className={styles.teamPreview}>
      <div className={styles.teamPreviewTitle}>Team Members</div>
      <div className={styles.teamChips}>
        {roles.map((role) => {
          const display = TEAM_MEMBER_DISPLAY[role];
          return (
            <span
              key={role}
              className={styles.teamChip}
              style={{ '--chip-color': display.color } as React.CSSProperties}
            >
              <span className={styles.teamChipDot} />
              {display.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ConfirmationPanel({
  form,
  teamRoles,
  onConfirm,
  onCancel,
}: {
  form: FormState;
  teamRoles: TeamMemberRole[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const typeInfo = MISSION_TYPES.find((mt) => mt.type === form.type);

  return (
    <div className={styles.confirmationPanel}>
      <div className={styles.confirmTitle}>Confirm Launch</div>
      <div className={styles.confirmDetail}>
        <span>Type</span>
        <span className={styles.confirmDetailValue}>{typeInfo?.label}</span>
      </div>
      <div className={styles.confirmDetail}>
        <span>Team</span>
        <span className={styles.confirmDetailValue}>{teamRoles.length} members</span>
      </div>
      <div className={styles.confirmDetail}>
        <span>Model</span>
        <span className={styles.confirmDetailValue}>{form.model || 'default'}</span>
      </div>
      <div className={styles.confirmActions}>
        <button className={styles.confirmCancel} onClick={onCancel}>Cancel</button>
        <button className={styles.confirmLaunch} onClick={onConfirm}>Launch Mission</button>
      </div>
    </div>
  );
}

export function CreateMissionView() {
  const router = useRouter();
  const addMission = useAppStore((s) => s.addMission);

  const [form, setForm] = useState<FormState>({
    type: null,
    title: '',
    description: '',
    workingDirectory: '',
    targetFiles: '',
    constraints: '',
    model: '',
  });
  const [contextExpanded, setContextExpanded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamRoles = form.type ? DEFAULT_TEAM_BY_TYPE[form.type] : [];
  const canDispatch = form.type !== null && form.title.trim().length > 0 && !launching;

  const handleDispatch = () => {
    if (!canDispatch) return;
    setError(null);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setLaunching(true);
    setError(null);

    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          title: form.title.trim(),
          description: form.description,
          context: {
            workingDirectory: form.workingDirectory || undefined,
            targetFiles: form.targetFiles
              ? form.targetFiles.split(',').map((f) => f.trim()).filter(Boolean)
              : undefined,
            constraints: form.constraints
              ? form.constraints.split(',').map((c) => c.trim()).filter(Boolean)
              : undefined,
            model: form.model || undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create mission');
      }

      const mission = await res.json();
      // Rehydrate dates for the presenter
      mission.createdAt = new Date(mission.createdAt);
      mission.updatedAt = new Date(mission.updatedAt);
      addMission(toMissionSummary(mission));
      router.push(`/missions/${mission.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mission');
      setShowConfirmation(false);
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className={styles.createMission}>
      <h1 className={styles.pageTitle}>Create New Mission</h1>

      <TypeSelector
        selected={form.type}
        onSelect={(type) => setForm((prev) => ({ ...prev, type }))}
      />

      <div className={styles.formSection}>
        <div className={styles.formRow}>
          <label className={styles.formLabel}>Mission Title</label>
          <input
            type="text"
            className={styles.titleInput}
            placeholder="What should the team accomplish?"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.formLabel}>Description</label>
          <textarea
            className={styles.descriptionTextarea}
            placeholder="Describe the objective in detail. This is the briefing your AI team will work from..."
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div>
          <button
            className={styles.contextToggle}
            onClick={() => setContextExpanded(!contextExpanded)}
          >
            <span className={`${styles.contextArrow} ${contextExpanded ? styles.expanded : ''}`}>
              ▶
            </span>
            Advanced Context
          </button>

          {contextExpanded && (
            <div className={styles.contextFields}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Working Directory</label>
                <input
                  type="text"
                  className="ccv-input"
                  placeholder="/path/to/project"
                  value={form.workingDirectory}
                  onChange={(e) => setForm((prev) => ({ ...prev, workingDirectory: e.target.value }))}
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Target Files</label>
                <input
                  type="text"
                  className="ccv-input"
                  placeholder="src/auth.ts, src/api/routes.ts"
                  value={form.targetFiles}
                  onChange={(e) => setForm((prev) => ({ ...prev, targetFiles: e.target.value }))}
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Constraints</label>
                <input
                  type="text"
                  className="ccv-input"
                  placeholder="No breaking changes, maintain backwards compatibility"
                  value={form.constraints}
                  onChange={(e) => setForm((prev) => ({ ...prev, constraints: e.target.value }))}
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Model</label>
                <input
                  type="text"
                  className="ccv-input"
                  placeholder="claude-sonnet-4-6 (default)"
                  value={form.model}
                  onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          background: 'color-mix(in srgb, var(--ccv-status-blocked) 12%, transparent)',
          border: '1px solid var(--ccv-status-blocked)',
          borderRadius: 'var(--ccv-radius-md)',
          padding: 'var(--ccv-space-3) var(--ccv-space-4)',
          color: 'var(--ccv-status-blocked)',
          fontSize: 'var(--ccv-text-sm)',
          fontFamily: 'var(--ccv-font-mono)',
        }}>
          {error}
        </div>
      )}

      <div className={styles.bottomPanel}>
        {form.type && <TeamPreviewPanel roles={teamRoles} />}

        <div className={styles.dispatchArea}>
          {showConfirmation ? (
            <ConfirmationPanel
              form={form}
              teamRoles={teamRoles}
              onConfirm={handleConfirm}
              onCancel={() => setShowConfirmation(false)}
            />
          ) : (
            <button
              className={styles.dispatchButton}
              disabled={!canDispatch}
              onClick={handleDispatch}
            >
              {launching ? 'Launching...' : 'Launch Mission'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
