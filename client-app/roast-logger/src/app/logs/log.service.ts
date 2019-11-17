import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getLog(id: number): Observable<any> {
    const url = `${this.apiUrl}logs/${id}`;
    return this.http.get<any>(url).pipe(
      tap((data: any) => {
        console.log('getLog: ', data);
      }),
      catchError(this.handleError)
    );
  }

  startLog(): Observable<any> {
    const url = `${this.apiUrl}logs`;
    return this.http.post<any>(url, {}).pipe(
      tap((data: any) => {
        console.log('startLog: ', data);
      }),
      catchError(this.handleError)
    );
  }

  stopLog(id: number): Observable<any> {
    const url = `${this.apiUrl}logs/${id}`;
    return this.http.post<any>(url, {}).pipe(
      tap((data: any) => {
        console.log('stopLog: ', data);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `${err.error.message}`;
    }
    console.error(errorMessage, err);
    return throwError(errorMessage);
  }
}
