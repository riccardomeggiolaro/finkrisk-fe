import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface File {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  private apiUrl = 'http://localhost:3000/api/drive'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  create(formData: FormData): Observable<any> {
    return new Observable<string>(observer => {
      const fetchData = async () => {
        const response = await fetch(`${this.apiUrl}/upload`, {
          method: 'POST',
          headers: {
          },
          body: formData // Convertiamo l'oggetto body in una stringa JSON
        });

        const reader = response.body!
          .pipeThrough(new TextDecoderStream())
          .getReader();

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const lines = value?.split('\n').filter(line => line.trim() !== '');

            for (const line of lines!) {
              const jsonMatch = line.match(/data:\s*(\{.*\})/);
              if (jsonMatch) {
                const jsonData = JSON.parse(jsonMatch[1]);
                observer.next(jsonData);
              } else if (line === 'event: complete') {
                observer.complete(); // Completiamo l'Observable quando la lettura è terminata
              }
            }
          }
        } catch (error) {
          observer.error(error); // Gestiamo gli errori
        }
      };

      fetchData();
    });
  }

  async existFile(fileName: string): Promise<{exist: boolean, data: File}> {
    return await this.http.get<{exist: boolean}>(`${this.apiUrl}/exist/name${fileName}`).toPromise() as {exist: boolean, data: File};
  }
}