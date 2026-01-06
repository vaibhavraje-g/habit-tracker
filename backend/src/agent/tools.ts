import { z } from 'zod';
import { Goal } from '../models/Goal.js';
import { Manifestation } from '../models/Manifestation.js';
import { User } from '../models/User.js';

// Tool result type
export interface ToolResult {
  success: boolean;
  data?: any;
  message: string;
}

// Tool execution context
export interface ToolContext {
  userId: string;
}

// Define all available tools
export const tools = {
  get_status: {
    name: 'get_status',
    description: 'Get current user status including score, active goals, and manifestations',
    parameters: z.object({}),
    execute: async (_params: {}, ctx: ToolContext): Promise<ToolResult> => {
      const user = await User.findById(ctx.userId);
      const goals = await Goal.find({ userId: ctx.userId, status: 'active' });
      const manifestations = await Manifestation.find({ userId: ctx.userId });

      return {
        success: true,
        data: {
          score: user?.score,
          activeGoals: goals.map((g) => ({
            title: g.title,
            progress: g.progress,
            completedThisWeek: g.completedThisWeek,
            targetPerWeek: g.targetPerWeek,
          })),
          manifestations: manifestations.map((m) => ({
            affirmation: m.affirmation,
            streak: m.streak,
          })),
        },
        message: `User has score ${user?.score}, ${goals.length} active goals, and ${manifestations.length} manifestations`,
      };
    },
  },

  complete_goal: {
    name: 'complete_goal',
    description: 'Mark a goal as complete for today',
    parameters: z.object({
      goalTitle: z.string().describe('The title or keyword of the goal to complete'),
    }),
    execute: async (params: { goalTitle: string }, ctx: ToolContext): Promise<ToolResult> => {
      // Find goal by fuzzy title match
      const goals = await Goal.find({ userId: ctx.userId, status: 'active' });
      const goal = goals.find((g) =>
        g.title.toLowerCase().includes(params.goalTitle.toLowerCase()) ||
        params.goalTitle.toLowerCase().includes(g.title.toLowerCase())
      );

      if (!goal) {
        return {
          success: false,
          message: `Could not find a goal matching "${params.goalTitle}"`,
        };
      }

      // Update goal
      goal.completedThisWeek += 1;
      goal.progress = Math.min(100, Math.round((goal.completedThisWeek / (goal.targetPerWeek || 3)) * 100));
      goal.sparkline = [...goal.sparkline.slice(1), goal.progress];
      
      if (goal.progress >= 100) {
        goal.status = 'completed';
      }
      await goal.save();

      // Update user score
      const user = await User.findById(ctx.userId);
      if (user) {
        user.score = Math.min(100, user.score + 2);
        user.history = [...user.history.slice(1), user.score];
        await user.save();
      }

      return {
        success: true,
        data: { 
          goal: goal.toJSON(), 
          scoreDelta: 2,
          newScore: user?.score,
        },
        message: `Completed "${goal.title}" - progress now ${goal.progress}%, score +2`,
      };
    },
  },

  update_goal_progress: {
    name: 'update_goal_progress',
    description: 'Update the progress of a goal',
    parameters: z.object({
      goalTitle: z.string().describe('The title of the goal'),
      progress: z.number().min(0).max(100).describe('New progress percentage'),
    }),
    execute: async (params: { goalTitle: string; progress: number }, ctx: ToolContext): Promise<ToolResult> => {
      const goals = await Goal.find({ userId: ctx.userId });
      const goal = goals.find((g) =>
        g.title.toLowerCase().includes(params.goalTitle.toLowerCase())
      );

      if (!goal) {
        return { success: false, message: `Goal "${params.goalTitle}" not found` };
      }

      goal.progress = params.progress;
      goal.sparkline = [...goal.sparkline.slice(1), params.progress];
      await goal.save();

      return {
        success: true,
        data: { goal: goal.toJSON() },
        message: `Updated "${goal.title}" to ${params.progress}%`,
      };
    },
  },

  add_goal: {
    name: 'add_goal',
    description: 'Create a new goal',
    parameters: z.object({
      title: z.string().describe('Title of the new goal'),
      icon: z.string().optional().describe('Emoji icon for the goal'),
      targetPerWeek: z.number().optional().describe('Target completions per week'),
    }),
    execute: async (params: { title: string; icon?: string; targetPerWeek?: number }, ctx: ToolContext): Promise<ToolResult> => {
      const goal = new Goal({
        userId: ctx.userId,
        title: params.title,
        icon: params.icon || '🎯',
        targetPerWeek: params.targetPerWeek || 3,
        colorTheme: 'lime',
      });
      await goal.save();

      return {
        success: true,
        data: { goal: goal.toJSON() },
        message: `Created new goal: ${params.title}`,
      };
    },
  },

  log_manifestation: {
    name: 'log_manifestation',
    description: 'Log a manifestation practice session',
    parameters: z.object({
      affirmation: z.string().optional().describe('The affirmation keyword or full text'),
      period: z.enum(['morning', 'afternoon', 'evening']).optional().describe('Time period for 3-6-9 technique'),
    }),
    execute: async (params: { affirmation?: string; period?: string }, ctx: ToolContext): Promise<ToolResult> => {
      // Find manifestation or use first one
      let manifestation = await Manifestation.findOne({ userId: ctx.userId });
      
      if (params.affirmation) {
        const all = await Manifestation.find({ userId: ctx.userId });
        manifestation = all.find((m) =>
          m.affirmation.toLowerCase().includes(params.affirmation!.toLowerCase())
        ) || manifestation;
      }

      if (!manifestation) {
        return { success: false, message: 'No manifestations found' };
      }

      // Update based on technique
      if (manifestation.technique === '3-6-9' && params.period) {
        if (!manifestation.progress369) {
          manifestation.progress369 = { morning: false, afternoon: false, evening: false };
        }
        (manifestation.progress369 as any)[params.period] = true;
      }

      manifestation.streak += 1;
      manifestation.lastPracticed = new Date();
      await manifestation.save();

      // Update user score
      const user = await User.findById(ctx.userId);
      if (user) {
        user.score = Math.min(100, user.score + 1);
        user.history = [...user.history.slice(1), user.score];
        await user.save();
      }

      return {
        success: true,
        data: { manifestation: manifestation.toJSON(), scoreDelta: 1 },
        message: `Logged manifestation practice - streak now ${manifestation.streak}, score +1`,
      };
    },
  },

  add_manifestation: {
    name: 'add_manifestation',
    description: 'Create a new manifestation/affirmation',
    parameters: z.object({
      affirmation: z.string().describe('The affirmation text'),
      technique: z.enum(['3-6-9', 'visualization', 'scripting']).describe('Manifestation technique'),
    }),
    execute: async (params: { affirmation: string; technique: '3-6-9' | 'visualization' | 'scripting' }, ctx: ToolContext): Promise<ToolResult> => {
      const manifestation = new Manifestation({
        userId: ctx.userId,
        affirmation: params.affirmation,
        technique: params.technique,
      });
      await manifestation.save();

      return {
        success: true,
        data: { manifestation: manifestation.toJSON() },
        message: `Created new manifestation: ${params.affirmation}`,
      };
    },
  },
};

export type ToolName = keyof typeof tools;
