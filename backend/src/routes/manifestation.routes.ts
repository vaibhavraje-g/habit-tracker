import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/index.js';
import { Manifestation } from '../models/Manifestation.js';

const router = Router();

// GET /api/manifestations
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const manifestations = await Manifestation.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(manifestations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manifestations' });
  }
});

// POST /api/manifestations
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { affirmation, technique } = req.body;

    if (!affirmation || !technique) {
      res.status(400).json({ error: 'Affirmation and technique are required' });
      return;
    }

    const manifestation = new Manifestation({
      userId: req.userId,
      affirmation,
      technique,
    });

    await manifestation.save();
    res.status(201).json(manifestation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create manifestation' });
  }
});

// POST /api/manifestations/:id/practice - Log a practice session
router.post('/:id/practice', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { period, durationSeconds } = req.body;
    const manifestation = await Manifestation.findOne({ _id: req.params.id, userId: req.userId });

    if (!manifestation) {
      res.status(404).json({ error: 'Manifestation not found' });
      return;
    }

    // Update 3-6-9 progress if applicable
    if (manifestation.technique === '3-6-9' && period) {
      if (!manifestation.progress369) {
        manifestation.progress369 = { morning: false, afternoon: false, evening: false };
      }
      if (period === 'morning') manifestation.progress369.morning = true;
      if (period === 'afternoon') manifestation.progress369.afternoon = true;
      if (period === 'evening') manifestation.progress369.evening = true;

      // Update streak if all three are complete
      if (manifestation.progress369.morning && manifestation.progress369.afternoon && manifestation.progress369.evening) {
        manifestation.streak += 1;
        // Reset for next day
        manifestation.progress369 = { morning: false, afternoon: false, evening: false };
      }
    } else {
      // For visualization, just update streak
      manifestation.streak += 1;
    }

    manifestation.lastPracticed = new Date();
    if (durationSeconds) {
      manifestation.durationSeconds = durationSeconds;
    }

    await manifestation.save();
    res.json(manifestation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log practice' });
  }
});

// DELETE /api/manifestations/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const manifestation = await Manifestation.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!manifestation) {
      res.status(404).json({ error: 'Manifestation not found' });
      return;
    }

    res.json({ message: 'Manifestation deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete manifestation' });
  }
});

export default router;
