import { z } from 'zod';
import type { LLMProvider, Message, GenerateOptions, ProviderConfig } from './provider.js';

// OpenAI provider - implement when needed
export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4o-mini';
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
        stop: options?.stopSequences,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateChat(messages: Message[], options?: GenerateOptions): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: GenerateOptions
  ): Promise<T> {
    const structuredPrompt = `${prompt}

Respond with valid JSON only. No markdown or other formatting.`;

    const response = await this.generateText(structuredPrompt, {
      ...options,
      temperature: options?.temperature ?? 0.3,
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    return schema.parse(JSON.parse(jsonMatch[0]));
  }
}
