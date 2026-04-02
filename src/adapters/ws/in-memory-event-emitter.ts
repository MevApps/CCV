/**
 * InMemoryEventEmitter — implements the EventEmitter port.
 *
 * Manages subscriptions and broadcasts domain events.
 * Used by both the CLI adapter (to emit events) and the
 * WebSocket handler (to forward them to clients).
 */

import type { EventEmitter, AppEvent } from '@/use-cases/ports';

type Listener = (event: AppEvent) => void;

export class InMemoryEventEmitter implements EventEmitter {
  private missionListeners = new Map<string, Set<Listener>>();
  private globalListeners = new Set<Listener>();

  emit(event: AppEvent): void {
    // Notify mission-specific subscribers
    const listeners = this.missionListeners.get(event.missionId);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }

    // Notify global subscribers
    for (const listener of this.globalListeners) {
      listener(event);
    }
  }

  subscribe(missionId: string, listener: Listener): () => void {
    if (!this.missionListeners.has(missionId)) {
      this.missionListeners.set(missionId, new Set());
    }
    this.missionListeners.get(missionId)!.add(listener);

    return () => {
      const set = this.missionListeners.get(missionId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.missionListeners.delete(missionId);
        }
      }
    };
  }

  subscribeAll(listener: Listener): () => void {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }
}
