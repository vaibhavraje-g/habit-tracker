import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <a routerLink="/" class="text-3xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
            Ascend ✨
          </a>
          <p class="text-stone-500 mt-2">Welcome back!</p>
        </div>

        <!-- Login Form -->
        <div class="bg-stone-900/70 backdrop-blur border border-stone-800 rounded-2xl p-8">
          <h2 class="text-2xl font-bold text-white mb-6">Sign In</h2>

          @if (error()) {
            <div class="bg-red-900/30 border border-red-800 text-red-400 rounded-lg p-3 mb-4 text-sm">
              {{ error() }}
            </div>
          }

          <form (submit)="handleSubmit($event)">
            <div class="mb-4">
              <label class="block text-stone-400 text-sm mb-2">Email</label>
              <input type="email" 
                     [value]="email()"
                     (input)="email.set($any($event.target).value)"
                     placeholder="you@example.com"
                     class="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-lime-500 transition-colors"
                     required>
            </div>

            <div class="mb-6">
              <label class="block text-stone-400 text-sm mb-2">Password</label>
              <input type="password" 
                     [value]="password()"
                     (input)="password.set($any($event.target).value)"
                     placeholder="••••••••"
                     class="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-lime-500 transition-colors"
                     required>
            </div>

            <button type="submit"
                    [disabled]="isLoading()"
                    class="w-full py-3 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 text-stone-900 font-bold hover:shadow-lg hover:shadow-lime-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              @if (isLoading()) {
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <span class="text-stone-500">Don't have an account? </span>
            <a routerLink="/register" class="text-lime-400 hover:text-lime-300 font-medium">Sign up</a>
          </div>
        </div>

        <!-- Back Link -->
        <div class="text-center mt-6">
          <a routerLink="/" class="text-stone-500 hover:text-stone-300 text-sm">← Back to home</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  error = signal('');
  isLoading = signal(false);

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    this.error.set('');
    this.isLoading.set(true);

    this.auth.login(this.email(), this.password()).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.message || 'Login failed. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
