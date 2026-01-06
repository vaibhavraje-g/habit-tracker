
import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DataService } from './services/data.service';
import { ThemeService } from './services/theme.service';
import { ScoreCardComponent } from './components/score-card/score-card.component';
import { GoalCardComponent } from './components/goal-card/goal-card.component';
import { ManifestationCardComponent } from './components/manifestation-card/manifestation-card.component';
import { SoundPlayerComponent } from './components/sound-player/sound-player.component';
import { BreathGuideComponent } from './components/breath-guide/breath-guide.component';
import { VoiceModalComponent } from './components/voice-modal/voice-modal.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ScoreCardComponent, GoalCardComponent, ManifestationCardComponent, VoiceModalComponent, SoundPlayerComponent, BreathGuideComponent, AsyncPipe],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private dataService: DataService = inject(DataService);
  themeService = inject(ThemeService);

  // Signals for reactive data
  user = toSignal(this.dataService.getUser());
  goals = toSignal(this.dataService.getGoals());
  manifestations = toSignal(this.dataService.getManifestations());
  sounds = toSignal(this.dataService.getSounds());
  breathPatterns = toSignal(this.dataService.getBreathPatterns());

  // Navigation State
  activeTab = signal<'focus' | 'manifest' | 'wellness'>('focus');

  // Voice Interaction State
  isVoiceActive = signal(false);
  voiceState = signal<'idle' | 'listening' | 'thinking' | 'responding'>('idle');
  voiceTranscript = signal('');

  openVoice() {
    this.isVoiceActive.set(true);
    this.voiceState.set('idle');
    this.voiceTranscript.set('');
  }

  closeVoice() {
    this.isVoiceActive.set(false);
    this.voiceState.set('idle');
  }

  startListening() {
    this.voiceState.set('listening');
    this.voiceTranscript.set('');

    // Simulate listening delay then "hearing" something
    setTimeout(() => {
      const phrases = [
        "I completed my coding challenge today",
        "How is my status?",
        "I am manifesting abundance",
        "Start a breathing session"
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      
      this.voiceTranscript.set(`"${randomPhrase}"`);
      this.voiceState.set('thinking');
      
      // Send to service
      this.dataService.processVoiceCommand(randomPhrase).subscribe(response => {
        this.voiceState.set('responding');
        this.voiceTranscript.set(response.response);
        
        // Auto close after reading
        setTimeout(() => {
            if (this.isVoiceActive()) {
               this.closeVoice(); 
            }
        }, 4000);
      });

    }, 2000);
  }
}
