import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { ProgressBarService } from './services/progress-bar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FileUploadComponent,
    MatProgressBarModule,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'folder-explorer';

  loading: Observable<boolean>;

  constructor(private progressBarService: ProgressBarService) {
    this.loading = this.progressBarService.loading$;
  }
}
