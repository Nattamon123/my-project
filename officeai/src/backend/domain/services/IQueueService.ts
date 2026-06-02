export interface IQueueService {
  publish(channel: string, message: any): Promise<void>;
  subscribe(channel: string, callback: (message: string) => void): Promise<void>;
}
