import { RoomState } from '../enum/RoomState';

export interface Room {
  id: string;
  name: string;
  state: RoomState;
  currentRound: number;
}
