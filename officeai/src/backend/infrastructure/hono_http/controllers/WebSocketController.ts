import { RoomDebateUseCase } from '../../../../domain/usecases/RoomDebateUseCase';
import { IQueueService } from '../../../../domain/services/IQueueService';
import type { WSContext } from 'hono/ws';

interface WsPayload {
  room: string;
  event: string;
  status: string;
  data: any;
}

export class WebSocketController {
  constructor(
    private readonly roomDebateUseCase: RoomDebateUseCase,
    private readonly queueService: IQueueService
  ) {}

  public handleConnection(ws: WSContext) {
    console.log('New WebSocket connection established');

    this.queueService.subscribe('queue:processed_signals', (msgStr) => {
      try {
        const message = JSON.parse(msgStr);
        ws.send(JSON.stringify({
          room: message.roomId,
          event: 'agent_message',
          status: 'success',
          data: message
        }));
      } catch (e) {
        console.error('Error sending WS message', e);
      }
    });
  }

  public handleMessage(ws: WSContext, event: MessageEvent) {
    try {
      const payload: WsPayload = JSON.parse(event.data.toString());
      
      if (payload.event === 'trigger_debate') {
        console.log(`Triggering debate for room ${payload.room}`);
        this.roomDebateUseCase.execute(payload.room, payload.data.prompt).catch(err => {
          ws.send(JSON.stringify({
            room: payload.room,
            event: 'error',
            status: 'failed',
            data: err.message
          }));
        });
      }
    } catch (err) {
      console.error('Invalid WS Payload:', err);
    }
  }

  public handleClose(ws: WSContext) {
    console.log('WebSocket connection closed. Cleaning up ghost connection.');
  }
}

