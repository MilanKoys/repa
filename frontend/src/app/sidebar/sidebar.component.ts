import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-sidebar',
  imports: [ButtonModule, DividerModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {}
