import {
  Component,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { Nullable } from 'primeng/ts-helpers';

@Component({
  selector: 'app-sidebar',
  imports: [ButtonModule, DividerModule, TooltipModule, RouterLink],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly _router: Router = inject(Router);
  private readonly _currentPath: WritableSignal<Nullable<string>> =
    signal(null);
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
}
