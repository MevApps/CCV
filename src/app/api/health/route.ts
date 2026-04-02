/**
 * API Route: /api/health
 *
 * Checks CLI availability + system status.
 */

import { NextResponse } from 'next/server';
import { getContainer } from '@/composition-root';

export async function GET() {
  const { cliExecutor, wsHandler } = getContainer();

  const cliAvailable = await cliExecutor.isAvailable();

  return NextResponse.json({
    status: 'ok',
    cli: cliAvailable ? 'available' : 'not_found',
    wsConnections: wsHandler.getConnectionCount(),
    timestamp: new Date().toISOString(),
  });
}
