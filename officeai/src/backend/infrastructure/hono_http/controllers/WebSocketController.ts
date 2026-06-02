import { RoomDebateUseCase } from '@/backend/domain/usecases/RoomDebateUseCase';
import { IQueueService } from '@/backend/domain/services/IQueueService';
import type { WSContext } from 'hono/ws';
import { randomUUID } from 'crypto';
import { WsClientPayload, WsServerPayload } from '@/types/websocket';
import { WebSocketStateService } from '../services/WebSocketStateService';

export class WebSocketController {
  constructor(
    private readonly roomDebateUseCase: RoomDebateUseCase,
    private readonly queueService: IQueueService,
    private readonly stateService: WebSocketStateService
  ) { }

  public handleConnection(ws: WSContext) {
    // Generate a simple unique ID for the client
    const clientId = randomUUID();
    (ws as any).clientId = clientId;

    console.log(`[WebSocketController] New connection established: ${clientId}`);

    this.stateService.registerClient(clientId, ws);

    // Optional: Subscribe to global queue for processed signals to emit AGENT_MESSAGE
    this.queueService.subscribe('queue:processed_signals', (msgStr: string) => {
      try {
        const message = JSON.parse(msgStr);
        const payload: WsServerPayload = {
          event: 'AGENT_MESSAGE',
          status: 'success',
          data: message
        };
        ws.send(JSON.stringify(payload));
      } catch (e) {
        console.error('Error sending WS message', e);
      }
    });
  }

  public handleMessage(ws: WSContext, event: MessageEvent) {
    try {
      const payload: WsClientPayload = JSON.parse(event.data.toString());

      switch (payload.event) {
        case 'ROOM_ACTIVE':
          console.log(`[WebSocketController] Client ${(ws as any).clientId} set room ${payload.roomId} to ACTIVE`);
          this.stateService.updateClientRoomState(payload.roomId, true);
          break;
        case 'ROOM_IDLE':
          console.log(`[WebSocketController] Client ${(ws as any).clientId} set room ${payload.roomId} to IDLE`);
          this.stateService.updateClientRoomState(payload.roomId, false);
          break;
        case 'PLAYER_MOVE':
          this.stateService.updatePlayerPosition(payload.data.targetX, payload.data.targetY);
          break;
        case 'TRIGGER_DEBATE':
          console.log(`[WebSocketController] Triggering debate for room ${payload.roomId}`);
          this.roomDebateUseCase.execute(payload.roomId, payload.data.prompt).catch((err: Error) => {
            const errorPayload: WsServerPayload = {
              event: 'ERROR',
              status: 'failed',
              data: err.message
            };
            ws.send(JSON.stringify(errorPayload));
          });
          break;
        default:
          console.warn(`[WebSocketController] Unknown event: ${(payload as any).event}`);
      }
    } catch (err) {
      console.error('[WebSocketController] Invalid WS Payload:', err);
    }
  }

  public handleClose(ws: WSContext) {
    const clientId = (ws as any).clientId;
    console.log(`[WebSocketController] Connection closed: ${clientId}`);
    this.stateService.unregisterClient(clientId);
  }
}
