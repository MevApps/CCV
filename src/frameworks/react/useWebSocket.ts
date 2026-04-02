'use client';

/**
 * WebSocket client hook — connects to /api/ws, feeds events into Zustand.
 *
 * Norman: real-time affordances (pulsing dots, live counters, streaming
 * terminal) are promises of immediacy. This hook delivers on them.
 *
 * Auto-reconnects with exponential backoff.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from './store';
import { v4 as uuid } from 'uuid';
import type { TeamMemberRole } from '@/domain';

interface WsEvent {
  type: string;
  missionId: string;
  [key: string]: any;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const subscribedMissionsRef = useRef<Set<string>>(new Set());

  const setWsConnected = useAppStore((s) => s.setWsConnected);
  const appendTerminalLine = useAppStore((s) => s.appendTerminalLine);
  const updateMissionStatus = useAppStore((s) => s.updateMissionStatus);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      reconnectAttemptRef.current = 0;

      // Re-subscribe to all missions
      for (const missionId of subscribedMissionsRef.current) {
        ws.send(JSON.stringify({ type: 'subscribe', missionId }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: WsEvent = JSON.parse(event.data);
        handleEvent(data);
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      wsRef.current = null;

      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
      reconnectAttemptRef.current++;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [setWsConnected, appendTerminalLine, updateMissionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEvent = useCallback((data: WsEvent) => {
    switch (data.type) {
      case 'cli_output':
        appendTerminalLine(data.missionId, {
          id: uuid(),
          content: data.content,
          timestamp: new Date(data.timestamp),
          source: (data.source as TeamMemberRole) ?? 'system',
          type: data.stream === 'stderr' ? 'stderr' : 'stdout',
        });
        break;

      case 'mission_status':
        updateMissionStatus(data.missionId, data.status);
        break;

      case 'stage_update':
        // Stage updates will be handled when we fetch the full mission
        break;

      case 'metrics_update':
        // Metrics updates will be handled when we fetch the full mission
        break;

      case 'team_activity':
        // Team activity will be handled when we fetch the full mission
        break;
    }
  }, [appendTerminalLine, updateMissionStatus]);

  const subscribe = useCallback((missionId: string) => {
    subscribedMissionsRef.current.add(missionId);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', missionId }));
    }
  }, []);

  const unsubscribe = useCallback((missionId: string) => {
    subscribedMissionsRef.current.delete(missionId);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', missionId }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { subscribe, unsubscribe };
}
