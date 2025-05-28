import { Component, ViewChild } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-upload-dialog',
  standalone: true,
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
  isDragging = false;

  @ViewChild('fileInput') fileInput!: HTMLInputElement;

  constructor(private dialogRef: MatDialogRef<ImageUploadDialog>) {}

  /** Gestione URL immagine */
  onImageUrlChange(): void {
    this.fileError = null;
    this.previewImage = this.url;
  }

  onImageLoad(): void {
    this.fileError = null;
  }

  onImageError(): void {
    this.previewImage = null;
    this.fileError = 'Immagine non valida o URL non raggiungibile.';
  }

  /** Gestione file drag & drop */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleSelectedFile(file);
  }

  /** Gestione selezione file manuale */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleSelectedFile(file);
  }

  private handleSelectedFile(file: File): void {
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
      this.fileError = null;
    };
    reader.onerror = () => {
      this.previewImage = null;
      this.fileError = 'Errore nella lettura del file.';
    };

    reader.readAsDataURL(file);
  }

  /** Azioni di dialogo */
  confirm(): void {
    if (this.mode === 'url' && this.url) {
      this.dialogRef.close({ type: 'url', data: this.url });
    } else if (this.mode === 'file' && this.selectedFile) {
      this.dialogRef.close({ type: 'file', data: this.selectedFile });
    } else {
      this.fileError = 'Nessuna immagine valida selezionata.';
    }
  }

  delete(): void {
    this.url = '';
    this.previewImage = null;
    this.selectedFile = null;
    this.fileError = null;
    this.dialogRef.close('delete');
  }

  close(): void {
    this.dialogRef.close();
  }
}
