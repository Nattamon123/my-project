import Redis from 'ioredis';
import { IQueueService } from '../../domain/services/IQueueService';

export class RedisQueueService implements IQueueService {
  private publisher: Redis;
  private subscriber: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    // Use separate instances for pub and sub to avoid connection starvation
    this.publisher = new Redis(redisUrl, { retryStrategy: (times) => Math.min(times * 50, 2000) });
    this.subscriber = new Redis(redisUrl, { retryStrategy: (times) => Math.min(times * 50, 2000) });

    this.publisher.on('error', (err) => {
      console.error('[Redis Publisher] Connection Error:', err.message);
    });

    this.subscriber.on('error', (err) => {
      console.error('[Redis Subscriber] Connection Error:', err.message);
    });
  }

  async publish(channel: string, message: any): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel, (err, count) => {
      if (err) {
        console.error(`Failed to subscribe to ${channel}: %s`, err.message);
      } else {
        console.log(`Subscribed to ${channel}. Currently subscribed to ${count} channels.`);
      }
    });

    this.subscriber.on('message', (chan, msg) => {
      if (chan === channel) {
        callback(msg);
      }
    });
  }
}
