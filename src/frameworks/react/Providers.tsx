'use client';

import { useWebSocket } from './useWebSocket';
import { ThemeProvider } from './ThemeProvider';

/**
 * Providers — initializes client-side services.
 *
 * WebSocket connection starts here and feeds events
 * into the Zustand store for the entire app.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize WebSocket connection
  useWebSocket();

  return <ThemeProvider>{children}</ThemeProvider>;
}
