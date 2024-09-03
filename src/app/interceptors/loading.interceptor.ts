import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ProgressBarService } from '../services/progress-bar.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  
  constructor(private progressBarService: ProgressBarService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Avvia la progress bar
    this.progressBarService.show();

    return next.handle(req).pipe(
      // Ferma la progress bar quando la richiesta è completata (anche se fallisce)
      finalize(() => this.progressBarService.hide())
    );
  }
}