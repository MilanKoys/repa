import {
  Component,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { Nullable } from 'primeng/ts-helpers';
import { AttendanceStatus } from '../../views/attendance/attendance.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-sidebar',
  imports: [ButtonModule, DividerModule, TooltipModule, RouterLink, MenuModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _router: Router = inject(Router);
  private readonly _currentPath: WritableSignal<Nullable<string>> =
    signal(null);
  protected readonly avatarMenu: MenuItem[] = [
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.signOut(),
    },
  ];
  protected readonly currentPath: Signal<Nullable<string>> =
    this._currentPath.asReadonly();

  constructor() {
    this._router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url: string = event.url.split('?')[0].slice(1);
        this._currentPath.set(url);
      }
    });
  }

  protected signOut() {
    const headers: HttpHeaders = new HttpHeaders().append(
      'authorization',
      localStorage.getItem('token') ?? ''
    );
    this._httpClient
      .get('http://localhost:3000/auth/logout', { headers })
      .subscribe(() => {
        localStorage.removeItem('token');
        this._router.navigateByUrl('/login');
      });
  }
}
