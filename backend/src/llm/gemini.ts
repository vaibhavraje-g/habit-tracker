import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import type { LLMProvider, Message, GenerateOptions, ProviderConfig } from './provider.js';

export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini';
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-2.0-flash';
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
        stopSequences: options?.stopSequences,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  async generateChat(messages: Message[], options?: GenerateOptions): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: history as any,
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: GenerateOptions
  ): Promise<T> {
    const schemaDescription = JSON.stringify(zodToJsonSchema(schema), null, 2);
    
    const structuredPrompt = `${prompt}

Respond with valid JSON that matches this schema:
${schemaDescription}

Important: Return ONLY the JSON object, no markdown code blocks or other text.`;

    const response = await this.generateText(structuredPrompt, {
      ...options,
      temperature: options?.temperature ?? 0.3, // Lower temp for structured output
    });

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return schema.parse(parsed);
  }
}

// Simple Zod to JSON Schema converter for common types
function zodToJsonSchema(schema: z.ZodSchema<any>): object {
  const def = schema._def;
  
  if (def.typeName === 'ZodObject') {
    const shape = def.shape();
    const properties: Record<string, object> = {};
    const required: string[] = [];
    
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodSchema);
      if (!(value as any)._def?.isOptional) {
        required.push(key);
      }
    }
    
    return { type: 'object', properties, required };
  }
  
  if (def.typeName === 'ZodString') return { type: 'string' };
  if (def.typeName === 'ZodNumber') return { type: 'number' };
  if (def.typeName === 'ZodBoolean') return { type: 'boolean' };
  if (def.typeName === 'ZodArray') {
    return { type: 'array', items: zodToJsonSchema(def.type) };
  }
  if (def.typeName === 'ZodEnum') {
    return { type: 'string', enum: def.values };
  }
  if (def.typeName === 'ZodOptional') {
    return zodToJsonSchema(def.innerType);
  }
  
  return { type: 'string' }; // Fallback
}
