/**
 * InMemoryMissionRepository — implements MissionRepository port
 * with a simple in-memory Map. Replaced by SqliteMissionRepo in Sprint 4.
 */

import type { Mission, MissionStatus } from '@/domain';
import type { MissionRepository, MissionFilter } from '@/use-cases/ports';

export class InMemoryMissionRepository implements MissionRepository {
  private missions = new Map<string, Mission>();

  async save(mission: Mission): Promise<void> {
    this.missions.set(mission.id, mission);
  }

  async findById(id: string): Promise<Mission | null> {
    return this.missions.get(id) ?? null;
  }

  async findAll(filter: MissionFilter): Promise<Mission[]> {
    let results = Array.from(this.missions.values());

    if (filter.status?.length) {
      results = results.filter((m) => filter.status!.includes(m.status));
    }
    if (filter.type?.length) {
      results = results.filter((m) => filter.type!.includes(m.type));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q),
      );
    }
    if (filter.since) {
      results = results.filter((m) => m.createdAt >= filter.since!);
    }

    const sortBy = filter.sortBy ?? 'createdAt';
    const sortOrder = filter.sortOrder ?? 'desc';
    results.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortBy) {
        case 'updatedAt':
          aVal = a.updatedAt.getTime();
          bVal = b.updatedAt.getTime();
          break;
        case 'tokenCount':
          aVal = a.metrics.totalTokens;
          bVal = b.metrics.totalTokens;
          break;
        default:
          aVal = a.createdAt.getTime();
          bVal = b.createdAt.getTime();
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    if (filter.offset) {
      results = results.slice(filter.offset);
    }
    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  async delete(id: string): Promise<void> {
    this.missions.delete(id);
  }

  async updateStatus(id: string, status: MissionStatus): Promise<void> {
    const mission = this.missions.get(id);
    if (!mission) return;

    this.missions.set(id, {
      ...mission,
      status,
      updatedAt: new Date(),
      completedAt: status === 'completed' ? new Date() : mission.completedAt,
    });
  }
}
