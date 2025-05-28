import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
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
  fileError: string | null = null;

  constructor(private dialogRef: MatDialogRef<ImageUploadDialog>) {}

  updatePreview(): void {
    if (this.isValidImageUrl(this.url)) {
      this.previewImage = this.url;
    } else {
      this.previewImage = null;
    }
  }

  isValidImageUrl(url: string): boolean {
    return /\.(jpeg|jpg|gif|png|bmp|webp|svg)$/i.test(url);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileError = null;

      if (!file.type.startsWith('image/')) {
        this.previewImage = null;
        this.fileError = "Il file selezionato non è un'immagine valida.";
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  confirm(): void {
    if (!this.previewImage || this.fileError) {
      this.fileError = this.fileError || 'Nessuna immagine valida selezionata.';
      return;
    }
    this.dialogRef.close(this.previewImage);
  }

  delete(): void {
    this.previewImage = null;
    this.selectedFile = null;
    this.url = '';
    this.fileError = null;
    this.dialogRef.close('delete');
  }

  close(): void {
    this.dialogRef.close();
  }
}
