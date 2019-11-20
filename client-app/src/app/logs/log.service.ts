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

  getLog(baseUrl: string, id: number): Observable<any> {
    const url = `${baseUrl}/logs/${id}`;
    return this.http.get<any>(url).pipe(
      tap((data: any) => {
        console.log('getLog: ', data);
      }),
      catchError(this.handleError)
    );
  }

  startLog(baseUrl: string): Observable<any> {
    const url = `${baseUrl}/logs`;
    return this.http.post<any>(url, {}).pipe(
      tap((data: any) => {
        console.log('startLog: ', data);
      }),
      catchError(this.handleError)
    );
  }

  stopLog(baseUrl: string, id: number): Observable<any> {
    const url = `${baseUrl}/logs/${id}/stop`;
    return this.http.post<any>(url, {}).pipe(
      tap((data: any) => {
        console.log('stopLog: ', data);
      }),
      catchError(this.handleError)
    );
  }

  resumeLogging(baseUrl: string, id: number): Observable<any> {
    const url = `${baseUrl}/logs/${id}/resume`;
    return this.http.post<any>(url, {}).pipe(
      tap((data: any) => {
        console.log('resumeLogging: ', data);
      }),
      catchError(this.handleError)
    );
  }

  getStatus(baseUrl: string): Observable<any> {
    const url = `${baseUrl}/status`;
    return this.http.get<any>(url).pipe(
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
