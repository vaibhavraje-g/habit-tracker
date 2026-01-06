
import { Component, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-[3px] h-8 items-end mt-3">
      @for (val of data(); track $index) {
        <div 
          class="flex-1 rounded-[1px] transition-all duration-500"
          [style.height.%]="val"
          [style.background-color]="color()"
          [class.opacity-40]="!$last"
          [class.opacity-100]="$last">
        </div>
      }
    </div>
  `
})
export class SparklineComponent {
  // Cast inputs to Signal to resolve call signature issues
  data = input.required<number[]>() as Signal<number[]>;
  colorTheme = input.required<'lime' | 'yellow' | 'emerald'>() as Signal<'lime' | 'yellow' | 'emerald'>;

  color = computed(() => {
    // Slightly darker for light mode visibility? 
    // For now keeping simple, maybe adjust logic if needed.
    switch (this.colorTheme()) {
      case 'lime': return '#84cc16'; // lime-500
      case 'yellow': return '#eab308'; // yellow-500
      case 'emerald': return '#10b981'; // emerald-500
      default: return '#84cc16';
    }
  });
}
