import { IMessageRepository } from '../repositories/IMessageRepository';
import { IQueueService } from '../services/IQueueService';
import { IAiService } from '../services/IAiService';
import { RoomState } from '../enum/RoomState';
import { Message } from '../entities/Message';

export class RoomDebateUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly queueService: IQueueService,
    private readonly aiService: IAiService
  ) {}

  async execute(roomId: string, triggerMessage: string): Promise<void> {
    const room = await this.messageRepository.getRoomState(roomId);
    
    if (!room || room.state === RoomState.IDLE) {
      console.log(`Room ${roomId} is idle or not found. Halting debate.`);
      return;
    }

    if (room.currentRound >= 2) {
      console.log(`Room ${roomId} reached max debate rounds. Halting to prevent token bleeding.`);
      return;
    }

    // Get previous context
    const history = await this.messageRepository.getMessagesByRoom(roomId, 5);
    const historyContext = history.map(h => `${h.agentId}: ${h.content}`);

    try {
      // Generate AI Response
      const response = await this.aiService.generateResponse(triggerMessage, historyContext);
      
      const newMessage: Message = {
        id: crypto.randomUUID(),
        roomId,
        agentId: 'agent-1',
        content: response,
        timestamp: Date.now()
      };

      await this.messageRepository.saveMessage(newMessage);

      // Increment round
      room.currentRound += 1;
      await this.messageRepository.saveRoomState(room);

      // Publish to processed signals for the WebSocket to broadcast
      await this.queueService.publish('queue:processed_signals', newMessage);

    } catch (error) {
      console.error(`Error in debate loop for room ${roomId}:`, error);
      throw error;
    }
  }
}
