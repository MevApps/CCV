/**
 * WebSocketHandler — bridges the EventEmitter to WebSocket clients.
 *
 * Protocol:
 *   Client → Server:
 *     { type: 'subscribe', missionId: string }
 *     { type: 'unsubscribe', missionId: string }
 *
 *   Server → Client:
 *     AppEvent objects (cli_output, stage_update, metrics_update, etc.)
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { EventEmitter, AppEvent } from '@/use-cases/ports';

interface ClientState {
  subscriptions: Map<string, () => void>; // missionId → unsubscribe fn
}

export class WebSocketHandler {
  private wss: WebSocketServer;
  private clients = new Map<WebSocket, ClientState>();

  constructor(private eventEmitter: EventEmitter) {
    this.wss = new WebSocketServer({ noServer: true });
    this.wss.on('connection', (ws) => this.handleConnection(ws));
  }

  handleUpgrade(request: IncomingMessage, socket: any, head: Buffer): void {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws, request);
    });
  }

  private handleConnection(ws: WebSocket): void {
    const state: ClientState = { subscriptions: new Map() };
    this.clients.set(ws, state);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        this.handleClientMessage(ws, state, msg);
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      // Clean up all subscriptions
      for (const unsub of state.subscriptions.values()) {
        unsub();
      }
      this.clients.delete(ws);
    });
  }

  private handleClientMessage(
    ws: WebSocket,
    state: ClientState,
    msg: { type: string; missionId?: string },
  ): void {
    switch (msg.type) {
      case 'subscribe': {
        if (!msg.missionId || state.subscriptions.has(msg.missionId)) return;

        const unsub = this.eventEmitter.subscribe(msg.missionId, (event) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(event));
          }
        });
        state.subscriptions.set(msg.missionId, unsub);
        break;
      }

      case 'unsubscribe': {
        if (!msg.missionId) return;
        const unsub = state.subscriptions.get(msg.missionId);
        if (unsub) {
          unsub();
          state.subscriptions.delete(msg.missionId);
        }
        break;
      }
    }
  }

  broadcast(event: AppEvent): void {
    const data = JSON.stringify(event);
    for (const [ws] of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }

  getConnectionCount(): number {
    return this.clients.size;
  }
}
