import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Toast } from './shared/components/toast/toast';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toast, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
    protected readonly authService = inject(AuthService);

}
