/**
 * TeamMember — represents an AI "team member" role.
 *
 * Maps to the user's mental model of a team: each member has a name,
 * a role, a color (for visual tracking), and defined responsibilities.
 */

import type { MissionType } from './mission';

export type TeamMemberRole =
  | 'architect'
  | 'developer'
  | 'qa'
  | 'reviewer'
  | 'product'
  | 'learner';

export interface TeamMember {
  readonly role: TeamMemberRole;
  readonly displayName: string;
  readonly responsibilities: readonly string[];
  readonly color: string;
}

export interface TeamMemberAssignment {
  readonly member: TeamMember;
  readonly status: 'idle' | 'working' | 'completed' | 'blocked';
  readonly currentTask: string | null;
  readonly tasksCompleted: number;
  readonly tokensUsed: number;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
}

/**
 * Default team composition by mission type.
 * Pre-selecting members based on type reduces cognitive load.
 */
export const DEFAULT_TEAM_BY_TYPE: Record<MissionType, TeamMemberRole[]> = {
  brainstorm:  ['architect', 'product', 'developer'],
  spec:        ['product', 'architect', 'developer', 'qa'],
  plan:        ['architect', 'product', 'developer'],
  task:        ['developer', 'reviewer', 'qa'],
  epic:        ['product', 'architect', 'developer', 'qa', 'reviewer'],
  review:      ['reviewer', 'qa', 'developer'],
  bug:         ['developer', 'qa', 'reviewer'],
  profiling:   ['developer', 'architect', 'learner'],
};
