'use client';
import type { TeamMemberRole } from '@/domain';
import styles from './FeedMessage.module.css';

const ROLE_COLORS: Record<TeamMemberRole, string> = {
  architect: 'var(--ccv-team-architect)',
  developer: 'var(--ccv-team-developer)',
  qa: 'var(--ccv-team-qa)',
  reviewer: 'var(--ccv-team-reviewer)',
  product: 'var(--ccv-team-product)',
  learner: 'var(--ccv-team-learner)',
};

interface UserMessageProps { content: string; }

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className={styles.userRow}>
      <div className={styles.userBubble} role="article">{content}</div>
    </div>
  );
}

interface AgentMessageProps {
  role: TeamMemberRole;
  status: 'working' | 'done' | 'idle';
  content: string;
  timestamp?: string;
  artifacts?: Array<{ id: string; filename: string; lineCount: number; fileType: string }>;
  terminalOutput?: string[];
  onArtifactClick?: (id: string) => void;
}

export function AgentMessage({
  role, status, content, timestamp, artifacts = [], terminalOutput = [], onArtifactClick,
}: AgentMessageProps) {
  const color = ROLE_COLORS[role];
  const initial = role.charAt(0).toUpperCase();

  return (
    <div className={styles.agentRow} role="article">
      <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, transparent))` }}>
        <span className={styles.avatarLetter}>{initial}</span>
        <span className={`${styles.avatarStatus} ${styles[`status-${status}`]}`} />
      </div>
      <div className={styles.agentBody}>
        <div className={styles.agentHeader}>
          <span className={styles.roleLabel} style={{ color }}>{role.toUpperCase()}</span>
          {timestamp && <span className={styles.timestamp}>{timestamp}</span>}
        </div>
        <div className={styles.agentContent}>{content}</div>
        {artifacts.length > 0 && (
          <div className={styles.artifacts}>
            {artifacts.map((a) => (
              <button key={a.id} className={styles.artifactCard} onClick={() => onArtifactClick?.(a.id)}>
                <span className={styles.artifactIcon}>{'\u2B1A'}</span>
                <span className={styles.artifactName}>{a.filename}</span>
                <span className={styles.artifactMeta}>{a.lineCount} lines {'\u00B7'} {a.fileType}</span>
                <span className={styles.artifactArrow}>{'\u2192'}</span>
              </button>
            ))}
          </div>
        )}
        {terminalOutput.length > 0 && (
          <div className={styles.terminalEmbed}>
            {terminalOutput.map((line, i) => (
              <div key={i} className={styles.terminalLine}>{line}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
