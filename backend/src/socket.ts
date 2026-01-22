import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { createAgent } from './agent/index.js';
import { Goal } from './models/Goal.js';
import { Manifestation } from './models/Manifestation.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
}

export function setupSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      socket.userName = user.name;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 User connected: ${socket.userName} (${socket.id})`);

    // Handle agent messages
    socket.on('agent:message', async (data: { message: string; context?: any }) => {
      try {
        const { message } = data;
        
        if (!message || typeof message !== 'string') {
          socket.emit('agent:error', { error: 'Message is required' });
          return;
        }

        // Emit that we're processing
        socket.emit('agent:thinking', { message: 'Processing your request...' });

        // Create agent and process
        const agent = createAgent(socket.userId!);
        const result = await agent.processMessage(message);

        // Fetch updated data
        const [goals, manifestations, user] = await Promise.all([
          Goal.find({ userId: socket.userId }).sort({ createdAt: -1 }),
          Manifestation.find({ userId: socket.userId }).sort({ createdAt: -1 }),
          User.findById(socket.userId),
        ]);

        // Emit response
        socket.emit('agent:response', {
          message: result.message,
          actions: result.actions,
          updatedData: {
            score: user?.score,
            history: user?.history,
            goals: goals.map((g) => ({
              id: g._id.toString(),
              title: g.title,
              subtitle: g.subtitle,
              icon: g.icon,
              progress: g.progress,
              sparkline: g.sparkline,
              colorTheme: g.colorTheme,
              status: g.status,
            })),
            manifestations: manifestations.map((m) => ({
              id: m._id.toString(),
              affirmation: m.affirmation,
              technique: m.technique,
              streak: m.streak,
              progress369: m.progress369,
            })),
          },
        });

      } catch (error) {
        console.error('Agent socket error:', error);
        socket.emit('agent:error', { 
          error: 'Failed to process your request',
          message: "I couldn't understand that. Could you try again?"
        });
      }
    });

    // Handle typing indicator
    socket.on('agent:typing', () => {
      socket.emit('agent:listening', { status: 'listening' });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userName} (${socket.id})`);
    });
  });

  return io;
}
