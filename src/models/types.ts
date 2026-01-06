
export interface Goal {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  progress: number; // 0-100
  sparkline: number[]; // Array of values 0-100
  colorTheme: 'lime' | 'yellow' | 'emerald';
  status: 'active' | 'completed';
}

export interface Manifestation {
  id: string;
  affirmation: string;
  technique: '3-6-9' | 'visualization' | 'scripting';
  streak: number;
  progress369?: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  lastVisualized?: Date;
  durationSeconds?: number;
}

export interface SoundTrack {
  id: string;
  title: string;
  frequency: string; // e.g., "40Hz"
  category: 'Focus' | 'Healing' | 'Sleep';
  isPlaying: boolean;
}

export interface BreathPattern {
  id: string;
  name: string;
  description: string;
  // Durations in seconds
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

export interface User {
  name: string;
  score: number;
  history: number[]; // 90 days of data
}

export interface VoiceResponse {
  transcript: string;
  response: string;
  action?: 'update_score' | 'complete_goal';
  targetId?: string;
  scoreDelta?: number;
}
