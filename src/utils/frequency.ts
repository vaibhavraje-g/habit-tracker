// Frontend frequency computation utilities
// Handles daily, weekly, custom schedules without backend dependency

export interface FrequencyConfig {
  type: 'daily' | 'weekly' | 'custom';
  targetPerWeek?: number;
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastCompletedDate: string | null;
  isActiveToday: boolean;
}

export interface FrequencyStatus {
  completedThisWeek: number;
  targetThisWeek: number;
  progress: number; // 0-100
  isOnTrack: boolean;
  daysRemaining: number;
  missedDays: number;
  streak: StreakInfo;
}

// Get start of current week (Sunday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

// Get days remaining in current week
function getDaysRemainingInWeek(): number {
  return 6 - new Date().getDay();
}

// Check if date is today
function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

// Check if date is yesterday
function isYesterday(date: Date | string): boolean {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
}

// Calculate streak from completion dates
export function calculateStreak(completionDates: string[]): StreakInfo {
  if (completionDates.length === 0) {
    return { current: 0, longest: 0, lastCompletedDate: null, isActiveToday: false };
  }

  // Sort dates descending
  const sorted = [...completionDates]
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  const lastCompleted = sorted[0];
  const isActiveToday = isToday(lastCompleted);
  
  // Count current streak
  let currentStreak = 0;
  let checkDate = new Date();
  
  // If not completed today, start from yesterday
  if (!isActiveToday) {
    if (!isYesterday(lastCompleted)) {
      // Streak broken
      return { current: 0, longest: calculateLongestStreak(completionDates), lastCompletedDate: lastCompleted.toISOString(), isActiveToday: false };
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (const date of sorted) {
    if (date.toDateString() === checkDate.toDateString()) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    current: currentStreak,
    longest: Math.max(currentStreak, calculateLongestStreak(completionDates)),
    lastCompletedDate: lastCompleted.toISOString(),
    isActiveToday
  };
}

// Calculate longest streak ever
function calculateLongestStreak(completionDates: string[]): number {
  if (completionDates.length === 0) return 0;

  const sorted = [...completionDates]
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
    // diffDays === 0 means same day, don't reset
  }

  return longest;
}

// Calculate weekly progress
export function calculateWeeklyProgress(
  completionDates: string[],
  config: FrequencyConfig
): FrequencyStatus {
  const weekStart = getWeekStart(new Date());
  const target = config.targetPerWeek || (config.type === 'daily' ? 7 : 3);
  
  // Count completions this week
  const completedThisWeek = completionDates.filter(d => {
    const date = new Date(d);
    return date >= weekStart;
  }).length;

  const progress = Math.min(100, Math.round((completedThisWeek / target) * 100));
  const daysRemaining = getDaysRemainingInWeek();
  const needed = target - completedThisWeek;
  const isOnTrack = needed <= daysRemaining;

  // Calculate missed days for daily frequency
  let missedDays = 0;
  if (config.type === 'daily') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceWeekStart = today.getDay();
    
    for (let i = 0; i < daysSinceWeekStart; i++) {
      const checkDate = new Date(weekStart);
      checkDate.setDate(checkDate.getDate() + i);
      const wasCompleted = completionDates.some(d => new Date(d).toDateString() === checkDate.toDateString());
      if (!wasCompleted) missedDays++;
    }
  }

  return {
    completedThisWeek,
    targetThisWeek: target,
    progress,
    isOnTrack,
    daysRemaining,
    missedDays,
    streak: calculateStreak(completionDates)
  };
}

// Generate subtitle based on progress
export function generateProgressSubtitle(status: FrequencyStatus): string {
  if (status.progress >= 100) {
    return 'Completed this week!';
  }
  if (status.streak.current > 0) {
    return `${status.streak.current} day streak · ${status.completedThisWeek}/${status.targetThisWeek} this week`;
  }
  return `${status.completedThisWeek} of ${status.targetThisWeek} this week`;
}

// Get sparkline data from completion history (last 7 entries as percentages)
export function generateSparklineFromHistory(
  completionDates: string[],
  targetPerWeek: number = 3
): number[] {
  const sparkline: number[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const wasCompleted = completionDates.some(d => 
      new Date(d).toDateString() === checkDate.toDateString()
    );
    sparkline.push(wasCompleted ? 100 : 0);
  }
  
  return sparkline;
}
