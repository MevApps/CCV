/**
 * CreateMission use case — creates a new mission entity
 * and persists it in draft status.
 */

import { v4 as uuid } from 'uuid';
import type { Mission, MissionType, MissionContext } from '@/domain';
import { DEFAULT_TEAM_BY_TYPE } from '@/domain';
import type { MissionRepository } from './ports';

interface CreateMissionInput {
  type: MissionType;
  title: string;
  description: string;
  context: MissionContext;
}

const TEAM_MEMBER_DEFINITIONS = {
  architect: {
    role: 'architect' as const,
    displayName: 'Architect',
    responsibilities: ['System design', 'Dependency analysis', 'Component structure', 'Interface definitions'],
    color: '#A78BFA',
  },
  developer: {
    role: 'developer' as const,
    displayName: 'Developer',
    responsibilities: ['Implementation', 'Code generation', 'Refactoring', 'Performance optimization'],
    color: '#34D399',
  },
  qa: {
    role: 'qa' as const,
    displayName: 'QA',
    responsibilities: ['Test generation', 'Edge case identification', 'Validation', 'Coverage analysis'],
    color: '#FBBF24',
  },
  reviewer: {
    role: 'reviewer' as const,
    displayName: 'Reviewer',
    responsibilities: ['Code review', 'Best practice enforcement', 'Security audit', 'Standards compliance'],
    color: '#60A5FA',
  },
  product: {
    role: 'product' as const,
    displayName: 'Product',
    responsibilities: ['Requirements validation', 'Priority alignment', 'Scope management', 'Acceptance criteria'],
    color: '#F472B6',
  },
  learner: {
    role: 'learner' as const,
    displayName: 'Learner',
    responsibilities: ['Retrospective analysis', 'Pattern extraction', 'Improvement suggestions'],
    color: '#FB923C',
  },
} as const;

export class CreateMission {
  constructor(private missionRepo: MissionRepository) {}

  async execute(input: CreateMissionInput): Promise<Mission> {
    const roles = DEFAULT_TEAM_BY_TYPE[input.type];

    const mission: Mission = {
      id: uuid(),
      type: input.type,
      title: input.title,
      description: input.description,
      status: 'draft',
      stages: [
        { name: 'analysis', status: 'pending', assignedMembers: [], tasks: [], startedAt: null, completedAt: null, output: '' },
        { name: 'design', status: 'pending', assignedMembers: [], tasks: [], startedAt: null, completedAt: null, output: '' },
        { name: 'implementation', status: 'pending', assignedMembers: [], tasks: [], startedAt: null, completedAt: null, output: '' },
        { name: 'review', status: 'pending', assignedMembers: [], tasks: [], startedAt: null, completedAt: null, output: '' },
        { name: 'complete', status: 'pending', assignedMembers: [], tasks: [], startedAt: null, completedAt: null, output: '' },
      ],
      teamMembers: roles.map((role) => ({
        member: TEAM_MEMBER_DEFINITIONS[role],
        status: 'idle',
        currentTask: null,
        tasksCompleted: 0,
        tokensUsed: 0,
        startedAt: null,
        completedAt: null,
      })),
      metrics: {
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalDurationMs: 0,
        taskCount: 0,
        completedTaskCount: 0,
        failedTaskCount: 0,
        teamBreakdown: [],
        stageBreakdown: [],
        estimatedCostUsd: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      parentMissionId: null,
      tags: [],
      context: input.context,
    };

    await this.missionRepo.save(mission);
    return mission;
  }
}
