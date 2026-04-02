/**
 * SqliteMissionRepo — implements MissionRepository port with SQLite.
 *
 * Handles serialization/deserialization between domain entities
 * and relational tables.
 */

import type Database from 'better-sqlite3';
import type { Mission, MissionStatus, Stage, StageTask, TeamMemberAssignment, MissionMetrics } from '@/domain';
import type { MissionRepository, MissionFilter } from '@/use-cases/ports';

export class SqliteMissionRepo implements MissionRepository {
  constructor(private db: Database.Database) {}

  async save(mission: Mission): Promise<void> {
    const txn = this.db.transaction(() => {
      // Upsert mission
      this.db.prepare(`
        INSERT OR REPLACE INTO missions (
          id, type, title, description, status, parent_mission_id, tags,
          context_working_directory, context_target_files, context_constraints, context_model,
          metrics_total_tokens, metrics_input_tokens, metrics_output_tokens,
          metrics_total_duration_ms, metrics_task_count, metrics_completed_task_count,
          metrics_failed_task_count, metrics_estimated_cost_usd,
          created_at, updated_at, completed_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?,
          ?, ?, ?
        )
      `).run(
        mission.id, mission.type, mission.title, mission.description,
        mission.status, mission.parentMissionId, JSON.stringify(mission.tags),
        mission.context.workingDirectory, JSON.stringify(mission.context.targetFiles),
        JSON.stringify(mission.context.constraints), mission.context.model,
        mission.metrics.totalTokens, mission.metrics.inputTokens, mission.metrics.outputTokens,
        mission.metrics.totalDurationMs, mission.metrics.taskCount,
        mission.metrics.completedTaskCount, mission.metrics.failedTaskCount,
        mission.metrics.estimatedCostUsd,
        mission.createdAt.toISOString(), mission.updatedAt.toISOString(),
        mission.completedAt?.toISOString() ?? null,
      );

      // Delete existing stages/tasks/assignments and re-insert
      this.db.prepare('DELETE FROM stages WHERE mission_id = ?').run(mission.id);
      this.db.prepare('DELETE FROM team_assignments WHERE mission_id = ?').run(mission.id);

      const insertStage = this.db.prepare(`
        INSERT INTO stages (mission_id, name, status, started_at, completed_at, output, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const insertTask = this.db.prepare(`
        INSERT INTO stage_tasks (id, stage_id, mission_id, description, assigned_to, status, output, tokens_used, duration_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      mission.stages.forEach((stage, idx) => {
        const result = insertStage.run(
          mission.id, stage.name, stage.status,
          stage.startedAt?.toISOString() ?? null,
          stage.completedAt?.toISOString() ?? null,
          stage.output, idx,
        );
        const stageId = result.lastInsertRowid;

        for (const task of stage.tasks) {
          insertTask.run(
            task.id, stageId, mission.id,
            task.description, task.assignedTo, task.status,
            task.output, task.tokensUsed, task.durationMs,
          );
        }
      });

      const insertAssignment = this.db.prepare(`
        INSERT INTO team_assignments (
          mission_id, role, display_name, responsibilities, color,
          status, current_task, tasks_completed, tokens_used, started_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const ta of mission.teamMembers) {
        insertAssignment.run(
          mission.id, ta.member.role, ta.member.displayName,
          JSON.stringify(ta.member.responsibilities), ta.member.color,
          ta.status, ta.currentTask, ta.tasksCompleted, ta.tokensUsed,
          ta.startedAt?.toISOString() ?? null,
          ta.completedAt?.toISOString() ?? null,
        );
      }
    });

    txn();
  }

  async findById(id: string): Promise<Mission | null> {
    const row = this.db.prepare('SELECT * FROM missions WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.hydrate(row);
  }

  async findAll(filter: MissionFilter): Promise<Mission[]> {
    let query: string;
    const params: any[] = [];

    if (filter.search) {
      // Use FTS5 for full-text search
      query = `
        SELECT m.* FROM missions m
        INNER JOIN missions_fts fts ON m.rowid = fts.rowid
        WHERE missions_fts MATCH ?
      `;
      params.push(filter.search);
    } else {
      query = 'SELECT * FROM missions WHERE 1=1';
    }

    if (filter.status?.length) {
      query += ` AND status IN (${filter.status.map(() => '?').join(',')})`;
      params.push(...filter.status);
    }

    if (filter.type?.length) {
      query += ` AND type IN (${filter.type.map(() => '?').join(',')})`;
      params.push(...filter.type);
    }

    if (filter.since) {
      query += ' AND created_at >= ?';
      params.push(filter.since.toISOString());
    }

    const sortCol = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      tokenCount: 'metrics_total_tokens',
    }[filter.sortBy ?? 'createdAt'];
    const sortDir = filter.sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortCol} ${sortDir}`;

    if (filter.limit) {
      query += ' LIMIT ?';
      params.push(filter.limit);
    }

    if (filter.offset) {
      query += ' OFFSET ?';
      params.push(filter.offset);
    }

    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((row) => this.hydrate(row));
  }

  async delete(id: string): Promise<void> {
    this.db.prepare('DELETE FROM missions WHERE id = ?').run(id);
  }

  async updateStatus(id: string, status: MissionStatus): Promise<void> {
    const now = new Date().toISOString();
    const completedAt = status === 'completed' ? now : null;

    this.db.prepare(`
      UPDATE missions SET status = ?, updated_at = ?, completed_at = COALESCE(?, completed_at)
      WHERE id = ?
    `).run(status, now, completedAt, id);
  }

  private hydrate(row: any): Mission {
    const stages = this.db.prepare(
      'SELECT * FROM stages WHERE mission_id = ? ORDER BY sort_order',
    ).all(row.id) as any[];

    const stageEntities: Stage[] = stages.map((s) => {
      const tasks = this.db.prepare(
        'SELECT * FROM stage_tasks WHERE stage_id = ?',
      ).all(s.id) as any[];

      const taskEntities: StageTask[] = tasks.map((t) => ({
        id: t.id,
        description: t.description,
        assignedTo: t.assigned_to,
        status: t.status,
        output: t.output,
        tokensUsed: t.tokens_used,
        durationMs: t.duration_ms,
      }));

      return {
        name: s.name,
        status: s.status,
        assignedMembers: [],
        tasks: taskEntities,
        startedAt: s.started_at ? new Date(s.started_at) : null,
        completedAt: s.completed_at ? new Date(s.completed_at) : null,
        output: s.output,
      };
    });

    const assignments = this.db.prepare(
      'SELECT * FROM team_assignments WHERE mission_id = ?',
    ).all(row.id) as any[];

    const teamMembers: TeamMemberAssignment[] = assignments.map((a) => ({
      member: {
        role: a.role,
        displayName: a.display_name,
        responsibilities: JSON.parse(a.responsibilities),
        color: a.color,
      },
      status: a.status,
      currentTask: a.current_task,
      tasksCompleted: a.tasks_completed,
      tokensUsed: a.tokens_used,
      startedAt: a.started_at ? new Date(a.started_at) : null,
      completedAt: a.completed_at ? new Date(a.completed_at) : null,
    }));

    const metrics: MissionMetrics = {
      totalTokens: row.metrics_total_tokens,
      inputTokens: row.metrics_input_tokens,
      outputTokens: row.metrics_output_tokens,
      totalDurationMs: row.metrics_total_duration_ms,
      taskCount: row.metrics_task_count,
      completedTaskCount: row.metrics_completed_task_count,
      failedTaskCount: row.metrics_failed_task_count,
      teamBreakdown: [],
      stageBreakdown: [],
      estimatedCostUsd: row.metrics_estimated_cost_usd,
    };

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      status: row.status,
      stages: stageEntities,
      teamMembers,
      metrics,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
      parentMissionId: row.parent_mission_id,
      tags: JSON.parse(row.tags),
      context: {
        workingDirectory: row.context_working_directory,
        targetFiles: JSON.parse(row.context_target_files),
        constraints: JSON.parse(row.context_constraints),
        model: row.context_model,
      },
    };
  }
}
