/**
 * MetricsStore port — metrics persistence contract.
 */

import type { MissionMetrics } from '@/domain';

export interface MetricsStore {
  record(missionId: string, metrics: MissionMetrics): Promise<void>;
  getForMission(missionId: string): Promise<MissionMetrics | null>;
  getAggregate(): Promise<MissionMetrics>;
}
