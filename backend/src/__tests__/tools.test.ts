import { describe, it, expect } from 'vitest';
import { tools } from '../agent/tools.js';

describe('Agent Tools & Parameter Validation', () => {
  it('should validate get_status with empty object', () => {
    const parsed = tools.get_status.parameters.safeParse({});
    expect(parsed.success).toBe(true);
  });

  it('should validate complete_goal parameters', () => {
    const valid = tools.complete_goal.parameters.safeParse({ goalTitle: 'Exercise' });
    expect(valid.success).toBe(true);

    const invalid = tools.complete_goal.parameters.safeParse({});
    expect(invalid.success).toBe(false);
  });

  it('should validate update_goal_progress with bounds [0, 100]', () => {
    const valid = tools.update_goal_progress.parameters.safeParse({
      goalTitle: 'Read Book',
      progress: 75,
    });
    expect(valid.success).toBe(true);

    const overMax = tools.update_goal_progress.parameters.safeParse({
      goalTitle: 'Read Book',
      progress: 150,
    });
    expect(overMax.success).toBe(false);

    const negative = tools.update_goal_progress.parameters.safeParse({
      goalTitle: 'Read Book',
      progress: -10,
    });
    expect(negative.success).toBe(false);
  });

  it('should validate add_goal parameters with optional fields', () => {
    const minimal = tools.add_goal.parameters.safeParse({
      title: 'Morning Meditation',
    });
    expect(minimal.success).toBe(true);

    const full = tools.add_goal.parameters.safeParse({
      title: 'Workout',
      icon: '💪',
      targetPerWeek: 5,
    });
    expect(full.success).toBe(true);

    const invalid = tools.add_goal.parameters.safeParse({});
    expect(invalid.success).toBe(false);
  });

  it('should validate log_manifestation periods', () => {
    const morning = tools.log_manifestation.parameters.safeParse({
      period: 'morning',
    });
    expect(morning.success).toBe(true);

    const invalidPeriod = tools.log_manifestation.parameters.safeParse({
      period: 'night',
    });
    expect(invalidPeriod.success).toBe(false);
  });

  it('should validate add_manifestation techniques', () => {
    const validTechniques = ['3-6-9', 'visualization', 'scripting'] as const;
    for (const tech of validTechniques) {
      const res = tools.add_manifestation.parameters.safeParse({
        affirmation: 'I am abundant and successful',
        technique: tech,
      });
      expect(res.success).toBe(true);
    }

    const invalid = tools.add_manifestation.parameters.safeParse({
      affirmation: 'Test',
      technique: 'unsupported_technique',
    });
    expect(invalid.success).toBe(false);
  });
});
