import { describe, it, expect } from 'vitest';
import { env, validateEnv } from '../config/env.js';

describe('Environment Configuration', () => {
  it('should load default port and frontend URL', () => {
    expect(env.port).toBeGreaterThan(0);
    expect(env.nodeEnv).toBeDefined();
    expect(typeof env.frontendUrl).toBe('string');
  });

  it('should have supported LLM provider configured', () => {
    expect(['gemini', 'openai', 'anthropic']).toContain(env.llmProvider);
  });

  it('should execute validateEnv without throwing in dev mode', () => {
    expect(() => validateEnv()).not.toThrow();
  });
});
