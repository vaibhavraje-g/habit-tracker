import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
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
          <button (click)="close.emit()" 
                  class="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center">
            <span class="text-lg">×</span>
          </button>

          <!-- Idle State - Guided Entry -->
          @if (state === 'idle') {
            <div class="text-stone-300 mb-6">
              <h3 class="text-xl font-semibold mb-2">{{ greeting }}</h3>
              <p class="text-stone-500 text-sm">{{ starterQuestion }}</p>
            </div>

            <!-- Quick Action Suggestions -->
            <div class="flex flex-wrap gap-2 justify-center mb-6">
              @for (suggestion of suggestions; track suggestion) {
                <button (click)="useSuggestion(suggestion)"
                        class="px-4 py-2 text-sm bg-stone-800 border border-stone-700 rounded-full text-stone-300 hover:bg-stone-700 hover:text-white transition-colors">
                  {{ suggestion }}
                </button>
              }
            </div>

            <button (click)="startListening.emit()"
                    class="w-20 h-20 rounded-full bg-gradient-to-br from-lime-500 to-emerald-500 text-stone-900 flex items-center justify-center mx-auto hover:scale-105 active:scale-95 transition-all shadow-lg shadow-lime-500/30">
              <icon-mic [size]="32"></icon-mic>
            </button>
            <p class="text-stone-500 text-xs mt-4">Tap to speak or select an option above</p>
          }

          <!-- Listening State -->
          @if (state === 'listening') {
            <div class="flex justify-center mb-6">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-lime-500 to-emerald-500 flex items-center justify-center animate-pulse">
                <icon-mic [size]="32" class="text-stone-900"></icon-mic>
              </div>
            </div>
            <p class="text-stone-300 text-lg">Listening...</p>
            <p class="text-stone-500 text-sm mt-2">Speak now</p>
          }

          <!-- Thinking State -->
          @if (state === 'thinking') {
            <div class="flex justify-center mb-6">
              <div class="w-20 h-20 rounded-full bg-stone-800 flex items-center justify-center">
                <icon-brain [size]="32" class="text-violet-400 animate-pulse"></icon-brain>
              </div>
            </div>
            <p class="text-stone-300 text-lg mb-2">Processing...</p>
            @if (transcript) {
              <p class="text-stone-500 text-sm italic">{{ transcript }}</p>
            }
          }

          <!-- Responding State -->
          @if (state === 'responding') {
            <div class="flex justify-center mb-6">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <icon-check [size]="32" class="text-stone-900"></icon-check>
              </div>
            </div>
            <p class="text-stone-100 text-lg leading-relaxed">{{ transcript }}</p>
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
export class VoiceModalComponent implements OnInit {
  @Input() isActive = false;
  @Input() state: 'idle' | 'listening' | 'thinking' | 'responding' = 'idle';
  @Input() transcript = '';
  @Output() close = new EventEmitter<void>();
  @Output() startListening = new EventEmitter<void>();
  @Output() sendMessage = new EventEmitter<string>();

  // Guided conversation entry
  greeting = "Hi there. How can I help?";
  starterQuestion = "What would you like to improve or track right now?";
  
  suggestions = [
    "Check my progress",
    "Mark goal complete",
    "Add a new goal",
    "Start breathing exercise"
  ];

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
  }

  closeModal(event: Event) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  useSuggestion(suggestion: string) {
    this.sendMessage.emit(suggestion);
  }
}
