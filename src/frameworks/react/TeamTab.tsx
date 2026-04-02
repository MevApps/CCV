'use client';
import type { Mission, TeamMemberRole } from '@/domain';
import styles from './TeamTab.module.css';

const ROLE_COLORS: Record<TeamMemberRole, string> = {
  architect: 'var(--ccv-team-architect)', developer: 'var(--ccv-team-developer)',
  qa: 'var(--ccv-team-qa)', reviewer: 'var(--ccv-team-reviewer)',
  product: 'var(--ccv-team-product)', learner: 'var(--ccv-team-learner)',
};

interface TeamTabProps { mission: Mission | null; }

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}

export function TeamTab({ mission }: TeamTabProps) {
  if (!mission) return <div className={styles.empty}>No mission selected</div>;
  return (
    <div className={styles.team}>
      <div className={styles.roster}>
        {mission.teamMembers.map((tm) => {
          const color = ROLE_COLORS[tm.member.role];
          const initial = tm.member.role.charAt(0).toUpperCase();
          return (
            <div key={tm.member.role} className={styles.member}>
              <div className={styles.avatar} style={{ background: color }}>{initial}</div>
              <div className={styles.memberInfo}>
                <div className={styles.memberRole}>{tm.member.displayName}</div>
                <div className={styles.memberStatus}>
                  <span className={`${styles.statusDot} ${styles[`status-${tm.status}`]}`} />
                  {tm.status === 'working' ? tm.currentTask ?? 'Working' : tm.status}
                </div>
              </div>
              <div className={styles.memberTokens}>{formatTokens(tm.tokensUsed)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
