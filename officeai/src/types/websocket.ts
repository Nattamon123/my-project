export interface GlobalRoomState {
  roomId: string;
  targetX: number;
  targetY: number;
  animationState: 'idle' | 'walking' | 'slow_down';
  metrics: {
    activeDebates: number;
    stockPrices: Record<string, number>;
  };
}

export type WsClientPayload = 
  | { event: 'ROOM_ACTIVE'; roomId: string }
  | { event: 'ROOM_IDLE'; roomId: string }
  | { event: 'TRIGGER_DEBATE'; roomId: string; data: { prompt: string } }
  | { event: 'PLAYER_MOVE'; roomId: string; data: { targetX: number; targetY: number } };

export type WsServerPayload =
  | { event: 'STATE_UPDATE'; status: 'success'; data: GlobalRoomState }
  | { event: 'AGENT_MESSAGE'; status: 'success'; data: any }
  | { event: 'ERROR'; status: 'failed'; data: string };
