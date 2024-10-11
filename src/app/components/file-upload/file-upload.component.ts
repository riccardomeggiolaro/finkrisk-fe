import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { DriveService } from '../../services/google-drive.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { DialogService } from '../../services/dialog.service';
import { DialogData } from '../dialog-content/dialog-content.component';
import { Subject, takeUntil } from 'rxjs';
import { FormattedEvent } from '../../services/google-drive.service';

@Component({
  standalone: true,
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  imports: [
    NgIf,
    FontAwesomeModule,
    MatProgressBarModule
  ]
})
export class FileUploadComponent {

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private readonly googleDriveService: DriveService,
    private readonly dialogService: DialogService) {}

  faCloudUploadAlt = faCloudUploadAlt;
  isDragging = false;
  selectedFile: File | null = null;
  isUploading = false;
  uploadSuccess = false;
  uploadError: string | null = null;
  uploading: boolean = false;
  uploaded: number | null = null;
  checking: boolean = false;
  errorUploading: string | null = null;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0 && this.isCSVFile(files[0])) {
      this.checking = true;
      const fileJustExist = await this.checkIfExist(files[0].name);
      if (!fileJustExist) {
        this.selectedFile = files[0];
      } else {
        this.openDialog({title: "Ops", description: ["E' già stato caricato un file con questo nome sul drive."], type: "error"});
        this.fileInput.nativeElement.value = '';
      }
    } else {
      this.openDialog({title: "Formato non valido", description: ["Si prega di caricare solo file CSV."], type: "error"});
      this.fileInput.nativeElement.value = '';
    }
    this.checking = false;
  }

  async onFileSelected(event: any): Promise<void> {
    const files = event.target.files;
    if (files && files.length > 0 && this.isCSVFile(files[0])) {
      this.checking = true;
      const fileJustExist = await this.checkIfExist(files[0].name);
      if (!fileJustExist) {
        this.selectedFile = files[0];
      } else {
        this.openDialog({title: "Ops", description: ["E' già stato caricato un file con questo nome sul drive."], type: "error"});
        this.fileInput.nativeElement.value = '';
      }
    } else {
      this.openDialog({title: "Formato non valido", description: ["Si prega di caricare solo file CSV."], type: "error"});
      this.fileInput.nativeElement.value = '';
    }
    this.checking = false;
  }

  private isCSVFile(file: File): boolean {
    return file.type === 'text/csv' || file.name.endsWith('.csv');
  }

  private async checkIfExist(fileName: string): Promise<boolean> {
    const fileJustExist = await this.googleDriveService.existFile(fileName);
    return fileJustExist.exist;
  }

  onRemove(): void {
    this.selectedFile = null;
  }

  async loadFile(): Promise<void> {
    if (this.selectedFile) {
      this.isUploading = true;
      this.uploaded = 0;
      this.uploadError = null;
      this.uploadSuccess = false;
      this.uploading = true;
      const subject = new Subject<void>();

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.googleDriveService.create(formData)
      .pipe(
        takeUntil(subject)
      )
      .subscribe({
        next: (event: FormattedEvent) => {
          if (event.type === 'progress') {
            if (event.progress! > 100) this.uploaded = event.progress!;
          } else if (event.type === 'complete') {
            console.log(event.id);
            this.uploaded = 100;
          }
        },
        error: (error) => {
          this.errorUploading = error;
        },
        complete: () => {
          console.log('Stream ended');
          // Esegui operazioni di pulizia se necessario
        }
      });
    }
  }

  reinit(): void {
    this.uploaded = null;
    this.uploading = false;
    this.selectedFile = null;
    this.errorUploading = null;
  }

  getFileName(): string {
    const max_name_length = 13;
    if (this.selectedFile) {
      const last_dot = this.selectedFile.name.lastIndexOf(".");
      const last_index = this.selectedFile.name.length;
      if (last_dot < max_name_length) return this.selectedFile.name;
      return this.selectedFile.name.substring(0, max_name_length) + ".." + this.selectedFile.name.substring(last_dot, last_index);
    }
    return "";
  }

  openDialog(data: DialogData): void {
    this.dialogService.openDialog(data);
  }
}