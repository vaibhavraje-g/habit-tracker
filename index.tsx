

import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router';
import { routes } from './src/app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
}).catch((err) => console.error(err));
