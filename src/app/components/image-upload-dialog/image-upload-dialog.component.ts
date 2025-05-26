import { Component, Inject, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-upload-dialog.component.ts',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    FormsModule,
  ],
  templateUrl: './image-upload-dialog.component.html',
  styleUrls: ['./image-upload-dialog.component.css'],
})
export class ImageUploadDialog {
  mode: 'url' | 'file' = 'url';
  url: string = '';
  previewImage: string | null = null;
  selectedFile: File | null = null;

  constructor(private dialogRef: MatDialogRef<ImageUploadDialog>) {}

  updatePreview(): void {
    this.previewImage = this.url || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  confirm(): void {
    this.dialogRef.close(this.previewImage); // restituisci la stringa base64 o url
  }

  close(): void {
    this.dialogRef.close();
  }
}
