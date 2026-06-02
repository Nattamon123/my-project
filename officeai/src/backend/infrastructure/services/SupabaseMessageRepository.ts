import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { Message } from '../../domain/entities/Message';
import { Room } from '../../domain/entities/Room';
import { RoomState } from '../../domain/enum/RoomState';

export class SupabaseMessageRepository implements IMessageRepository {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase URL or Key is missing. Using dummy client for now.');
    }
    
    this.supabase = createClient(supabaseUrl || 'http://localhost', supabaseKey || 'dummy');
  }

  async saveMessage(message: Message): Promise<void> {
    const { error } = await this.supabase.from('messages').insert([message]);
    if (error) {
      console.error('Error saving message to Supabase:', error);
      throw error;
    }
  }

  async getMessagesByRoom(roomId: string, limit: number = 10): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('roomId', roomId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages from Supabase:', error);
      throw error;
    }

    // Return in chronological order
    return (data as Message[]).reverse();
  }

  async getRoomState(roomId: string): Promise<Room | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found, return default
        return {
          id: roomId,
          name: `Room ${roomId}`,
          state: RoomState.ACTIVE,
          currentRound: 0
        };
      }
      console.error('Error fetching room state:', error);
      throw error;
    }

    return data as Room;
  }

  async saveRoomState(room: Room): Promise<void> {
    const { error } = await this.supabase
      .from('rooms')
      .upsert([room]);

    if (error) {
      console.error('Error saving room state:', error);
      throw error;
    }
  }
}
