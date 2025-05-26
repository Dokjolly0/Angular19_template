import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { genderOptions } from '../../const/gender';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { gitHubSVG } from '../../svg/github.svg';
import { googleSVG } from '../../svg/google.svg';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ImageUploadDialog } from '../../components/image-upload-dialog/image-upload-dialog.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private destroyed$ = new Subject<void>();
  private sanitizer = inject(DomSanitizer);
  private dialog = inject(MatDialog);

  registerForm: FormGroup = new FormGroup({});
  genderOptions = genderOptions;
  previewImage: string | null = null;
  selectedImageFile: File | null = null;
  pictureMode: 'url' | 'file' = 'url';

  updatePreviewFromUrl(): void {
    const url = this.registerForm.get('picture')?.value;
    this.previewImage = url || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedImageFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
        // Opzionalmente puoi salvare il base64 nel campo "picture"
        this.registerForm.get('picture')?.setValue(this.previewImage);
      };
      reader.readAsDataURL(file);
    }
  }

  openImageDialog(): void {
    const dialogRef = this.dialog.open(ImageUploadDialog, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.previewImage = result;
        this.registerForm.get('picture')?.setValue(result);
      }
    });
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        username: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        checkpassword: ['', Validators.required],
        picture: [''],
        birthDate: [''],
        gender: [''],
      },
      {
        validators: [this.matchPasswordsValidator()],
      }
    );

    this.registerForm.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        // resetto eventuali messaggi di errore
      });
  }

  register(): void {
    if (this.registerForm.valid) {
      const user = this.registerForm.value;
      // TODO: invia `user` al tuo AuthService/register API

      this.snackBar.open('Registrazione completata!', 'Chiudi', {
        duration: 3000,
      });
      this.router.navigate(['/login']);
    } else {
      this.snackBar.open('Controlla tutti i campi obbligatori', 'Chiudi', {
        duration: 3000,
      });
    }
  }

  matchPasswordsValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const checkpassword = group.get('checkpassword')?.value;
      return password === checkpassword ? null : { passwordMismatch: true };
    };
  }

  registerWithGoogle(): void {
    window.location.href = `${environment.googleAuthLink}`;
  }

  registerWithGithub(): void {
    window.location.href = `${environment.gitHubAuthLink}`;
  }

  // Restituisce l'SVG di Google come HTML "sicuro"
  googleSVG(pixel: number): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(googleSVG(pixel));
  }

  gitHubSVG(pixel: number): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(gitHubSVG(pixel));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
