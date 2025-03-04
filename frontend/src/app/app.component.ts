import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService],
  templateUrl: './app.component.html',
})
export class AppComponent {}
