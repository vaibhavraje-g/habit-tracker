import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/index.js';
import { User } from '../models/User.js';
import { Goal } from '../models/Goal.js';
import { Manifestation } from '../models/Manifestation.js';

const router = Router();

// Static data for sounds and breath patterns
const SOUNDS = [
  { id: 's1', title: 'Deep Work Gamma', frequency: '40Hz', category: 'Focus', isPlaying: false },
  { id: 's2', title: 'Universal Repair', frequency: '432Hz', category: 'Healing', isPlaying: false },
  { id: 's3', title: 'Theta Waves', frequency: '6Hz', category: 'Sleep', isPlaying: false },
  { id: 's4', title: 'Solfeggio Tone', frequency: '528Hz', category: 'Healing', isPlaying: false },
];

const BREATH_PATTERNS = [
  { id: 'b1', name: 'Box Breathing', description: 'Focus & Calm', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  { id: 'b2', name: '4-7-8 Relax', description: 'Sleep & Anxiety', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  { id: 'b3', name: 'Energy', description: 'Wake Up', inhale: 2, holdIn: 0, exhale: 1, holdOut: 0 },
];

// GET /api/dashboard - All data needed for initial load
router.get('/dashboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [goals, manifestations] = await Promise.all([
      Goal.find({ userId }).sort({ createdAt: -1 }),
      Manifestation.find({ userId }).sort({ createdAt: -1 }),
    ]);

    res.json({
      user: {
        name: req.user!.name,
        score: req.user!.score,
        history: req.user!.history,
      },
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
        durationSeconds: m.durationSeconds,
      })),
      sounds: SOUNDS,
      breathPatterns: BREATH_PATTERNS,
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/score/history
router.get('/score/history', authMiddleware, async (req: Request, res: Response) => {
  res.json({
    currentScore: req.user!.score,
    history: req.user!.history,
  });
});

export default router;
