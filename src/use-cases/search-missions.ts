/**
 * SearchMissions use case — queries missions with filtering and full-text search.
 */

import type { Mission } from '@/domain';
import type { MissionRepository, MissionFilter } from './ports';

export class SearchMissions {
  constructor(private missionRepo: MissionRepository) {}

  async execute(filter: MissionFilter): Promise<Mission[]> {
    return this.missionRepo.findAll(filter);
  }
}
