import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ThemeService } from '../../services/theme.service';
import { ScoreCardComponent } from '../../components/score-card/score-card.component';
import { GoalCardComponent } from '../../components/goal-card/goal-card.component';
import { ManifestationCardComponent } from '../../components/manifestation-card/manifestation-card.component';
import { SoundPlayerComponent } from '../../components/sound-player/sound-player.component';
import { BreathGuideComponent } from '../../components/breath-guide/breath-guide.component';
import { VoiceModalComponent } from '../../components/voice-modal/voice-modal.component';
import { OnboardingComponent } from '../../components/onboarding/onboarding.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { IconSun, IconMoon, IconSettings, IconLogout, IconMic } from '../../components/icons/icons.component';
import { Goal, Manifestation, SoundTrack, BreathPattern } from '../../models/types';

interface DashboardData {
  user: { name: string; score: number; history: number[] };
  goals: Goal[];
  manifestations: Manifestation[];
  sounds: SoundTrack[];
  breathPatterns: BreathPattern[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ScoreCardComponent, GoalCardComponent, ManifestationCardComponent, 
    VoiceModalComponent, SoundPlayerComponent, BreathGuideComponent, 
    OnboardingComponent, EmptyStateComponent,
    IconSun, IconMoon, IconSettings, IconLogout, IconMic,
    AsyncPipe
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private api = inject(ApiService);
  auth = inject(AuthService);
  themeService = inject(ThemeService);

  // Data signals
  user = signal<{ name: string; score: number; history: number[] } | null>(null);
  goals = signal<Goal[]>([]);
  manifestations = signal<Manifestation[]>([]);
  sounds = signal<SoundTrack[]>([]);
  breathPatterns = signal<BreathPattern[]>([]);
  isLoading = signal(true);

  // Navigation State
  activeTab = signal<'focus' | 'manifest' | 'wellness'>('focus');

  // Voice Interaction State
  isVoiceActive = signal(false);
  voiceState = signal<'idle' | 'listening' | 'thinking' | 'responding'>('idle');
  voiceTranscript = signal('');

  // Onboarding State
  showOnboarding = signal(false);
  isNewUser = signal(false);

  ngOnInit() {
    // Check if we need to show onboarding
    const hasSeenOnboarding = localStorage.getItem('ascend_onboarding_complete');
    if (!hasSeenOnboarding) {
      this.showOnboarding.set(true);
    }
  }

  constructor() {
    // Check auth and load data
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading.set(true);
    this.api.get<DashboardData>('/dashboard').subscribe({
      next: (data) => {
        this.user.set(data.user);
        this.goals.set(data.goals);
        this.manifestations.set(data.manifestations);
        this.sounds.set(data.sounds);
        this.breathPatterns.set(data.breathPatterns);
        this.isLoading.set(false);

        // Check if this is a new user (no activity history)
        const hasActivity = data.user.history.some((h, i) => i > 0 && h !== data.user.history[0]);
        this.isNewUser.set(!hasActivity || data.goals.length === 0);
      },
      error: (err) => {
        console.error('Failed to load dashboard:', err);
        this.isLoading.set(false);
        if (err.message?.includes('401') || err.message?.includes('token')) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Onboarding handlers
  completeOnboarding(data: { goals: string[]; preferences: string[] }) {
    localStorage.setItem('ascend_onboarding_complete', 'true');
    localStorage.setItem('ascend_preferences', JSON.stringify(data));
    this.showOnboarding.set(false);
    
    // TODO: Create default goals based on selection
    if (data.goals.length > 0) {
      // Could call API to create suggested goals
    }
  }

  skipOnboarding() {
    localStorage.setItem('ascend_onboarding_complete', 'true');
    this.showOnboarding.set(false);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  openVoice() {
    this.isVoiceActive.set(true);
    this.voiceState.set('idle');
    this.voiceTranscript.set('');
  }

  closeVoice() {
    this.isVoiceActive.set(false);
    this.voiceState.set('idle');
  }

  // Handle message from voice modal (via suggestion or speech)
  handleVoiceMessage(message: string) {
    this.voiceState.set('thinking');
    this.voiceTranscript.set(`"${message}"`);
    this.processAgentMessage(message);
  }

  startListening() {
    this.voiceState.set('listening');
    this.voiceTranscript.set('');

    // Simulate listening then process through agent
    setTimeout(() => {
      const phrases = [
        "I completed my coding challenge today",
        "How is my status?",
        "I practiced my affirmations",
        "Add a new goal for meditation"
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      
      this.voiceTranscript.set(`"${randomPhrase}"`);
      this.voiceState.set('thinking');
      this.processAgentMessage(randomPhrase);
    }, 2000);
  }

  private processAgentMessage(message: string) {
    this.api.post<{ message: string; actions: any[]; updatedData: any }>('/agent/chat', { message }).subscribe({
      next: (response) => {
        this.voiceState.set('responding');
        this.voiceTranscript.set(response.message);
        
        // Update UI with fresh data
        if (response.updatedData) {
          if (response.updatedData.goals) this.goals.set(response.updatedData.goals);
          if (response.updatedData.manifestations) this.manifestations.set(response.updatedData.manifestations);
          if (response.updatedData.score !== undefined) {
            this.user.update(u => u ? { ...u, score: response.updatedData.score, history: response.updatedData.history || u.history } : u);
          }
        }
        
        // Auto close after reading
        setTimeout(() => {
          if (this.isVoiceActive()) {
            this.closeVoice();
          }
        }, 4000);
      },
      error: (err) => {
        console.error('Agent error:', err);
        this.voiceState.set('responding');
        this.voiceTranscript.set("Sorry, I could not process that. Please try again.");
      }
    });
  }

  // Check if score has meaningful history 
  hasScoreHistory(): boolean {
    const history = this.user()?.history || [];
    if (history.length < 2) return false;
    // Check if there's any variation in history
    return history.some((h, i) => i > 0 && h !== history[0]);
  }
}
