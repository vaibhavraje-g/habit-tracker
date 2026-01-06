import express from 'express';
import cors from 'cors';
import { env, validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorMiddleware, notFoundHandler } from './middleware/index.js';
import {
  authRoutes,
  dashboardRoutes,
  goalRoutes,
  manifestationRoutes,
  agentRoutes,
} from './routes/index.js';

// Validate environment variables
validateEnv();

const app = express();

// Middleware
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/manifestations', manifestationRoutes);
app.use('/api/agent', agentRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorMiddleware);

// Start server
async function start() {
  try {
    await connectDB();
    
    app.listen(env.port, () => {
      console.log(`
🚀 Ascend Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server:     http://localhost:${env.port}
🏥 Health:     http://localhost:${env.port}/health
🔐 Auth:       http://localhost:${env.port}/api/auth
🤖 Agent:      http://localhost:${env.port}/api/agent/chat
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
