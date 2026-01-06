
import { Component, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Goal } from '../../models/types';
import { SparklineComponent } from '../sparkline/sparkline.component';

@Component({
  selector: 'app-goal-card',
  standalone: true,
  imports: [CommonModule, SparklineComponent],
  template: `
    <div class="bg-white dark:bg-stone-850/50 border border-stone-200 dark:border-stone-800 rounded-xl p-5 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all cursor-pointer group active:scale-[0.98] shadow-sm hover:shadow-md">
      <div class="flex items-center gap-4 mb-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors"
             [style.background-color]="bgStyle()"
             [style.color]="textStyle()">
          {{ goal().icon }}
        </div>
        <div class="flex-1">
          <div class="font-bold text-sm text-stone-800 dark:text-stone-200">{{ goal().title }}</div>
          <div class="text-xs text-stone-500">{{ goal().subtitle }}</div>
        </div>
      </div>
      
      <app-sparkline [data]="goal().sparkline" [colorTheme]="goal().colorTheme"></app-sparkline>
      
      <div class="mt-4">
        <!-- Solid Progress Bar -->
        <div class="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-1000 ease-out"
               [style.width.%]="goal().progress"
               [style.background-color]="barColor()">
          </div>
        </div>
        <div class="flex justify-between mt-2 text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-medium">
            <span>{{ goal().progress }}%</span>
            <span>{{ goal().status === 'completed' ? 'Done' : 'In Progress' }}</span>
        </div>
      </div>
    </div>
  `
})
export class GoalCardComponent {
  // Cast inputs to Signal
  goal = input.required<Goal>() as Signal<Goal>;

  bgStyle = computed(() => {
    switch (this.goal().colorTheme) {
      case 'lime': return 'rgba(190, 242, 100, 0.2)'; // Darker for light mode visibility
      case 'yellow': return 'rgba(253, 224, 71, 0.2)';
      case 'emerald': return 'rgba(110, 231, 183, 0.2)';
      default: return 'rgba(190, 242, 100, 0.2)';
    }
  });

  textStyle = computed(() => {
    // We can just use hex codes that work on both or conditional logic, 
    // but these pastel dark colors usually work well on both light (bg) and dark (bg)
    switch (this.goal().colorTheme) {
      case 'lime': return '#65a30d'; // lime-600 for better contrast on light
      case 'yellow': return '#ca8a04'; // yellow-600
      case 'emerald': return '#059669'; // emerald-600
      default: return '#65a30d';
    }
  });

  barColor = computed(() => {
     switch (this.goal().colorTheme) {
      case 'lime': return '#84cc16'; // lime-500
      case 'yellow': return '#eab308'; // yellow-500
      case 'emerald': return '#10b981'; // emerald-500
      default: return '#84cc16';
    }
  });
}
