
import { Component, computed, input, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-48 mt-4 select-none group">
      <!-- Tooltip Container -->
      @if (hoveredPoint(); as point) {
        <div class="absolute z-20 pointer-events-none transition-all duration-75 ease-out flex flex-col items-center"
             [style.left.px]="point.x"
             [style.top.px]="point.y - 60">
             
             <div class="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs px-3 py-2 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700 whitespace-nowrap flex flex-col items-center">
                <span class="font-bold text-base text-stone-700 dark:text-pastel-limeDark">{{ point.val }}</span>
                <span class="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wide">{{ point.date }}</span>
             </div>
             
             <!-- Arrow -->
             <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-stone-700 mt-[-1px] drop-shadow-sm"></div>
        </div>
      }

      <svg viewBox="0 0 280 120" preserveAspectRatio="none" class="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#bef264" stop-opacity="0.3" class="dark:stop-opacity-0.2"/>
            <stop offset="100%" stop-color="#bef264" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        <line x1="0" y1="20" x2="280" y2="20" class="stroke-stone-300/30 dark:stroke-white/5" stroke-width="1" stroke-dasharray="4 4" />
        <line x1="0" y1="60" x2="280" y2="60" class="stroke-stone-300/30 dark:stroke-white/5" stroke-width="1" stroke-dasharray="4 4" />
        <line x1="0" y1="100" x2="280" y2="100" class="stroke-stone-300/30 dark:stroke-white/5" stroke-width="1" stroke-dasharray="4 4" />
        
        <!-- Area under curve -->
        <path [attr.d]="areaPath()" class="fill-[url(#gradient)] transition-all duration-500" />

        <!-- Line Path (Smooth Curve) -->
        <path [attr.d]="linePath()" fill="none" class="stroke-lime-600 dark:stroke-pastel-limeDark stroke-[2] drop-shadow-lg transition-all duration-500" stroke-linecap="round" stroke-linejoin="round" />
        
        <!-- Interactive Dots -->
        @for (pt of points(); track $index) {
          <g (mouseenter)="hoveredIndex.set($index)" (mouseleave)="hoveredIndex.set(null)">
            <!-- Invisible hit target for easier hovering -->
            <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="8" fill="transparent" class="cursor-pointer" />
            
            <!-- Visible Dot -->
            <circle 
              [attr.cx]="pt.x" 
              [attr.cy]="pt.y" 
              [attr.r]="hoveredIndex() === $index ? 5 : 2" 
              class="fill-stone-100 dark:fill-stone-900 stroke-lime-600 dark:stroke-pastel-limeDark stroke-2 transition-all duration-200 pointer-events-none" 
            />
          </g>
        }
      </svg>
      
      <!-- X-Axis Labels -->
      <div class="flex justify-between text-[10px] font-medium text-stone-400 dark:text-stone-500 mt-2 px-1">
         <span>{{ startDateLabel() }}</span>
         <span>Today</span>
      </div>
    </div>
  `
})
export class ChartComponent {
  // Cast inputs to Signal to avoid "has no call signatures" error
  data = input.required<number[]>() as Signal<number[]>;
  range = input.required<'7d' | '30d' | '90d'>() as Signal<'7d' | '30d' | '90d'>;

  hoveredIndex = signal<number | null>(null);

  private width = 280;
  private height = 120;
  private padding = 10;

  slicedData = computed(() => {
    const fullData = this.data();
    const count = this.range() === '7d' ? 7 : this.range() === '30d' ? 30 : 90;
    return fullData.slice(-count);
  });

  points = computed(() => {
    const data = this.slicedData();
    if (!data.length) return [];
    
    const max = Math.max(...data, 100);
    const min = Math.min(...data, 0);
    const rangeVal = max - min || 1;
    const now = new Date();

    return data.map((val, i) => {
      const x = (i / (data.length - 1)) * this.width;
      const y = this.height - this.padding - ((val - min) / rangeVal) * (this.height - 2 * this.padding);
      
      // Calculate date label
      const dateOffset = data.length - 1 - i;
      const d = new Date();
      d.setDate(now.getDate() - dateOffset);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return { x, y, val, date: dateStr };
    });
  });

  hoveredPoint = computed(() => {
    const idx = this.hoveredIndex();
    if (idx === null) return null;
    return this.points()[idx];
  });

  linePath = computed(() => {
    const pts = this.points();
    if (!pts.length) return '';
    return this.createSmoothPath(pts);
  });

  areaPath = computed(() => {
    const pts = this.points();
    if (!pts.length) return '';
    const line = this.createSmoothPath(pts);
    return `${line} L ${this.width} ${this.height} L 0 ${this.height} Z`;
  });

  startDateLabel = computed(() => {
     const r = this.range();
     if (r === '7d') return '7 days ago';
     if (r === '30d') return '30 days ago';
     return '90 days ago';
  });

  private createSmoothPath(points: {x: number, y: number}[]): string {
    if (points.length < 2) return '';
    
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        
        const mx = (p0.x + p1.x) / 2;
        
        const cp1x = mx;
        const cp1y = p0.y;
        const cp2x = mx;
        const cp2y = p1.y;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }
}
