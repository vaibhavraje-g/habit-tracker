import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap, catchError, of } from 'rxjs';

export interface User {
  _id: string;
  name: string;
  email: string;
  score: number;
  history: number[];
  settings: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _isLoading = signal(false);

  // Public computed signals
  user = computed(() => this._user());
  isAuthenticated = computed(() => !!this._token());
  isLoading = computed(() => this._isLoading());

  constructor(private api: ApiService) {
    // Check for existing token on startup
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('ascend_token');
    const userStr = localStorage.getItem('ascend_user');
    
    if (token && userStr) {
      try {
        this._token.set(token);
        this._user.set(JSON.parse(userStr));
        this.api.setToken(token);
      } catch {
        this.clearAuth();
      }
    }
  }

  private saveAuth(token: string, user: User): void {
    localStorage.setItem('ascend_token', token);
    localStorage.setItem('ascend_user', JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
    this.api.setToken(token);
  }

  private clearAuth(): void {
    localStorage.removeItem('ascend_token');
    localStorage.removeItem('ascend_user');
    this._token.set(null);
    this._user.set(null);
    this.api.setToken(null);
  }

  register(name: string, email: string, password: string): Observable<AuthResponse | null> {
    this._isLoading.set(true);
    return this.api.post<AuthResponse>('/auth/register', { name, email, password }).pipe(
      tap((res) => {
        this.saveAuth(res.token, res.user);
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._isLoading.set(false);
        console.error('Registration failed:', err);
        throw err;
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse | null> {
    this._isLoading.set(true);
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap((res) => {
        this.saveAuth(res.token, res.user);
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._isLoading.set(false);
        console.error('Login failed:', err);
        throw err;
      })
    );
  }

  logout(): void {
    this.api.post('/auth/logout', {}).subscribe();
    this.clearAuth();
  }

  refreshUser(): Observable<User | null> {
    return this.api.get<{ user: User }>('/auth/me').pipe(
      tap((res) => {
        this._user.set(res.user);
        localStorage.setItem('ascend_user', JSON.stringify(res.user));
      }),
      catchError(() => {
        this.clearAuth();
        return of(null);
      })
    ) as any;
  }
}
