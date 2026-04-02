/**
 * GenerateRetrospective use case — the Learner team member's job.
 *
 * After a mission completes, analyzes what happened and extracts
 * patterns for future improvement. Stores results in the mission's
 * learner assignment output.
 */

import type { Mission } from '@/domain';
import type { MissionRepository, CliExecutor, EventEmitter } from './ports';

export interface Retrospective {
  missionId: string;
  summary: string;
  wentWell: string[];
  toImprove: string[];
  patterns: string[];
  suggestions: string[];
  generatedAt: Date;
}

export class GenerateRetrospective {
  constructor(
    private missionRepo: MissionRepository,
    private cliExecutor: CliExecutor,
    private eventEmitter: EventEmitter,
  ) {}

  async execute(missionId: string): Promise<Retrospective> {
    const mission = await this.missionRepo.findById(missionId);
    if (!mission) throw new Error(`Mission not found: ${missionId}`);

    // Build a retrospective prompt from mission data
    const prompt = this.buildRetrospectivePrompt(mission);

    let retrospectiveText = '';

    try {
      for await (const event of this.cliExecutor.execute({
        prompt,
        workingDirectory: mission.context.workingDirectory || process.cwd(),
        model: mission.context.model || 'claude-sonnet-4-6',
        constraints: [],
        maxTokens: 2000,
      })) {
        if (event.type === 'output' && event.stream === 'stdout') {
          retrospectiveText += event.content;

          this.eventEmitter.emit({
            type: 'cli_output',
            missionId,
            content: event.content,
            stream: 'stdout',
            source: 'learner',
            timestamp: new Date(),
          });
        }
      }
    } catch {
      // If CLI fails, generate a basic retrospective from available data
      retrospectiveText = this.generateFallbackRetrospective(mission);
    }

    const retrospective = this.parseRetrospective(missionId, retrospectiveText, mission);
    return retrospective;
  }

  private buildRetrospectivePrompt(mission: Mission): string {
    const teamSummary = mission.teamMembers
      .map((tm) => `- ${tm.member.displayName}: ${tm.tasksCompleted} tasks, ${tm.tokensUsed} tokens, status: ${tm.status}`)
      .join('\n');

    const stageSummary = mission.stages
      .map((s) => `- ${s.name}: ${s.status}, ${s.tasks.length} tasks`)
      .join('\n');

    return `You are a retrospective analyst. Analyze this completed mission and provide insights.

Mission: "${mission.title}" (type: ${mission.type})
Status: ${mission.status}
Description: ${mission.description}

Team Performance:
${teamSummary}

Stage Progress:
${stageSummary}

Metrics:
- Total tokens: ${mission.metrics.totalTokens}
- Duration: ${Math.round(mission.metrics.totalDurationMs / 1000)}s
- Tasks: ${mission.metrics.completedTaskCount}/${mission.metrics.taskCount} completed
- Failed: ${mission.metrics.failedTaskCount}
- Estimated cost: $${mission.metrics.estimatedCostUsd.toFixed(2)}

Provide a brief retrospective with:
1. SUMMARY: One paragraph overview
2. WENT WELL: 2-3 bullet points
3. TO IMPROVE: 2-3 bullet points
4. PATTERNS: Any recurring patterns noticed
5. SUGGESTIONS: Specific improvements for future similar missions`;
  }

  private generateFallbackRetrospective(mission: Mission): string {
    const completionRate = mission.metrics.taskCount > 0
      ? Math.round((mission.metrics.completedTaskCount / mission.metrics.taskCount) * 100)
      : 0;

    const wentWell = [];
    const toImprove = [];

    if (mission.status === 'completed') wentWell.push('Mission completed successfully');
    if (completionRate > 80) wentWell.push(`High task completion rate (${completionRate}%)`);
    if (mission.metrics.failedTaskCount === 0) wentWell.push('No task failures');

    if (mission.status === 'failed') toImprove.push('Mission did not complete — investigate root cause');
    if (completionRate < 50) toImprove.push(`Low completion rate (${completionRate}%) — consider breaking into smaller tasks`);
    if (mission.metrics.failedTaskCount > 0) toImprove.push(`${mission.metrics.failedTaskCount} tasks failed — review error handling`);

    return `SUMMARY: Mission "${mission.title}" (${mission.type}) finished with status ${mission.status}. ${completionRate}% of tasks completed.
WENT WELL: ${wentWell.join('. ') || 'N/A'}
TO IMPROVE: ${toImprove.join('. ') || 'N/A'}
PATTERNS: First mission of this type — no patterns yet.
SUGGESTIONS: Continue iterating on ${mission.type} missions to build pattern data.`;
  }

  private parseRetrospective(missionId: string, text: string, mission: Mission): Retrospective {
    // Simple section-based parsing
    const sections = {
      summary: '',
      wentWell: [] as string[],
      toImprove: [] as string[],
      patterns: [] as string[],
      suggestions: [] as string[],
    };

    let currentSection = 'summary';
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const upper = trimmed.toUpperCase();
      if (upper.startsWith('SUMMARY')) { currentSection = 'summary'; continue; }
      if (upper.startsWith('WENT WELL')) { currentSection = 'wentWell'; continue; }
      if (upper.startsWith('TO IMPROVE')) { currentSection = 'toImprove'; continue; }
      if (upper.startsWith('PATTERN')) { currentSection = 'patterns'; continue; }
      if (upper.startsWith('SUGGESTION')) { currentSection = 'suggestions'; continue; }

      const cleaned = trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
      if (currentSection === 'summary') {
        sections.summary += (sections.summary ? ' ' : '') + cleaned;
      } else {
        (sections[currentSection as keyof typeof sections] as string[]).push(cleaned);
      }
    }

    // Fallback if parsing yielded nothing useful
    if (!sections.summary) {
      sections.summary = `Mission "${mission.title}" completed with status ${mission.status}.`;
    }

    return {
      missionId,
      summary: sections.summary,
      wentWell: sections.wentWell.length > 0 ? sections.wentWell : ['Mission data recorded'],
      toImprove: sections.toImprove.length > 0 ? sections.toImprove : ['No specific improvements identified'],
      patterns: sections.patterns,
      suggestions: sections.suggestions,
      generatedAt: new Date(),
    };
  }
}
