export interface IAiService {
  generateResponse(prompt: string, context?: string[]): Promise<string>;
}
