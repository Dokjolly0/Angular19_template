import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { catchError, Subject, takeUntil, throwError } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { googleSVG } from '../../svg/google.svg';
import { gitHubSVG } from '../../svg/github.svg';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
  ],
})
export class LoginComponent {
  // Reactive FormGroup per il login
  loginForm: FormGroup = new FormGroup({});

  // Subject per pulire gli observable in ngOnDestroy (best practice)
  private destroyed$ = new Subject<void>();

  // Dependency Injection moderna (Angular 14+)
  private fb = inject(FormBuilder);
  private authSrv = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private sanitizer = inject(DomSanitizer);

  loginError = '';

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    // Pulisce l'errore appena l'utente modifica qualcosa nei campi
    this.loginForm.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.loginError = '';
      });
  }

  login(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authSrv
        .login(username, password)
        .pipe(
          takeUntil(this.destroyed$),
          catchError((err) => {
            this.loginError = err?.error?.message || 'Errore di login';
            this.snackBar.open(this.loginError, 'Chiudi', { duration: 3000 });
            return throwError(() => err);
          })
        )
        .subscribe(() => {
          this.snackBar.open('Login effettuato con successo!', 'Chiudi', {
            duration: 3000,
          });
          this.router.navigate(['/']);
        });
    } else {
      this.snackBar.open('Compila tutti i campi obbligatori', 'Chiudi', {
        duration: 3000,
      });
    }
  }

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  loginWithGithub(): void {
    window.location.href = `${environment.apiUrl}/auth/github`;
  }

  // Restituisce l'SVG di Google come HTML "sicuro"
  googleSVG(pixel: number): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(googleSVG(`${pixel}`));
  }

  gitHubSVG(pixel: number): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(gitHubSVG(`${pixel}`));
  }

  // Pulizia memory leak su destroy del componente
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
