import { Component, signal, Output, EventEmitter } from '@angular/core';
import { IconTarget, IconCode, IconSalad, IconBrain, IconWind, IconCheck } from '../icons/icons.component';

interface OnboardingStep {
  title: string;
  subtitle: string;
  options: { id: string; label: string; icon: string }[];
  multiSelect: boolean;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [IconTarget, IconCode, IconSalad, IconBrain, IconWind, IconCheck],
  template: `
    <div class="fixed inset-0 z-50 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        
        <!-- Progress Dots -->
        <div class="flex justify-center gap-2 mb-8">
          @for (step of steps; track step.title; let i = $index) {
            <div class="w-2 h-2 rounded-full transition-colors"
                 [class.bg-lime-500]="i <= currentStep()"
                 [class.bg-stone-700]="i > currentStep()">
            </div>
          }
        </div>

        <!-- Current Step Content -->
        @if (steps[currentStep()]) {
          <div class="text-center mb-8 animate-fade-in">
            <h2 class="text-2xl font-bold text-white mb-2">{{ steps[currentStep()].title }}</h2>
            <p class="text-stone-400">{{ steps[currentStep()].subtitle }}</p>
          </div>

          <!-- Options Grid -->
          <div class="grid grid-cols-2 gap-3 mb-8">
            @for (option of steps[currentStep()].options; track option.id) {
              <button (click)="toggleOption(option.id)"
                      class="p-4 rounded-xl border-2 transition-all text-left group"
                      [class.border-lime-500]="isSelected(option.id)"
                      [class.bg-lime-500/10]="isSelected(option.id)"
                      [class.border-stone-700]="!isSelected(option.id)"
                      [class.bg-stone-800/50]="!isSelected(option.id)"
                      [class.hover:border-stone-600]="!isSelected(option.id)">
                <div class="text-2xl mb-2 text-stone-400 group-hover:text-white transition-colors"
                     [class.text-lime-400]="isSelected(option.id)">
                  @switch (option.icon) {
                    @case ('target') { <icon-target [size]="28"></icon-target> }
                    @case ('code') { <icon-code [size]="28"></icon-code> }
                    @case ('salad') { <icon-salad [size]="28"></icon-salad> }
                    @case ('brain') { <icon-brain [size]="28"></icon-brain> }
                    @case ('wind') { <icon-wind [size]="28"></icon-wind> }
                  }
                </div>
                <p class="text-sm font-medium"
                   [class.text-white]="isSelected(option.id)"
                   [class.text-stone-300]="!isSelected(option.id)">
                  {{ option.label }}
                </p>
              </button>
            }
          </div>
        }

        <!-- Navigation -->
        <div class="flex gap-3">
          <button (click)="skip()"
                  class="flex-1 py-3 rounded-xl border border-stone-700 text-stone-400 hover:text-white hover:border-stone-600 transition-colors">
            Skip
          </button>
          <button (click)="next()"
                  class="flex-1 py-3 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 text-stone-900 font-semibold hover:shadow-lg hover:shadow-lime-500/20 transition-all">
            @if (currentStep() === steps.length - 1) {
              Get Started
            } @else {
              Continue
            }
          </button>
        </div>

        <!-- Skip All Link -->
        <p class="text-center text-stone-600 text-sm mt-6">
          <button (click)="skip()" class="hover:text-stone-400 transition-colors">
            Set up later in settings
          </button>
        </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class OnboardingComponent {
  @Output() complete = new EventEmitter<{ goals: string[]; preferences: string[] }>();
  @Output() skipped = new EventEmitter<void>();

  currentStep = signal(0);
  selectedOptions = signal<Set<string>>(new Set());

  steps: OnboardingStep[] = [
    {
      title: 'What matters most to you?',
      subtitle: 'Select all that apply',
      multiSelect: true,
      options: [
        { id: 'health', label: 'Health & Fitness', icon: 'wind' },
        { id: 'learning', label: 'Learning & Coding', icon: 'code' },
        { id: 'mindfulness', label: 'Mindfulness', icon: 'brain' },
        { id: 'nutrition', label: 'Better Eating', icon: 'salad' },
      ]
    },
    {
      title: 'How should I help?',
      subtitle: 'Choose your preferred style',
      multiSelect: false,
      options: [
        { id: 'coach', label: 'Be my coach', icon: 'target' },
        { id: 'tracker', label: 'Just track it', icon: 'brain' },
        { id: 'gentle', label: 'Gentle reminders', icon: 'wind' },
        { id: 'minimal', label: 'Stay minimal', icon: 'target' },
      ]
    }
  ];

  isSelected(optionId: string): boolean {
    return this.selectedOptions().has(optionId);
  }

  toggleOption(optionId: string) {
    const current = this.selectedOptions();
    const step = this.steps[this.currentStep()];
    
    if (step.multiSelect) {
      if (current.has(optionId)) {
        current.delete(optionId);
      } else {
        current.add(optionId);
      }
    } else {
      // Single select - clear others from this step
      step.options.forEach(opt => current.delete(opt.id));
      current.add(optionId);
    }
    
    this.selectedOptions.set(new Set(current));
  }

  next() {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(s => s + 1);
    } else {
      // Complete onboarding
      const selected = Array.from(this.selectedOptions());
      const goals = selected.filter(id => ['health', 'learning', 'mindfulness', 'nutrition'].includes(id));
      const preferences = selected.filter(id => ['coach', 'tracker', 'gentle', 'minimal'].includes(id));
      this.complete.emit({ goals, preferences });
    }
  }

  skip() {
    this.skipped.emit();
  }
}
