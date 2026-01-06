import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-white">
      <!-- Hero Section -->
      <div class="max-w-6xl mx-auto px-6 py-16">
        <!-- Header -->
        <header class="flex justify-between items-center mb-20">
          <h1 class="text-2xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
            Ascend ✨
          </h1>
          <div class="flex gap-4">
            <button (click)="goToLogin()" 
                    class="px-6 py-2 rounded-full text-stone-300 hover:text-white transition-colors">
              Sign In
            </button>
            <button (click)="goToRegister()" 
                    class="px-6 py-2 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 text-stone-900 font-semibold hover:shadow-lg hover:shadow-lime-500/25 transition-all">
              Get Started
            </button>
          </div>
        </header>

        <!-- Hero Content -->
        <div class="text-center mb-20">
          <h2 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Become Your
            <span class="bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Best Self
            </span>
          </h2>
          <p class="text-xl text-stone-400 max-w-2xl mx-auto mb-10">
            Track habits, manifest your dreams, and unlock your potential with AI-powered insights and voice interaction.
          </p>
          <button (click)="goToRegister()" 
                  class="px-10 py-4 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 text-stone-900 font-bold text-lg hover:scale-105 hover:shadow-xl hover:shadow-lime-500/30 transition-all">
            Start Your Journey →
          </button>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-3 gap-8 mb-20">
          <div class="bg-stone-900/50 backdrop-blur border border-stone-800 rounded-2xl p-8">
            <div class="text-4xl mb-4">🎯</div>
            <h3 class="text-xl font-bold mb-2 text-lime-400">Smart Goals</h3>
            <p class="text-stone-400">Track your progress with intelligent goal management and visual sparklines.</p>
          </div>
          <div class="bg-stone-900/50 backdrop-blur border border-stone-800 rounded-2xl p-8">
            <div class="text-4xl mb-4">🎤</div>
            <h3 class="text-xl font-bold mb-2 text-violet-400">Voice AI</h3>
            <p class="text-stone-400">Just speak to update your progress. Our AI understands and acts on your commands.</p>
          </div>
          <div class="bg-stone-900/50 backdrop-blur border border-stone-800 rounded-2xl p-8">
            <div class="text-4xl mb-4">✨</div>
            <h3 class="text-xl font-bold mb-2 text-cyan-400">Manifestation</h3>
            <p class="text-stone-400">Practice 3-6-9, visualization, and other techniques with guided sessions.</p>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="text-center bg-gradient-to-r from-lime-900/20 to-emerald-900/20 border border-lime-800/30 rounded-3xl p-12">
          <h3 class="text-3xl font-bold mb-4">Ready to Ascend?</h3>
          <p class="text-stone-400 mb-8">Join thousands of people transforming their lives, one habit at a time.</p>
          <button (click)="goToRegister()" 
                  class="px-8 py-3 rounded-full bg-white text-stone-900 font-bold hover:bg-lime-400 transition-colors">
            Create Free Account
          </button>
        </div>

        <!-- Footer -->
        <footer class="text-center text-stone-500 mt-20 pb-8">
          <p>© 2026 Ascend. Built with ❤️ for personal growth.</p>
        </footer>
      </div>
    </div>
  `
})
export class LandingComponent {
  constructor(private router: Router, private auth: AuthService) {
    // Redirect to dashboard if already authenticated
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
