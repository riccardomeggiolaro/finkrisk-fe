import { Component, OnInit } from '@angular/core';
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
import { IfAuthenticatedDirective } from './directives/if-authenticated.directive';

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
    RouterModule,
    IfAuthenticatedDirective
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  loading: Observable<boolean>;

  title = "FINRISK";
  favicon = "https://img.icons8.com/?size=33&id=JF6kPfhVzeVz&format=png&color=008000";

  constructor(
    private progressBarService: ProgressBarService,
    private authService: AuthService) {
    this.loading = this.progressBarService.loading$;
  }

  ngOnInit(): void {
    const firstPath = window.location.pathname.split('/')[1];
    if (firstPath === 'finrisk') {
      this.title = "FINRISK";
      this.favicon = "https://img.icons8.com/?size=33&id=JF6kPfhVzeVz&format=png&color=008000";
    } else if (firstPath === 'finbil') {
      this.title = "FINBIL";
      this.favicon = "https://img.icons8.com/?size=33&id=Wq62foDY9ZbH&format=png&color=000000";
    }
  }

  logout() {
    this.authService.logout();
  }
}