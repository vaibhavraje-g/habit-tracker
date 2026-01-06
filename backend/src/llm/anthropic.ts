import { z } from 'zod';
import type { LLMProvider, Message, GenerateOptions, ProviderConfig } from './provider.js';

// Anthropic provider - implement when needed
export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic';
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.apiKey = config.apiKey;
    this.model = config.model || 'claude-3-haiku-20240307';
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens ?? 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.content[0].text;
  }

  async generateChat(messages: Message[], options?: GenerateOptions): Promise<string> {
    // Extract system message if present
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens ?? 1024,
        system: systemMsg?.content,
        messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();
    return data.content[0].text;
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
