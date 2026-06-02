import type { WSContext } from 'hono/ws';
import { GlobalRoomState, WsServerPayload } from '../../../../types/websocket';

export class WebSocketStateService {
  private globalState: GlobalRoomState;
  private connectedClients: Map<string, WSContext>;
  private activeRooms: Set<string>;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private isThrottled: boolean = false;

  constructor() {
    // Initial State
    this.globalState = {
      roomId: 'room-1',
      targetX: 9 * 64, // Initial grid X
      targetY: 10 * 64, // Initial grid Y
      animationState: 'idle',
      metrics: {
        activeDebates: 0,
        stockPrices: {},
      },
    };
    this.connectedClients = new Map();
    this.activeRooms = new Set();
  }

  public registerClient(clientId: string, ws: WSContext) {
    this.connectedClients.set(clientId, ws);
    this.startBroadcastLoop();
  }

  public unregisterClient(clientId: string) {
    this.connectedClients.delete(clientId);
    if (this.connectedClients.size === 0) {
      this.stopBroadcastLoop();
    }
  }

  public updateClientRoomState(roomId: string, isActive: boolean) {
    if (isActive) {
      this.activeRooms.add(roomId);
    } else {
      this.activeRooms.delete(roomId);
    }
    
    // Throttling Logic
    const shouldThrottle = this.activeRooms.size === 0;
    if (this.isThrottled !== shouldThrottle) {
      this.isThrottled = shouldThrottle;
      console.log(`[WebSocketStateService] Throttling mode: ${this.isThrottled ? 'ON (Idle)' : 'OFF (Active)'}`);
      // Notify QueueService or Backend Workers to slow down here if needed
      // To simulate slow down animation
      if (this.isThrottled && this.globalState.animationState !== 'idle') {
        this.globalState.animationState = 'slow_down';
      } else {
        this.globalState.animationState = 'walking';
      }
    }
  }

  public updatePlayerPosition(targetX: number, targetY: number) {
    this.globalState.targetX = targetX;
    this.globalState.targetY = targetY;
    if (!this.isThrottled) {
        this.globalState.animationState = 'walking';
    }
  }

  private startBroadcastLoop() {
    if (this.broadcastInterval) return;

    // Tick Rate limits to 15Hz (approx 66ms)
    this.broadcastInterval = setInterval(() => {
      this.broadcastState();
    }, 66);
  }

  private stopBroadcastLoop() {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
  }

  private broadcastState() {
    if (this.connectedClients.size === 0) return;

    const payload: WsServerPayload = {
      event: 'STATE_UPDATE',
      status: 'success',
      data: this.globalState,
    };

    const message = JSON.stringify(payload);
    for (const [_, ws] of this.connectedClients) {
      if (ws.readyState === 1) { // 1 = OPEN
        try {
            ws.send(message);
        } catch (err) {
            console.error('Error broadcasting to client', err);
        }
      }
    }
  }
}
