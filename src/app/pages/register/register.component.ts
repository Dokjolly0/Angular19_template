//  Angular Core & Common
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Forms
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

// Angular Router
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// RxJS
import { Subject, catchError, takeUntil, throwError } from 'rxjs';

// Custom Components and Services
import { environment } from '../../../environments/environment';
import { genderOptions } from '../../const/gender';
import { ImageUploadDialog } from '../../components/image-upload-dialog/image-upload-dialog.component';
import { AuthService } from '../../services/auth.service';

// Angular Platform Browser
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { gitHubSVG } from '../../svg/github.svg';
import { googleSVG } from '../../svg/google.svg';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    RouterModule,
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
  private authsrv = inject(AuthService);

  registerForm: FormGroup = new FormGroup({});
  genderOptions = genderOptions;
  previewImage: string | null = null;
  selectedImageFile: File | null = null;
  pictureMode: 'url' | 'file' = 'url';
  hidePassword = true;
  hideConfirmPassword = true;
  uploadedFileName: string = '';
  registerError: string = '';

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

    this.registerForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      // resetto eventuali messaggi di errore
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  openImageDialog(): void {
    const dialogRef = this.dialog.open(ImageUploadDialog, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (result === 'delete') {
        this.previewImage = null;
        this.selectedImageFile = null;
        this.registerForm.get('picture')?.setValue('');
        this.uploadedFileName = '';
        return;
      }

      if (result.type === 'url') {
        this.previewImage = result.data;
        this.registerForm.get('picture')?.setValue(result.data);
        this.uploadedFileName = this.extractFilenameFromUrl(result.data);
      } else if (result.type === 'file') {
        this.selectedImageFile = result.data;

        const reader = new FileReader();
        reader.onload = () => {
          this.previewImage = reader.result as string;
        };
        reader.readAsDataURL(result.data);

        this.registerForm.get('picture')?.setValue(result.data);
        this.uploadedFileName = result.data.name;
      }
    });
  }

  // Picture
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

  extractFilenameFromUrl(url: string): string {
    try {
      return url.split('/').pop()?.split('?')[0] ?? 'Immagine da URL';
    } catch {
      return 'Immagine da URL';
    }
  }

  // Password visibility toggle
  togglePasswordVisibility(isConfirmPassword: boolean = false) {
    if (!isConfirmPassword) this.hidePassword = !this.hidePassword;
    else this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  matchPasswordsValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const checkpassword = group.get('checkpassword')?.value;
      return password === checkpassword ? null : { passwordMismatch: true };
    };
  }

  // Registration method
  register(): void {
    if (!this.registerForm.valid) {
      this.snackBar.open('Controlla tutti i campi obbligatori', 'Chiudi', { duration: 3000 });
      return;
    }

    const formData = new FormData();
    const formValues = this.registerForm.value;

    for (const key in formValues) {
      if (key !== 'picture') {
        formData.append(key, formValues[key]);
      }
    }

    if (this.selectedImageFile) {
      formData.append('picture', this.selectedImageFile);
    } else if (formValues.picture) {
      formData.append('pictureUrl', formValues.picture); // se è URL
    }

    // const user = this.registerForm.value;
    // user.birthDate = user.birthDate ? user.birthDate.toISOString() : null;
    console.log('Dati di registrazione:', formValues);

    // Register
    // this.authsrv
    //   .register(user)
    //   .pipe(
    //     takeUntil(this.destroyed$),
    //     catchError((err) => {
    //       this.registerError =
    //         err?.error?.message || 'Errore di registrazione';
    //       this.snackBar.open(this.registerError, 'Chiudi', {
    //         duration: 3000,
    //       });
    //       return throwError(() => err);
    //     })
    //   )
    //   .subscribe(() => {
    //     this.snackBar.open('Registrazione completata!', 'Chiudi', {
    //       duration: 3000,
    //     });
    //     this.router.navigate(['/login']);
    //   });

    // this.snackBar.open('Registrazione completata!', 'Chiudi', {
    //   duration: 3000,
    // });
    // this.router.navigate(['/login']);
  }

  //OAuth methods
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
}
