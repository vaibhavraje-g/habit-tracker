
import { Component, input, computed, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div class="relative overflow-hidden bg-white/60 dark:bg-stone-850/80 border border-stone-200 dark:border-stone-700/50 rounded-3xl p-6 mb-8 shadow-xl shadow-stone-200/50 dark:shadow-none transition-colors duration-500">
       
       <!-- Header & Score -->
       <div class="relative z-10 flex justify-between items-start mb-6">
         <div>
           <div class="text-xs font-semibold tracking-[0.2em] text-stone-500 dark:text-stone-400 uppercase">Ascend Score</div>
           <div class="text-5xl font-bold text-stone-800 dark:text-pastel-cream mt-2 tracking-tight transition-colors">{{ score() }}</div>
         </div>
         
         <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border bg-stone-100 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 transition-colors"
              [class.text-emerald-600]="trend().direction === 'up'"
              [class.dark:text-emerald-400]="trend().direction === 'up'"
              [class.text-rose-600]="trend().direction === 'down'"
              [class.dark:text-rose-400]="trend().direction === 'down'">
            <span>{{ trend().direction === 'up' ? '↑' : '↓' }}</span>
            <span>{{ trend().value }}</span>
         </div>
       </div>

       <!-- Range Selector -->
       <div class="flex gap-2 mb-2">
         @for (r of ranges; track r) {
            <button 
              (click)="selectedRange.set(r)"
              class="px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 border"
              [class.bg-lime-200]="selectedRange() === r"
              [class.dark:bg-pastel-limeDark]="selectedRange() === r"
              [class.text-stone-800]="selectedRange() === r"
              [class.dark:text-stone-900]="selectedRange() === r"
              [class.border-lime-300]="selectedRange() === r"
              [class.dark:border-pastel-limeDark]="selectedRange() === r"
              
              [class.bg-transparent]="selectedRange() !== r"
              [class.text-stone-500]="selectedRange() !== r"
              [class.border-transparent]="selectedRange() !== r"
              [class.dark:border-stone-800]="selectedRange() !== r"
              [class.hover:bg-stone-100]="selectedRange() !== r"
              [class.dark:hover:bg-stone-800]="selectedRange() !== r">
              {{ r | uppercase }}
            </button>
         }
       </div>

       <!-- Chart -->
       <app-chart [data]="history()" [range]="selectedRange()"></app-chart>
    </div>
  `
})
export class ScoreCardComponent {
  // Cast inputs to Signal
  score = input.required<number>() as Signal<number>;
  history = input.required<number[]>() as Signal<number[]>;

  selectedRange = signal<'7d' | '30d' | '90d'>('7d');
  ranges: ('7d' | '30d' | '90d')[] = ['7d', '30d', '90d'];

  trend = computed(() => {
    const hist = this.history();
    if (hist.length < 2) return { direction: 'up', value: '0.0' };
    
    const current = hist[hist.length - 1];
    const prev = hist[hist.length - 2];
    const diff = current - prev;
    
    return {
      direction: diff >= 0 ? 'up' : 'down',
      value: Math.abs(diff).toFixed(1)
    };
  });
}
