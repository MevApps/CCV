'use client';

/**
 * Global state store — Zustand.
 *
 * Uncle Bob: State management is a framework concern (outermost layer).
 * Domain logic never depends on this. Components read from here,
 * adapters write to here.
 *
 * Data flow is unidirectional:
 *   API/WS events → store update → React re-render → component props
 */

import { create } from 'zustand';
import type { MissionSummary, TerminalLine } from '@/adapters/presenters/view-models';
import type { Mission } from '@/domain';

interface UiState {
  sidebarCollapsed: boolean;
  missionDetailView: 'kanban' | 'table';
  searchQuery: string;
  theme: 'dark' | 'light' | 'system';
  rightPanelOpen: boolean;
  rightPanelTab: 'code' | 'stages' | 'metrics' | 'team';
}

interface RealtimeState {
  streamingLines: Map<string, TerminalLine[]>;
  wsConnected: boolean;
}

interface AppState {
  // Data
  missions: MissionSummary[];
  activeMission: Mission | null;

  // UI
  ui: UiState;

  // Realtime
  realtime: RealtimeState;

  // Actions — data
  setMissions: (missions: MissionSummary[]) => void;
  addMission: (mission: MissionSummary) => void;
  updateMissionStatus: (id: string, status: MissionSummary['status']) => void;
  setActiveMission: (mission: Mission | null) => void;

  // Actions — UI
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMissionDetailView: (view: 'kanban' | 'table') => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setRightPanelOpen: (open: boolean) => void;
  setRightPanelTab: (tab: 'code' | 'stages' | 'metrics' | 'team') => void;

  // Actions — realtime
  appendTerminalLine: (missionId: string, line: TerminalLine) => void;
  clearTerminalLines: (missionId: string) => void;
  setWsConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  missions: [],
  activeMission: null,
  ui: {
    sidebarCollapsed: false,
    missionDetailView: 'kanban',
    searchQuery: '',
    theme: 'dark',
    rightPanelOpen: true,
    rightPanelTab: 'stages',
  },
  realtime: {
    streamingLines: new Map(),
    wsConnected: false,
  },

  // Data actions
  setMissions: (missions) => set({ missions }),

  addMission: (mission) =>
    set((state) => ({ missions: [mission, ...state.missions] })),

  updateMissionStatus: (id, status) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id ? { ...m, status } : m,
      ),
    })),

  setActiveMission: (mission) => set({ activeMission: mission }),

  // UI actions
  setSidebarCollapsed: (collapsed) =>
    set((state) => ({ ui: { ...state.ui, sidebarCollapsed: collapsed } })),

  setMissionDetailView: (view) =>
    set((state) => ({ ui: { ...state.ui, missionDetailView: view } })),

  setSearchQuery: (query) =>
    set((state) => ({ ui: { ...state.ui, searchQuery: query } })),

  setTheme: (theme) =>
    set((state) => ({ ui: { ...state.ui, theme } })),

  setRightPanelOpen: (open) =>
    set((state) => ({ ui: { ...state.ui, rightPanelOpen: open } })),

  setRightPanelTab: (tab) =>
    set((state) => ({ ui: { ...state.ui, rightPanelTab: tab } })),

  // Realtime actions
  appendTerminalLine: (missionId, line) =>
    set((state) => {
      const newMap = new Map(state.realtime.streamingLines);
      const existing = newMap.get(missionId) ?? [];
      newMap.set(missionId, [...existing, line]);
      return { realtime: { ...state.realtime, streamingLines: newMap } };
    }),

  clearTerminalLines: (missionId) =>
    set((state) => {
      const newMap = new Map(state.realtime.streamingLines);
      newMap.delete(missionId);
      return { realtime: { ...state.realtime, streamingLines: newMap } };
    }),

  setWsConnected: (connected) =>
    set((state) => ({
      realtime: { ...state.realtime, wsConnected: connected },
    })),
}));
