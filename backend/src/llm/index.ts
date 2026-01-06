import { env } from '../config/env.js';
import type { LLMProvider } from './provider.js';
import { GeminiProvider } from './gemini.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';

export type { LLMProvider, Message, GenerateOptions, ProviderConfig } from './provider.js';

let _provider: LLMProvider | null = null;

/**
 * Get the configured LLM provider instance (singleton)
 */
export function getLLMProvider(): LLMProvider {
  if (_provider) {
    return _provider;
  }

  switch (env.llmProvider) {
    case 'gemini':
      _provider = new GeminiProvider({ apiKey: env.geminiApiKey });
      break;
    case 'openai':
      _provider = new OpenAIProvider({ apiKey: env.openaiApiKey });
      break;
    case 'anthropic':
      _provider = new AnthropicProvider({ apiKey: env.anthropicApiKey });
      break;
    default:
      throw new Error(`Unknown LLM provider: ${env.llmProvider}`);
  }

  console.log(`✅ LLM Provider initialized: ${_provider.name}`);
  return _provider;
}

/**
 * Convenience export for direct usage
 * Usage: import { llm } from '../llm';
 *        const response = await llm.generateText('Hello');
 */
export const llm = {
  get provider() {
    return getLLMProvider();
  },
  generateText: (prompt: string, options?: Parameters<LLMProvider['generateText']>[1]) =>
    getLLMProvider().generateText(prompt, options),
  generateChat: (messages: Parameters<LLMProvider['generateChat']>[0], options?: Parameters<LLMProvider['generateChat']>[1]) =>
    getLLMProvider().generateChat(messages, options),
  generateStructured: <T>(prompt: string, schema: Parameters<LLMProvider['generateStructured']>[1], options?: Parameters<LLMProvider['generateStructured']>[2]) =>
    getLLMProvider().generateStructured<T>(prompt, schema, options),
};
