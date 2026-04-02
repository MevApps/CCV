'use client';

import { useWebSocket } from './useWebSocket';

/**
 * Providers — initializes client-side services.
 *
 * WebSocket connection starts here and feeds events
 * into the Zustand store for the entire app.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize WebSocket connection
  useWebSocket();

  return <>{children}</>;
}
