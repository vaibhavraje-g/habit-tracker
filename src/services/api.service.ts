import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const API_BASE = 'http://localhost:3001/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private token: string | null = null;

  setToken(token: string | null): void {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  get<T>(endpoint: string): Observable<T> {
    return from(
      fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(error.error || 'Request failed');
        }
        return res.json();
      })
    ).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return from(
      fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(error.error || 'Request failed');
        }
        return res.json();
      })
    ).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return from(
      fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(error.error || 'Request failed');
        }
        return res.json();
      })
    ).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return from(
      fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(error.error || 'Request failed');
        }
        return res.json();
      })
    ).pipe(
      catchError((err) => throwError(() => err))
    );
  }
}
