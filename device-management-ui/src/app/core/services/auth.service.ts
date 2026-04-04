import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../models/auth.model';
import { tap } from 'rxjs';

const TOKEN_KEY = 'dm_token';
const USER_KEY = 'dm_user';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<AuthUser | null>(this.loadUserFromStorage());
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'Admin');

  // The linked User.Id — used to check device ownership
  readonly linkedUserId = computed(() => this._currentUser()?.linkedUserId ?? null);

  register(request: RegisterRequest) {
    return this.http
      .post<AuthResponse>('/auth/register', request)
      .pipe(tap((res) => this.persist(res)));
  }

  login(request: LoginRequest) {
    return this.http
      .post<AuthResponse>('/auth/login', request)
      .pipe(tap((res) => this.persist(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private persist(res: AuthResponse): void {
    const user: AuthUser = {
      email: res.email,
      role: res.role,
      authUserId: res.authUserId,
      linkedUserId: res.linkedUserId,
    };
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(res.token);
    this._currentUser.set(user);
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
