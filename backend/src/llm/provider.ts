import { z } from 'zod';

// Message types for chat
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Generation options
export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

// Base interface for all LLM providers
export interface LLMProvider {
  readonly name: string;

  /**
   * Generate text from a prompt
   */
  generateText(prompt: string, options?: GenerateOptions): Promise<string>;

  /**
   * Generate a response from chat messages
   */
  generateChat(messages: Message[], options?: GenerateOptions): Promise<string>;

  /**
   * Generate structured output that conforms to a Zod schema
   */
  generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: GenerateOptions
  ): Promise<T>;
}

// Provider configuration
export interface ProviderConfig {
  apiKey: string;
  model?: string;
}
