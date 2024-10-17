import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isNil, omitBy } from 'lodash';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { JwtService } from './jwt.service';

export interface PeriodicElement {
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

  constructor(
    private http: HttpClient,
    private jwtService: JwtService  
  ) { }

  create(formData: FormData): Observable<FormattedEvent> {
    const authToken = this.jwtService.getToken();

    return new Observable<FormattedEvent>(observer => {
      const fetchData = async () => {
        try {
          const response = await fetch(`${this.apiUrl}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
            body: formData
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
          observer.error(error);
        }
      };

      fetchData();
    });
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

  list(filters: FileFilters): Observable<File[]> {
    const queryParams = omitBy(filters, isNil);
    return this.http.get<File[]>(`${this.apiUrl}/list`, { params: queryParams })
      .pipe(
        shareReplay(1), // Condivide il risultato tra più sottoscrizioni
        catchError(err => {
          console.error('Error fetching files:', err);
          return of([]); 
        })
      );
  }

  async existFile(fileName: string): Promise<{ exist: boolean, data: File }> {
    const response = await this.http.get<{ exist: boolean; data: File; }>(`${this.apiUrl}/exist/name/${fileName}`).toPromise();
    return response!;
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/id/${id}`);
  }
}