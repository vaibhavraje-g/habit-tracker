import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { VoiceService, VoiceState } from '../../services/voice.service';
import { IconMic, IconBrain, IconCheck } from '../icons/icons.component';

@Component({
  selector: 'app-voice-modal',
  standalone: true,
  imports: [IconMic, IconBrain, IconCheck],
  template: `
    @if (isActive) {
      <div class="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/80 backdrop-blur-sm animate-fade-in"
           (click)="closeModal($event)">
        <div class="w-full max-w-md bg-stone-900 rounded-t-3xl p-8 text-center animate-slide-up"
             (click)="$event.stopPropagation()">
          
          <!-- Close Button -->
          <button (click)="close.emit(); voiceService.reset()" 
                  class="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center">
            <span class="text-lg">×</span>
          </button>

          <!-- Idle State - Guided Entry -->
          @if (currentState() === 'idle') {
            <div class="text-stone-300 mb-6">
              <h3 class="text-xl font-semibold mb-2">{{ greeting }}</h3>
              <p class="text-stone-500 text-sm">{{ starterQuestion }}</p>
            </div>

            <!-- Quick Action Suggestions -->
            <div class="flex flex-wrap gap-2 justify-center mb-6">
              @for (suggestion of suggestions; track suggestion) {
                <button (click)="sendSuggestion(suggestion)"
                        class="px-4 py-2 text-sm bg-stone-800 border border-stone-700 rounded-full text-stone-300 hover:bg-stone-700 hover:text-white transition-colors">
                  {{ suggestion }}
                </button>
              }
            </div>

            <button (click)="startListening()"
                    class="w-20 h-20 rounded-full bg-gradient-to-br from-lime-500 to-emerald-500 text-stone-900 flex items-center justify-center mx-auto hover:scale-105 active:scale-95 transition-all shadow-lg shadow-lime-500/30">
              <icon-mic [size]="32"></icon-mic>
            </button>
            <p class="text-stone-500 text-xs mt-4">Tap to speak or select an option above</p>
          }

          <!-- Listening State -->
          @if (currentState() === 'listening') {
            <div class="flex justify-center mb-6">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-lime-500 to-emerald-500 flex items-center justify-center animate-pulse shadow-lg shadow-lime-500/40">
                <icon-mic [size]="40" class="text-stone-900"></icon-mic>
              </div>
            </div>
            <p class="text-lime-400 text-lg font-medium">Listening...</p>
            @if (voiceService.transcript()) {
              <p class="text-stone-300 text-sm mt-3 italic">"{{ voiceService.transcript() }}"</p>
            }
            <button (click)="voiceService.stopListening()" 
                    class="mt-4 px-4 py-2 text-sm bg-stone-800 rounded-full text-stone-400 hover:text-white">
              Stop
            </button>
          }

          <!-- Thinking State -->
          @if (currentState() === 'thinking') {
            <div class="flex justify-center mb-6">
              <div class="w-20 h-20 rounded-full bg-stone-800 flex items-center justify-center">
                <div class="animate-spin">
                  <icon-brain [size]="32" class="text-violet-400"></icon-brain>
                </div>
              </div>
            </div>
            <p class="text-stone-300 text-lg mb-2">Processing...</p>
            @if (voiceService.transcript()) {
              <p class="text-stone-500 text-sm italic">"{{ voiceService.transcript() }}"</p>
            }
          }

          <!-- Speaking State (Response) -->
          @if (currentState() === 'speaking') {
            <div class="flex justify-center mb-6">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <div class="animate-pulse">
                  <icon-check [size]="32" class="text-stone-900"></icon-check>
                </div>
              </div>
            </div>
            <p class="text-stone-100 text-lg leading-relaxed mb-4">{{ voiceService.response() }}</p>
            <button (click)="voiceService.stopSpeaking()" 
                    class="px-4 py-2 text-sm bg-stone-800 rounded-full text-stone-400 hover:text-white">
              Stop speaking
            </button>
          }

          <!-- Error State -->
          @if (currentState() === 'error') {
            <div class="flex justify-center mb-6">
              <div class="w-20 h-20 rounded-full bg-red-900/50 flex items-center justify-center">
                <span class="text-3xl">!</span>
              </div>
            </div>
            <p class="text-red-400 text-lg mb-2">{{ voiceService.error() || 'Something went wrong' }}</p>
            <button (click)="retry()" 
                    class="px-6 py-2 bg-stone-800 rounded-full text-stone-300 hover:bg-stone-700">
              Try Again
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slide-up {
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class VoiceModalComponent implements OnInit, OnDestroy {
  @Input() isActive = false;
  @Output() close = new EventEmitter<void>();
  @Output() dataUpdated = new EventEmitter<any>();

  voiceService = inject(VoiceService);

  // Guided conversation entry
  greeting = "Hi there. How can I help?";
  starterQuestion = "What would you like to improve or track right now?";
  
  suggestions = [
    "Check my progress",
    "Mark goal complete",
    "Add a new goal",
    "Start breathing exercise"
  ];

  // Computed state from service
  currentState = this.voiceService.state;

  ngOnInit() {
    // Vary the greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = "Good morning. Ready to start strong?";
      this.starterQuestion = "What would you like to focus on today?";
    } else if (hour < 17) {
      this.greeting = "Good afternoon. How's it going?";
      this.starterQuestion = "What progress can we celebrate?";
    } else {
      this.greeting = "Good evening. Wrapping up the day?";
      this.starterQuestion = "What did you accomplish today?";
    }

    // Connect to socket when modal opens
    this.voiceService.connect();

    // Handle data updates from agent
    this.voiceService.onDataUpdate = (data) => {
      if (data) {
        this.dataUpdated.emit(data);
      }
    };
  }

  ngOnDestroy() {
    this.voiceService.reset();
  }

  closeModal(event: Event) {
    if (event.target === event.currentTarget) {
      this.close.emit();
      this.voiceService.reset();
    }
  }

  startListening() {
    this.voiceService.startListening();
  }

  sendSuggestion(suggestion: string) {
    this.voiceService.sendMessage(suggestion);
  }

  retry() {
    this.voiceService.reset();
  }
}
