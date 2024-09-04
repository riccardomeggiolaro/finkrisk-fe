import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { ProgressBarService } from './services/progress-bar.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FileUploadComponent,
    MatProgressBarModule,
    NgIf,
    AsyncPipe,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    RouterModule  // or Ro
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'folder-explorer';

  loading: Observable<boolean>;

  constructor(
    private progressBarService: ProgressBarService,
    private authService: AuthService) {
    this.loading = this.progressBarService.loading$;
  }

  logout() {
    this.authService.logout();
  }
}