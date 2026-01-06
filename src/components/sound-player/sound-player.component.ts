
import { Component, input, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundTrack } from '../../models/types';

@Component({
  selector: 'app-sound-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-stone-900 border border-pastel-cyan/30 dark:border-stone-800 rounded-xl p-6 shadow-lg shadow-cyan-100/50 dark:shadow-none mb-4">
      
      <div class="flex items-center justify-between mb-4">
         <h2 class="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <span>🎧</span> Sonic Resonance
         </h2>
         <div class="flex gap-1">
             <div class="w-1 h-3 rounded-full bg-pastel-cyan animate-pulse"></div>
             <div class="w-1 h-5 rounded-full bg-pastel-cyanDark animate-[pulse_1s_infinite]"></div>
             <div class="w-1 h-4 rounded-full bg-pastel-cyan animate-pulse"></div>
         </div>
      </div>

      <div class="space-y-3">
        @for (track of tracks(); track track.id) {
            <div class="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 hover:border-pastel-cyan transition-all cursor-pointer group"
                 (click)="togglePlay(track.id)">
                
                <div class="flex items-center gap-4">
                    <button class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                            [class.bg-pastel-cyanDark]="activeTrackId() === track.id"
                            [class.text-stone-900]="activeTrackId() === track.id"
                            [class.bg-stone-200]="activeTrackId() !== track.id"
                            [class.dark:bg-stone-700]="activeTrackId() !== track.id"
                            [class.text-stone-500]="activeTrackId() !== track.id">
                        @if (activeTrackId() === track.id) {
                            <span>⏸</span>
                        } @else {
                            <span class="ml-1">▶</span>
                        }
                    </button>
                    <div>
                        <div class="font-medium text-sm text-stone-800 dark:text-stone-200 group-hover:text-pastel-cyanDark transition-colors">{{ track.title }}</div>
                        <div class="text-xs text-stone-500 flex gap-2">
                            <span class="font-bold text-pastel-cyanDark">{{ track.frequency }}</span>
                            <span>•</span>
                            <span>{{ track.category }}</span>
                        </div>
                    </div>
                </div>

                @if (activeTrackId() === track.id) {
                    <div class="flex gap-0.5 items-end h-4">
                        <div class="w-0.5 bg-pastel-cyanDark animate-[bounce_0.8s_infinite] h-2"></div>
                        <div class="w-0.5 bg-pastel-cyanDark animate-[bounce_1.2s_infinite] h-4"></div>
                        <div class="w-0.5 bg-pastel-cyanDark animate-[bounce_0.5s_infinite] h-3"></div>
                        <div class="w-0.5 bg-pastel-cyanDark animate-[bounce_1.0s_infinite] h-1"></div>
                    </div>
                }
            </div>
        }
      </div>
    </div>
  `
})
export class SoundPlayerComponent {
  tracks = input.required<SoundTrack[]>() as Signal<SoundTrack[]>;
  
  activeTrackId = signal<string | null>(null);

  togglePlay(id: string) {
    if (this.activeTrackId() === id) {
        this.activeTrackId.set(null);
    } else {
        this.activeTrackId.set(id);
    }
  }
}
