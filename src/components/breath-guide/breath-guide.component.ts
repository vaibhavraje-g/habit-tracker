
import { Component, input, signal, computed, effect, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreathPattern } from '../../models/types';

@Component({
  selector: 'app-breath-guide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm mb-4">
        
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-bold text-stone-800 dark:text-stone-100">Prana Flow</h2>
            <select class="bg-stone-100 dark:bg-stone-800 text-xs py-1 px-3 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 outline-none"
                    (change)="selectPattern($event)">
                @for (p of patterns(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                }
            </select>
        </div>

        @if (!isActive()) {
            <div class="flex flex-col items-center justify-center py-8 gap-4">
                <div class="text-center">
                    <div class="text-2xl font-light text-stone-800 dark:text-stone-200 mb-1">{{ selectedPattern().name }}</div>
                    <div class="text-xs text-stone-500 uppercase tracking-widest">{{ selectedPattern().description }}</div>
                </div>
                
                <div class="flex gap-4 text-xs text-stone-400 font-mono mt-2">
                    <div class="flex flex-col items-center">
                        <span>In</span>
                        <span class="text-lg text-pastel-cyanDark">{{ selectedPattern().inhale }}s</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span>Hold</span>
                        <span class="text-lg text-stone-500">{{ selectedPattern().holdIn }}s</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span>Out</span>
                        <span class="text-lg text-pastel-cyanDark">{{ selectedPattern().exhale }}s</span>
                    </div>
                    @if (selectedPattern().holdOut > 0) {
                        <div class="flex flex-col items-center">
                            <span>Hold</span>
                            <span class="text-lg text-stone-500">{{ selectedPattern().holdOut }}s</span>
                        </div>
                    }
                </div>

                <button (click)="startBreathing()" 
                        class="mt-4 px-8 py-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-sm hover:scale-105 transition-transform">
                    Start
                </button>
            </div>
        } @else {
            <div class="relative h-64 flex items-center justify-center overflow-hidden" (click)="stopBreathing()">
                
                <!-- Expanding Circle -->
                <div class="absolute w-32 h-32 rounded-full border-2 border-pastel-cyanDark/30 transition-all ease-linear duration-[var(--duration)]"
                     [style.--duration]="currentDuration() + 'ms'"
                     [class.scale-50]="phase() === 'exhale' || (phase() === 'holdOut' && !isTransitioning)"
                     [class.scale-150]="phase() === 'inhale' || (phase() === 'holdIn' && !isTransitioning)"
                     [class.bg-pastel-cyanDark]="phase() === 'inhale' || phase() === 'holdIn'"
                     [class.bg-transparent]="phase() === 'exhale' || phase() === 'holdOut'"
                     [class.opacity-20]="true">
                </div>

                <!-- Core Circle -->
                <div class="absolute w-32 h-32 rounded-full border-4 border-pastel-cyanDark flex items-center justify-center z-10 transition-all ease-linear duration-[var(--duration)]"
                     [style.--duration]="currentDuration() + 'ms'"
                     [class.scale-75]="phase() === 'exhale' || (phase() === 'holdOut' && !isTransitioning)"
                     [class.scale-125]="phase() === 'inhale' || (phase() === 'holdIn' && !isTransitioning)">
                     
                     <div class="flex flex-col items-center">
                        <span class="text-xl font-bold uppercase tracking-widest text-stone-800 dark:text-stone-100">{{ phaseLabel() }}</span>
                        <!-- Optional countdown logic could go here -->
                     </div>
                </div>

                <!-- Tap to stop -->
                <div class="absolute bottom-0 text-[10px] uppercase tracking-widest text-stone-400">Tap to stop</div>
            </div>
        }
    </div>
  `
})
export class BreathGuideComponent {
  patterns = input.required<BreathPattern[]>() as Signal<BreathPattern[]>;
  
  selectedPatternId = signal<string>('b1');
  isActive = signal(false);
  
  // Breath State Machine
  phase = signal<'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('inhale');
  currentDuration = signal(4000); // ms
  isTransitioning = false; // Internal flag
  
  private intervalId: any;

  selectedPattern = computed(() => {
    return this.patterns().find(p => p.id === this.selectedPatternId()) || this.patterns()[0];
  });

  phaseLabel = computed(() => {
    switch(this.phase()) {
        case 'inhale': return 'Inhale';
        case 'holdIn': return 'Hold';
        case 'exhale': return 'Exhale';
        case 'holdOut': return 'Hold';
    }
  });

  selectPattern(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.selectedPatternId.set(target.value);
    this.stopBreathing();
  }

  startBreathing() {
    this.isActive.set(true);
    this.runCycle('inhale');
  }

  stopBreathing() {
    this.isActive.set(false);
    clearTimeout(this.intervalId);
  }

  private runCycle(nextPhase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') {
    const p = this.selectedPattern();
    let duration = 0;

    this.phase.set(nextPhase);

    switch(nextPhase) {
        case 'inhale': 
            duration = p.inhale * 1000;
            break;
        case 'holdIn': 
            duration = p.holdIn * 1000;
            break;
        case 'exhale': 
            duration = p.exhale * 1000;
            break;
        case 'holdOut': 
            duration = p.holdOut * 1000;
            break;
    }

    // Skip phases with 0 duration
    if (duration === 0) {
        this.nextStep(nextPhase);
        return;
    }

    this.currentDuration.set(duration);
    
    this.intervalId = setTimeout(() => {
        this.nextStep(nextPhase);
    }, duration);
  }

  private nextStep(current: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') {
    const p = this.selectedPattern();
    switch(current) {
        case 'inhale': this.runCycle('holdIn'); break;
        case 'holdIn': this.runCycle('exhale'); break;
        case 'exhale': this.runCycle('holdOut'); break;
        case 'holdOut': this.runCycle('inhale'); break;
    }
  }
}
