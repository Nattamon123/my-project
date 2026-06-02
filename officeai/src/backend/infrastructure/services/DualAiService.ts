import { IAiService } from '../../domain/services/IAiService';
import { RateLimitError } from '../../shared/errors/AppError';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

export class DualAiService implements IAiService {
  private geminiClient: GoogleGenAI;
  private groqClient: Groq;

  constructor() {
    this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });
    this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy' });
  }

  async generateResponse(prompt: string, context?: string[]): Promise<string> {
    const fullPrompt = context && context.length > 0 
      ? `Conversation History:\n${context.join('\n')}\n\nNew Input:\n${prompt}`
      : prompt;

    try {
      // Primary: Gemini 3.1 Flash-Lite
      const response = await this.geminiClient.models.generateContent({
        model: 'gemini-2.5-flash', // Using a standard flash model as fallback naming convention
        contents: fullPrompt,
      });
      
      return response.text || 'No response from Gemini';
    } catch (error: any) {
      // Handle 429 Too Many Requests
      if (error?.status === 429 || error?.message?.includes('429')) {
        console.warn('Gemini Rate Limit Exceeded (429). Falling back to Groq Llama 3.1 8B.');
        return this.fallbackToGroq(fullPrompt);
      }
      
      console.error('Error with Gemini API:', error);
      throw error;
    }
  }

  private async fallbackToGroq(prompt: string): Promise<string> {
    try {
      const completion = await this.groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
      });
      return completion.choices[0]?.message?.content || 'No response from Groq';
    } catch (error) {
      console.error('Error with Groq API:', error);
      throw new RateLimitError('Both primary and fallback AI services failed.');
    }
  }
}
