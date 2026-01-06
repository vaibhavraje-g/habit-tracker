
import { Component, input, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Manifestation } from '../../models/types';

@Component({
  selector: 'app-manifestation-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative overflow-hidden bg-white dark:bg-stone-900 border border-pastel-violet/30 dark:border-stone-800 rounded-xl p-6 mb-4 shadow-lg shadow-violet-100/50 dark:shadow-none transition-all duration-500">
      
      <!-- Card Glow Effect for styling -->
      <div class="absolute -right-10 -top-10 w-32 h-32 bg-pastel-violet/20 dark:bg-pastel-violet/5 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <div class="flex justify-between items-start mb-4 relative z-10">
        <div>
           <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase tracking-widest text-pastel-violetDark">{{ item().technique }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">Streak: {{ item().streak }}</span>
           </div>
           <h3 class="text-lg font-medium text-stone-800 dark:text-stone-100 italic">"{{ item().affirmation }}"</h3>
        </div>
        <div class="text-2xl opacity-80 grayscale group-hover:grayscale-0 transition-all">
           {{ icon() }}
        </div>
      </div>

      <!-- Technique: 3-6-9 Method -->
      @if (item().technique === '3-6-9') {
        <div class="grid grid-cols-3 gap-2 mt-4">
           <!-- Morning -->
           <button (click)="toggle369('morning')" 
                   class="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-300"
                   [class.bg-pastel-violet]="progress().morning"
                   [class.border-pastel-violet]="progress().morning"
                   [class.bg-stone-50]="!progress().morning"
                   [class.dark:bg-stone-800]="!progress().morning"
                   [class.border-stone-200]="!progress().morning"
                   [class.dark:border-stone-700]="!progress().morning">
              <span class="text-[10px] uppercase font-bold text-stone-500" [class.text-stone-800]="progress().morning">AM (3x)</span>
              <div class="w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center"
                   [class.border-stone-900]="progress().morning"
                   [class.bg-stone-900]="progress().morning">
                 @if(progress().morning) { <span class="text-[8px] text-white">✓</span> }
              </div>
           </button>

           <!-- Afternoon -->
           <button (click)="toggle369('afternoon')"
                   class="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-300"
                   [class.bg-pastel-violet]="progress().afternoon"
                   [class.border-pastel-violet]="progress().afternoon"
                   [class.bg-stone-50]="!progress().afternoon"
                   [class.dark:bg-stone-800]="!progress().afternoon"
                   [class.border-stone-200]="!progress().afternoon"
                   [class.dark:border-stone-700]="!progress().afternoon">
              <span class="text-[10px] uppercase font-bold text-stone-500" [class.text-stone-800]="progress().afternoon">Noon (6x)</span>
              <div class="w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center"
                   [class.border-stone-900]="progress().afternoon"
                   [class.bg-stone-900]="progress().afternoon">
                 @if(progress().afternoon) { <span class="text-[8px] text-white">✓</span> }
              </div>
           </button>

           <!-- Evening -->
           <button (click)="toggle369('evening')"
                   class="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-300"
                   [class.bg-pastel-violet]="progress().evening"
                   [class.border-pastel-violet]="progress().evening"
                   [class.bg-stone-50]="!progress().evening"
                   [class.dark:bg-stone-800]="!progress().evening"
                   [class.border-stone-200]="!progress().evening"
                   [class.dark:border-stone-700]="!progress().evening">
              <span class="text-[10px] uppercase font-bold text-stone-500" [class.text-stone-800]="progress().evening">PM (9x)</span>
              <div class="w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center"
                   [class.border-stone-900]="progress().evening"
                   [class.bg-stone-900]="progress().evening">
                 @if(progress().evening) { <span class="text-[8px] text-white">✓</span> }
              </div>
           </button>
        </div>
      }

      <!-- Technique: Visualization -->
      @if (item().technique === 'visualization') {
        <div class="mt-4">
           @if (!isVisualizing()) {
               <button (click)="startVisualization()" 
                       class="w-full py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-pastel-violet hover:dark:bg-pastel-violetDark border border-stone-200 dark:border-stone-700 hover:border-pastel-violet transition-all duration-300 flex items-center justify-center gap-2 group">
                   <span class="text-xl group-hover:scale-110 transition-transform">👁️</span>
                   <span class="text-xs font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400 group-hover:text-stone-900">Visualize (68s)</span>
               </button>
           } @else {
               <div class="w-full py-3 rounded-xl bg-stone-900 text-pastel-violet border border-pastel-violet flex flex-col items-center justify-center relative overflow-hidden">
                   <!-- Progress Bar Background -->
                   <div class="absolute left-0 top-0 bottom-0 bg-pastel-violet/20 transition-all duration-1000 ease-linear"
                        [style.width.%]="(timer() / 68) * 100"></div>
                   
                   <span class="relative z-10 text-2xl font-mono font-bold">{{ timer() }}s</span>
                   <span class="relative z-10 text-[10px] uppercase tracking-widest opacity-70">Hold the feeling</span>
               </div>
           }
        </div>
      }
    </div>
  `
})
export class ManifestationCardComponent {
  item = input.required<Manifestation>() as Signal<Manifestation>;

  // Local state for 3-6-9
  progress = signal({ morning: false, afternoon: false, evening: false });

  // Local state for Visualization
  isVisualizing = signal(false);
  timer = signal(0);

  constructor() {
    // Initialize 369 state from input if available
    // In a real app, this would use effect() to sync
  }

  icon = computed(() => {
    switch (this.item().technique) {
        case '3-6-9': return '✍️';
        case 'visualization': return '🧘';
        case 'scripting': return '📜';
        default: return '✨';
    }
  });

  toggle369(time: 'morning' | 'afternoon' | 'evening') {
    this.progress.update(p => ({ ...p, [time]: !p[time] }));
  }

  startVisualization() {
    this.isVisualizing.set(true);
    this.timer.set(0);
    
    const interval = setInterval(() => {
        this.timer.update(t => t + 1);
        if (this.timer() >= 68) {
            clearInterval(interval);
            this.isVisualizing.set(false);
            // In real app, emit completion event here
        }
    }, 1000);
  }
}
