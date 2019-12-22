import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  private socket;
  private url = 'http://192.168.1.14:5000';

  constructor(private http: HttpClient) {
    this.socket = io(this.url);
  }

  sendLogs(logs: any[]) {
    this.socket.emit("create-logs", JSON.stringify(logs));
  }

  getAllLogs = () => {
    return Observable.create((observer) => {
      this.socket.on('all-logs', (message) => {
        observer.next(message);
      });
    });
  }

  getNewTemp = () => {
    return Observable.create((observer) => {
      this.socket.on('new-temp', (message) => {
        observer.next(message);
      });
    });
  }

  getExceptions = () => {
    return Observable.create((observer) => {
      this.socket.on('exception', (message) => {
        observer.next(message);
      });
    });
  }

  getLogCreated = () => {
    return Observable.create((observer) => {
      this.socket.on('log-created', (message) => {
        observer.next(message);
      });
    });
  }
}
