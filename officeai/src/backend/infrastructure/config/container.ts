import { createContainer, asClass, InjectionMode } from 'awilix';
import { SupabaseMessageRepository } from '../services/SupabaseMessageRepository';
import { RedisQueueService } from '../services/RedisQueueService';
import { DualAiService } from '../services/DualAiService';
import { RoomDebateUseCase } from '../../domain/usecases/RoomDebateUseCase';

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC
});

container.register({
  // Infrastructure
  messageRepository: asClass(SupabaseMessageRepository).singleton(),
  queueService: asClass(RedisQueueService).singleton(),
  aiService: asClass(DualAiService).singleton(),
  
  // Use Cases
  roomDebateUseCase: asClass(RoomDebateUseCase).singleton()
});
