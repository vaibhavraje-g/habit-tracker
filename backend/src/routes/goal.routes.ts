import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/index.js';
import { Goal } from '../models/Goal.js';

const router = Router();

// GET /api/goals
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// POST /api/goals
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, icon, colorTheme, targetPerWeek } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const goal = new Goal({
      userId: req.userId,
      title,
      icon: icon || '🎯',
      colorTheme: colorTheme || 'lime',
      targetPerWeek: targetPerWeek || 3,
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// PUT /api/goals/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// POST /api/goals/:id/complete - Mark goal as complete for today
router.post('/:id/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Update progress
    goal.completedThisWeek += 1;
    goal.progress = Math.min(100, Math.round((goal.completedThisWeek / (goal.targetPerWeek || 3)) * 100));
    
    // Update sparkline
    goal.sparkline = [...goal.sparkline.slice(1), goal.progress];
    
    if (goal.progress >= 100) {
      goal.status = 'completed';
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete goal' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
