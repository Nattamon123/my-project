import { Message } from '../entities/Message';
import { Room } from '../entities/Room';

export interface IMessageRepository {
  saveMessage(message: Message): Promise<void>;
  getMessagesByRoom(roomId: string, limit?: number): Promise<Message[]>;
  getRoomState(roomId: string): Promise<Room | null>;
  saveRoomState(room: Room): Promise<void>;
}
