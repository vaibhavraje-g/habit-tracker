import { Component, Input } from '@angular/core';
import { IconTarget, IconPlus, IconTrendUp } from '../icons/icons.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconTarget, IconPlus, IconTrendUp],
  template: `
    <div class="text-center py-12 px-6">
      <div class="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center mx-auto mb-4 text-stone-500">
        @switch (type) {
          @case ('goals') { <icon-target [size]="28"></icon-target> }
          @case ('streak') { <icon-trend-up [size]="28"></icon-trend-up> }
          @case ('chart') { <icon-trend-up [size]="28"></icon-trend-up> }
          @default { <icon-target [size]="28"></icon-target> }
        }
      </div>
      
      <h3 class="text-stone-300 font-medium mb-1">{{ title }}</h3>
      <p class="text-stone-500 text-sm mb-4">{{ subtitle }}</p>
      
      @if (showAction) {
        <button (click)="onAction()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:text-white hover:border-stone-600 transition-colors text-sm">
          <icon-plus [size]="16"></icon-plus>
          {{ actionLabel }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() type: 'goals' | 'streak' | 'chart' | 'manifestations' = 'goals';
  @Input() title = 'No data yet';
  @Input() subtitle = 'Start today to track your progress';
  @Input() actionLabel = 'Add first item';
  @Input() showAction = true;

  onAction() {
    // This could emit an event or be handled by parent
  }
}

// Empty state configurations for different contexts
export const EMPTY_STATES = {
  goals: {
    title: 'No goals yet',
    subtitle: 'Start by adding your first goal to track',
    actionLabel: 'Create a goal'
  },
  streak: {
    title: 'Build your streak',
    subtitle: 'Complete activities daily to see your streak here',
    actionLabel: 'Get started'
  },
  chart: {
    title: 'No history yet',
    subtitle: 'Your progress chart will appear after a few days',
    actionLabel: ''
  },
  manifestations: {
    title: 'No affirmations yet',
    subtitle: 'Add your first manifestation to begin your practice',
    actionLabel: 'Add affirmation'
  }
};
