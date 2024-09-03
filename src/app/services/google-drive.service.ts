import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isNil, omitBy } from 'lodash';
import { Observable, catchError, map, of, shareReplay, throwError } from 'rxjs';

export interface PeriodicElement {
  name: string;
  date: Date;
  elaborated: boolean;
  actions: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {name: 'Hydrogen', date: new Date(2023, 7, 31), elaborated: false, actions: ""},  // 31 Aug 2023
  {name: 'Oxygen', date: new Date(2023, 8, 15), elaborated: true, actions: ""},    // 15 Sep 2023
  {name: 'Carbon', date: new Date(2023, 9, 2), elaborated: false, actions: ""},    // 02 Oct 2023
  {name: 'Nitrogen', date: new Date(2023, 7, 28), elaborated: true, actions: ""},  // 28 Aug 2023
  {name: 'Helium', date: new Date(2023, 6, 14), elaborated: false, actions: ""},   // 14 Jul 2023
  {name: 'Neon', date: new Date(2023, 5, 22), elaborated: true, actions: ""},      // 22 Jun 2023
  {name: 'Sodium', date: new Date(2023, 6, 7), elaborated: false, actions: ""},    // 07 Jul 2023
  {name: 'Magnesium', date: new Date(2023, 4, 10), elaborated: true, actions: ""}, // 10 May 2023
  {name: 'Aluminium', date: new Date(2023, 11, 12), elaborated: false, actions: ""},// 12 Dec 2023
  {name: 'Silicon', date: new Date(2023, 0, 19), elaborated: true, actions: ""},   // 19 Jan 2023
  {name: 'Phosphorus', date: new Date(2023, 10, 30), elaborated: true, actions: ""},// 30 Nov 2023
  {name: 'Sulfur', date: new Date(2023, 2, 3), elaborated: false, actions: ""},    // 03 Mar 2023
  {name: 'Chlorine', date: new Date(2023, 8, 25), elaborated: true, actions: ""},  // 25 Sep 2023
  {name: 'Argon', date: new Date(2023, 1, 11), elaborated: true, actions: ""},     // 11 Feb 2023
  {name: 'Potassium', date: new Date(2023, 7, 5), elaborated: false, actions: ""}, // 05 Aug 2023
  {name: 'Calcium', date: new Date(2023, 3, 16), elaborated: true, actions: ""},   // 16 Apr 2023
  {name: 'Scandium', date: new Date(2023, 8, 29), elaborated: true, actions: ""},  // 29 Sep 2023
  {name: 'Titanium', date: new Date(2023, 2, 8), elaborated: false, actions: ""},  // 08 Mar 2023
  {name: 'Vanadium', date: new Date(2023, 5, 21), elaborated: true, actions: ""},  // 21 Jun 2023
  {name: 'Chromium', date: new Date(2023, 8, 12), elaborated: false, actions: ""}, // 12 Sep 2023
];

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

@Injectable({
  providedIn: 'root'
})
export class DriveService {
  private apiUrl = 'http://localhost:3000/api/drive'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  create(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        // You can use events like HttpResponse, HttpEventType, etc.
        return event;
      }),
      catchError(error => {
        console.error('Error occurred during upload:', error);
        return throwError(error);
      })
    );
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

  existFile(fileName: string): Observable<{ exist: boolean, data: File }> {
    return this.http.get<{ exist: boolean, data: File }>(`${this.apiUrl}/exist/name${fileName}`);
  }
}