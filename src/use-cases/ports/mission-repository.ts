/**
 * MissionRepository port — persistence contract.
 *
 * The use case layer doesn't know if it's SQLite, JSON files,
 * or PostgreSQL. This interface is the boundary.
 */

import type { Mission, MissionStatus, MissionType } from '@/domain';

export interface MissionFilter {
  status?: MissionStatus[];
  type?: MissionType[];
  search?: string;
  since?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'tokenCount';
  sortOrder?: 'asc' | 'desc';
}

export interface MissionRepository {
  save(mission: Mission): Promise<void>;
  findById(id: string): Promise<Mission | null>;
  findAll(filter: MissionFilter): Promise<Mission[]>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: MissionStatus): Promise<void>;
}
