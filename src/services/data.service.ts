
import { Injectable, signal } from '@angular/core';
import { Goal, User, VoiceResponse, Manifestation, SoundTrack, BreathPattern } from '../models/types';
import { Observable, of, timer } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // --- Simulated Database State ---
  
  private generateHistory(): number[] {
    const history = [60];
    for (let i = 1; i < 90; i++) {
      const change = Math.floor(Math.random() * 5) - 2; 
      let newVal = history[i-1] + change;
      newVal = Math.max(40, Math.min(100, newVal)); 
      history.push(newVal);
    }
    history[88] = 82;
    history[89] = 84;
    return history;
  }

  private _user = signal<User>({
    name: 'Alex',
    score: 84,
    history: this.generateHistory()
  });

  private _goals = signal<Goal[]>([
    {
      id: 'coding',
      title: 'Coding Challenge',
      subtitle: '2 of 3 this week',
      icon: '💻',
      progress: 67,
      sparkline: [40, 60, 20, 80, 90, 67, 67],
      colorTheme: 'lime',
      status: 'active'
    },
    {
      id: 'nutrition',
      title: 'Healthy Eating',
      subtitle: '4 day streak',
      icon: '🥗',
      progress: 85,
      sparkline: [80, 90, 100, 100, 80, 85, 85],
      colorTheme: 'emerald',
      status: 'active'
    },
    {
      id: 'detox',
      title: 'Screen Time',
      subtitle: '30 min limit',
      icon: '📵',
      progress: 40,
      sparkline: [90, 80, 50, 45, 60, 40, 40],
      colorTheme: 'yellow',
      status: 'active'
    }
  ]);

  private _manifestations = signal<Manifestation[]>([
    {
      id: 'm1',
      affirmation: "I attract abundance easily",
      technique: '3-6-9',
      streak: 5,
      progress369: { morning: true, afternoon: false, evening: false }
    },
    {
      id: 'm2',
      affirmation: "My dream apartment in the city",
      technique: 'visualization',
      streak: 12,
      durationSeconds: 68 
    }
  ]);

  private _sounds = signal<SoundTrack[]>([
    { id: 's1', title: 'Deep Work Gamma', frequency: '40Hz', category: 'Focus', isPlaying: false },
    { id: 's2', title: 'Universal Repair', frequency: '432Hz', category: 'Healing', isPlaying: false },
    { id: 's3', title: 'Theta Waves', frequency: '6Hz', category: 'Sleep', isPlaying: false },
    { id: 's4', title: 'Solfeggio Tone', frequency: '528Hz', category: 'Healing', isPlaying: false },
  ]);

  private _breathPatterns = signal<BreathPattern[]>([
    { id: 'b1', name: 'Box Breathing', description: 'Focus & Calm', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
    { id: 'b2', name: '4-7-8 Relax', description: 'Sleep & Anxiety', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
    { id: 'b3', name: 'Energy', description: 'Wake Up', inhale: 2, holdIn: 0, exhale: 1, holdOut: 0 },
  ]);

  // --- API Methods ---

  getGoals(): Observable<Goal[]> {
    return of(this._goals()).pipe(delay(500));
  }

  getManifestations(): Observable<Manifestation[]> {
    return of(this._manifestations()).pipe(delay(400));
  }

  getSounds(): Observable<SoundTrack[]> {
    return of(this._sounds()).pipe(delay(300));
  }

  getBreathPatterns(): Observable<BreathPattern[]> {
    return of(this._breathPatterns()).pipe(delay(300));
  }

  getUser(): Observable<User> {
    return of(this._user()).pipe(delay(300));
  }

  processVoiceCommand(transcript: string): Observable<VoiceResponse> {
    return timer(2000).pipe(
      map((): VoiceResponse => {
        const lower = transcript.toLowerCase();
        if (lower.includes('coding')) {
          return {
            transcript,
            response: 'Excellent! Your coding challenge is marked complete. Your Ascend score increased by 2 points.',
            action: 'complete_goal',
            targetId: 'coding',
            scoreDelta: 2
          };
        } else if (lower.includes('status')) {
            return {
                transcript,
                response: `You are doing great, Alex. Your current score is ${this._user().score}. Keep pushing!`,
                action: undefined
            };
        }
        
        return {
          transcript,
          response: "I've logged that entry. Keep up the good work!",
          action: 'update_score',
          scoreDelta: 1
        };
      }),
      tap((res) => this.applyVoiceEffects(res))
    );
  }

  private applyVoiceEffects(res: VoiceResponse) {
    if (res.action === 'complete_goal' && res.targetId) {
      this._goals.update(goals => goals.map(g => {
        if (g.id === res.targetId) {
          const newSpark = [...g.sparkline.slice(1), 100];
          return { ...g, progress: 100, sparkline: newSpark, subtitle: 'Completed just now' };
        }
        return g;
      }));
    }

    if (res.scoreDelta) {
      this._user.update(u => {
        const newScore = Math.min(100, u.score + res.scoreDelta!);
        const newHistory = [...u.history.slice(1), newScore];
        return { ...u, score: newScore, history: newHistory };
      });
    }
  }
}
