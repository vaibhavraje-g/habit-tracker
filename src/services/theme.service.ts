
import { Injectable, signal, computed, effect } from '@angular/core';

export type ThemeMode = 'auto' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  mode = signal<ThemeMode>('auto');

  // Computed signal to determine if we should effectively be in dark mode
  isDark = computed(() => {
    const m = this.mode();
    if (m === 'auto') {
      const hours = new Date().getHours();
      // Dark mode from 6 PM (18:00) to 6 AM (06:00)
      return hours >= 18 || hours < 6;
    }
    return m === 'dark';
  });

  constructor() {
    // Apply the class to the HTML element whenever isDark changes
    effect(() => {
      const isDark = this.isDark();
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  cycleMode() {
    const modes: ThemeMode[] = ['auto', 'light', 'dark'];
    const currentIndex = modes.indexOf(this.mode());
    const nextIndex = (currentIndex + 1) % modes.length;
    this.mode.set(modes[nextIndex]);
  }
}
