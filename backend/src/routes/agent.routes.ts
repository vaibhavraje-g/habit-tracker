import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/index.js';
import { createAgent } from '../agent/index.js';
import { Goal } from '../models/Goal.js';
import { Manifestation } from '../models/Manifestation.js';
import { User } from '../models/User.js';

const router = Router();

// POST /api/agent/chat - Main agent endpoint
router.post('/chat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const agent = createAgent(req.userId!);
    const result = await agent.processMessage(message);

    // Fetch updated data for UI refresh
    const [goals, manifestations, updatedUser] = await Promise.all([
      Goal.find({ userId: req.userId }).sort({ createdAt: -1 }),
      Manifestation.find({ userId: req.userId }).sort({ createdAt: -1 }),
      User.findById(req.userId),
    ]);

    res.json({
      message: result.message,
      actions: result.actions,
      updatedData: {
        score: updatedUser?.score || req.user!.score,
        history: updatedUser?.history || req.user!.history,
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
    console.error('Agent error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;
