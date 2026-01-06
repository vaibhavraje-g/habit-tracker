import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { env } from '../config/env.js';
import { authMiddleware } from '../middleware/index.js';
import { Goal } from '../models/Goal.js';
import { Manifestation } from '../models/Manifestation.js';

const router = Router();

// Generate JWT token
function generateToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save hook
    });
    await user.save();

    // Create default goals for new user
    await Goal.insertMany([
      {
        userId: user._id,
        title: 'Coding Challenge',
        icon: '💻',
        colorTheme: 'lime',
        targetPerWeek: 3,
      },
      {
        userId: user._id,
        title: 'Healthy Eating',
        icon: '🥗',
        colorTheme: 'emerald',
        targetPerWeek: 5,
      },
    ]);

    // Create default manifestation
    await Manifestation.create({
      userId: user._id,
      affirmation: 'I am becoming the best version of myself',
      technique: '3-6-9',
      streak: 0,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout (client-side token removal, but we can log it)
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  // In a production app, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  res.json({ user: req.user!.toJSON() });
});

// POST /api/auth/refresh
router.post('/refresh', authMiddleware, async (req: Request, res: Response) => {
  const token = generateToken(req.userId!);
  res.json({ token });
});

export default router;
