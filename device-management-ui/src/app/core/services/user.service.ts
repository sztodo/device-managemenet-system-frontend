import { inject, Injectable, signal } from '@angular/core';
import { CreateUserRequest, UpdateUserRequest, User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly BASE = '/User';

  private readonly _users = signal<User[]>([]);
  private readonly _loading = signal(false);

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {}

  loadAll(): Observable<User[]> {
    this._loading.set(true);
    return this.http.get<User[]>(this.BASE).pipe(
      tap({
        next: users => {
          this._users.set(users);
          this._loading.set(false);
        },
        error: () => this._loading.set(false)
      })
    );
  }

  create(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.BASE, request).pipe(
      tap(user => this._users.update(list => [...list, user]))
    );
  }

  update(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.BASE}/${id}`, request).pipe(
      tap(updated => this._users.update(list => list.map(u => u.id === id ? updated : u)))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
      tap(() => this._users.update(list => list.filter(u => u.id !== id)))
    );
  }
}
