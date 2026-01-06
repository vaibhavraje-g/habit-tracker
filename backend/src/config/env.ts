import dotenv from 'dotenv';
dotenv.config();

export const env = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ascend',

  // Auth
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // LLM Provider
  llmProvider: (process.env.LLM_PROVIDER || 'gemini') as 'gemini' | 'openai' | 'anthropic',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
};

// Validate required env vars
export function validateEnv(): void {
  const required: string[] = [];
  
  if (env.nodeEnv === 'production') {
    if (!process.env.JWT_SECRET) required.push('JWT_SECRET');
    if (!process.env.MONGODB_URI) required.push('MONGODB_URI');
  }

  if (env.llmProvider === 'gemini' && !env.geminiApiKey) {
    required.push('GEMINI_API_KEY');
  }

  if (required.length > 0) {
    console.error('Missing required environment variables:', required.join(', '));
    if (env.nodeEnv === 'production') {
      process.exit(1);
    }
  }
}
