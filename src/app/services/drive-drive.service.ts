import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { isNil, omitBy } from 'lodash';
import { BehaviorSubject, Observable, Subject, catchError, debounceTime, of, shareReplay, takeUntil } from 'rxjs';
import { JwtService } from './jwt.service';
import { saveAs } from 'file-saver';
import { SnackbarService } from './snackbar.service';

export interface FileData {
  name: string;
  date: Date;
  elaborated: boolean;
  actions: string;
}

export interface File {
  id: string;
  name: string;
  parents: string[];
  elaborated: boolean;
  createdTime: Date;
}

export interface FileFilters {
  name?: string;
  status?: 'all' | 'only-elaborated' | 'no-elaborated';
}

interface StreamEvent {
  event: string;
  data: string;
}

export interface FormattedEvent {
  type: 'progress' | 'complete' | 'unknown';
  progress?: number;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriveService {
  private apiUrl = 'http://localhost:3000/api/drive'; // Replace with your API URL
  private _files$ = new BehaviorSubject<File[]>([]);
  public readonly files$ = this._files$.asObservable();
  private _filters$ = new BehaviorSubject<FileFilters>({});
  public readonly filters$ = this._filters$.asObservable();

  constructor(
    private http: HttpClient,
    private jwtService: JwtService,
    private snackbarService: SnackbarService
  ) {
    this._filters$
      .pipe(
        debounceTime(300),
      )
      .subscribe(value => {
        const queryParams = omitBy(value, isNil);
        this.http.get<File[]>(`${this.apiUrl}/list`, { params: queryParams })
          .pipe(
            shareReplay(1), // Condivide il risultato tra più sottoscrizioni
            catchError(err => {
              console.error('Error fetching files:', err);
              this._files$.next([]);
              return of([]);
            })
          )
          .subscribe(value => {
            this._files$.next(value);
          });
      })
  }

  updateFilters(filters: FileFilters): void {
    this._filters$.next(filters);
  }

  upload(formData: FormData, signal?: AbortSignal): Observable<FormattedEvent> {
    const authToken = this.jwtService.getToken();
  
    return new Observable<FormattedEvent>(observer => {
      const fetchData = async () => {
        try {
          const response = await fetch(`${this.apiUrl}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
            body: formData,
            signal // Passiamo il signal qui
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
  
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const formattedEvents = this.formatStreamEvent(chunk);
            formattedEvents.forEach(event => observer.next(event));
          }
  
          observer.complete();
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            this.snackbarService.open("L'upload del file è stato cancellato", "OK");
          } else {
            observer.error(error);
          }
        }
      };
  
      fetchData()
        .then(_ => this.updateFilters(this._filters$.value));
    });
  }  
  
  download(id: string): void {
    this.snackbarService.open("Scaricando il file...", "OK", 5000);
    this.http.get(`${this.apiUrl}/download/${id}`, {
      responseType: 'blob', // Ottiene la risposta come Blob (binario)
      observe: 'response' // Ottiene anche le intestazioni di risposta
    })
    .pipe(
      catchError(err => {
        this.snackbarService.open(err, "OK");
        return of();
      })
    )
    .subscribe(response => {
      const fileName = this.getFileNameFromDisposition(response.headers.get('Content-Disposition'));
      const blob = response.body as Blob;

      // Usa `file-saver` per forzare il download con il nome file corretto
      saveAs(blob, fileName);
    });
  }

  async exist(name: string): Promise<{ exist: boolean, data: File }> {
    const response = await this.http.get<{ exist: boolean; data: File; }>(`${this.apiUrl}/exist/name/${name}`).toPromise();
    return response!;
  }

  delete(id: string): void {
    this.http.delete<void>(`${this.apiUrl}/id/${id}`)
    .pipe(
      catchError(err => {
        this.snackbarService.open(err, "OK");
        return err;
      })
    )
    .subscribe(() => {
      this.snackbarService.open("File eliminato adesso", "OK");
      this._filters$.next(this._filters$.value);
    })
  }

  // Estrae il nome del file dall'intestazione Content-Disposition
  private getFileNameFromDisposition(contentDisposition: string | null): string {
    if (!contentDisposition) return 'downloaded_file';

    const match = contentDisposition.match(/filename\*=UTF-8''(.+)|filename="?(.+?)"?($|;)/);
    return match ? decodeURIComponent(match[1] || match[2]) : 'downloaded_file';
  }

  private formatStreamEvent(chunk: string): FormattedEvent[] {
    const events = chunk.split('\n\n').filter(event => event.trim() !== '');
    
    return events.map(event => {
      const lines = event.split('\n');
      const parsedEvent: StreamEvent = {
        event: '',
        data: ''
      };
  
      lines.forEach(line => {
        const [key, value] = line.split(': ');
        if (key === 'event' || key === 'data') {
          parsedEvent[key] = value;
        }
      });
  
      if (parsedEvent.event === 'progress') {
        try {
          const data = JSON.parse(parsedEvent.data);
          return {
            type: 'progress',
            progress: data.progress
          };
        } catch (error) {
          console.error('Error parsing progress data:', error);
          return { type: 'unknown' };
        }
      } else if (parsedEvent.event === 'complete') {
        try {
          const data = JSON.parse(parsedEvent.data);
          return {
            type: 'complete',
            id: data.fileId
          };
        } catch (error) {
          console.error('Error parsing complete data:', error);
          return { type: 'unknown' };
        }
      }
  
      return { type: 'unknown' };
    });
  }
}