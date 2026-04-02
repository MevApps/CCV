/**
 * MissionPresenter — transforms domain entities into view models.
 *
 * Uncle Bob: This is the adapter layer's job. React components never
 * touch raw domain entities. A single presenter guarantees identical
 * data regardless of rendering mode (Kanban vs Table).
 *
 * Nielsen #4 (Consistency): Both views are rendered from the same
 * StageViewModel[] data, guaranteeing identical terminology.
 */

import type { Mission, TeamMemberRole, Stage } from '@/domain';
import type { MissionSummary, StageViewModel, StageTaskViewModel } from './view-models';

const TEAM_COLORS: Record<TeamMemberRole, string> = {
  architect: 'var(--ccv-team-architect)',
  developer: 'var(--ccv-team-developer)',
  qa:        'var(--ccv-team-qa)',
  reviewer:  'var(--ccv-team-reviewer)',
  product:   'var(--ccv-team-product)',
  learner:   'var(--ccv-team-learner)',
};

const STAGE_DISPLAY_NAMES: Record<string, string> = {
  analysis: 'Analysis',
  design: 'Design',
  implementation: 'Implementation',
  review: 'Review',
  complete: 'Complete',
};

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

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function toMissionSummary(mission: Mission): MissionSummary {
  const totalTasks = mission.metrics.taskCount;
  const completedTasks = mission.metrics.completedTaskCount;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeMembers = mission.teamMembers
    .filter((tm) => tm.status === 'working')
    .map((tm) => tm.member.role);

  return {
    id: mission.id,
    title: mission.title,
    type: mission.type,
    status: mission.status,
    progress,
    activeTeamMembers: activeMembers,
    tokenCount: mission.metrics.totalTokens,
    duration: formatDuration(mission.metrics.totalDurationMs),
    updatedAt: formatRelativeTime(mission.updatedAt),
  };
}

export function toStageViewModels(stages: readonly Stage[]): StageViewModel[] {
  return stages.map((stage) => {
    const memberRoles = new Set<TeamMemberRole>();
    for (const task of stage.tasks) {
      memberRoles.add(task.assignedTo);
    }

    const tasks: StageTaskViewModel[] = stage.tasks.map((task) => ({
      id: task.id,
      description: task.description,
      assignedTo: task.assignedTo,
      memberColor: TEAM_COLORS[task.assignedTo] ?? 'var(--ccv-text-tertiary)',
      status: task.status,
      tokens: task.tokensUsed > 0 ? formatTokens(task.tokensUsed) : '',
      duration: task.durationMs > 0 ? formatDuration(task.durationMs) : '',
    }));

    return {
      name: stage.name,
      displayName: STAGE_DISPLAY_NAMES[stage.name] ?? stage.name,
      status: stage.status,
      tasks,
      memberColors: Array.from(memberRoles).map((r) => TEAM_COLORS[r]),
    };
  });
}
