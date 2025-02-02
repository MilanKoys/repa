import { HttpClient } from '@angular/common/http';
import {
  Component,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { Nullable } from 'primeng/ts-helpers';
import { take } from 'rxjs';

interface loginResponse {
  error: Nullable<string>;
  token: Nullable<string>;
  details: ErrorDetails[];
}

interface ErrorDetails {
  message: string;
  context: {
    key: string;
  };
}

@Component({
  selector: 'app-login',
  imports: [
    CardModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly _router: Router = inject(Router);
  private readonly _messageService: MessageService = inject(MessageService);
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _loginForm: FormGroup<{
    email: FormControl<Nullable<string>>;
    password: FormControl<Nullable<string>>;
  }> = this._formBuilder.group({
    email: this._formBuilder.control<Nullable<string>>(null),
    password: this._formBuilder.control<Nullable<string>>(null),
  });
  private readonly _disabled: WritableSignal<boolean> = signal(false);

  protected readonly disabled: Signal<boolean> = this._disabled.asReadonly();

  private _success(value: loginResponse) {
    if (value.error || value.details) {
      this._disabled.set(false);
      if (value.details) this._parseErrors(value.details);
      return this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: value.error ?? value.details.map((d) => d.message).join(),
      });
    }

    if (value.token) {
      this._authorize(value.token);
    }
  }

  private _parseErrors(details: ErrorDetails[]) {
    let keys: string[] = [];
    if (details) {
      details.forEach((detail) => {
        keys.push(detail.context.key);
      });
    }

    if (keys.length) {
      keys.forEach((key) => {
        this._loginForm.controls[key as 'email' | 'password'].setErrors({
          error: 'error',
        });
      });
    } else {
      this._loginForm.controls.email.setErrors({ error: 'error' });
      this._loginForm.controls.password.setErrors({ error: 'error' });
    }
  }

  private _authorize(token: string) {
    const formValues = this._loginForm.value;
    localStorage.setItem('token', token);
    this._messageService.add({
      severity: 'success',
      summary: 'Logged in successfully',
      detail: `Welcome back ${formValues.email}!`,
    });
    this._redirect();
  }

  private _redirect() {
    setTimeout(() => this._router.navigateByUrl('/'), 1200);
  }

  protected login() {
    this._disabled.set(true);
    const formValues = this._loginForm.value;
    this._httpClient
      .post<loginResponse>('http://localhost:3000/auth/login', {
        email: formValues.email,
        password: formValues.password,
      })
      .pipe(take(1))
      .subscribe((value) => this._success(value));
  }

  protected get form() {
    return this._loginForm;
  }
}
