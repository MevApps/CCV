/**
 * Composition Root — the ONLY file that knows all layers.
 *
 * Wires concrete implementations to port interfaces.
 * No other file in the codebase instantiates adapters directly.
 */

import { SqliteMissionRepo } from '@/adapters/persistence/sqlite-mission-repo';
import { InMemoryEventEmitter } from '@/adapters/ws/in-memory-event-emitter';
import { ClaudeCliAdapter } from '@/adapters/cli/claude-cli-adapter';
import { WebSocketHandler } from '@/adapters/ws/ws-handler';
import { CreateMission } from '@/use-cases/create-mission';
import { ExecuteMission } from '@/use-cases/execute-mission';
import { SearchMissions } from '@/use-cases/search-missions';
import { ManageAccount } from '@/use-cases/manage-account';
import { GenerateRetrospective } from '@/use-cases/generate-retrospective';
import { getDb } from '@/frameworks/db/connection';

// Singleton container — survives across API route invocations
let container: ReturnType<typeof buildContainer> | null = null;

function buildContainer() {
  const db = getDb();
  const missionRepo = new SqliteMissionRepo(db);
  const eventEmitter = new InMemoryEventEmitter();
  const cliExecutor = new ClaudeCliAdapter();
  const wsHandler = new WebSocketHandler(eventEmitter);

  const createMission = new CreateMission(missionRepo);
  const executeMission = new ExecuteMission(missionRepo, cliExecutor, eventEmitter);
  const searchMissions = new SearchMissions(missionRepo);
  const manageAccount = new ManageAccount(db);
  const generateRetrospective = new GenerateRetrospective(missionRepo, cliExecutor, eventEmitter);

  return {
    db,
    missionRepo,
    eventEmitter,
    cliExecutor,
    wsHandler,
    createMission,
    executeMission,
    searchMissions,
    manageAccount,
    generateRetrospective,
  };
}

export function getContainer() {
  if (!container) {
    container = buildContainer();
  }
  return container;
}
