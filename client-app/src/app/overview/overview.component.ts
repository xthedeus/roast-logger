import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LogService } from '../logs/log.service';
import { finalize } from 'rxjs/operators';
import { LogDetailComponent } from '../logs/log-detail/log-detail.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  @ViewChild(LogDetailComponent, { static: false })
  private logger: LogDetailComponent;

  isLoading: boolean;
  serverUrl: string;
  baseUrl: string;
  isUrlSaved: boolean;
  loggingId: number;

  logStarted: boolean;

  currentBT: number;
  currentET: number;

  nextReadingTimePercentage: number;

  elapsedInterval: any;
  elapsedTime: number;
  elapsedTimeString: string;

  lastReadingInterval: any;
  lastReadingTime: number;
  lastReadingSeconds: number;

  loggingStopped: boolean;

  isReset: boolean;

  exceptions: any[];

  showGraph: boolean;

  constructor(private logService: LogService) { }

  ngOnInit() {
    this.elapsedTimeString = "00:00";
    this.currentBT = 0;
    this.exceptions = [];
    this.startSubscribers();
    this.isReset = true;
  }

  getElapsedTimeString(): void {
    let ms = this.logger.getElapsedTime();
    this.elapsedTimeString = new Date(ms / 1000 * 1000).toISOString().substr(14, 5);
  }

  getTimeString(ms: number): string {
    return new Date(ms * 1000).toLocaleString();
  }

  startSubscribers(): void {
    this.logService
      .getLogs()
      .subscribe((message: any) => {
        this.currentBT = message.data.temp;
        this.lastReadingTime = new Date().getTime();
        this.lastReadingSeconds = 0;
      });

    this.logService
      .getExceptions()
      .subscribe((message: any) => {
        this.exceptions.push(message.data);
      });

    this.lastReadingInterval = setInterval(() => {
      if (this.lastReadingTime) {
        let ms = new Date().getTime() - this.lastReadingTime;
        this.lastReadingSeconds = Math.floor(ms / 1000);
      }
    }, 200);
  }

  startLog(): void {
    this.loggingStopped = false;
    this.showGraph = true;
    this.logStarted = true;

    setTimeout(() => {
      this.logger.startLogging();
    }, 0);

    this.elapsedInterval = setInterval(() => {
      this.getElapsedTimeString();
    }, 1000);
  }

  stopLog(): void {
    this.logger.stopLogging();
    this.loggingStopped = true;
    this.logStarted = false;
    this.isReset = false;

    clearInterval(this.elapsedInterval);
  }

  resetLog(): void {
    this.logger.resetLog();
    this.elapsedTimeString = "00:00";
    this.isReset = true;
  }

  getServerStatus(): void {
    this.isLoading = true;
    let url = this.serverUrl;
    if (url.substring(url.length - 1) == "/") {
      url = url.substring(0, url.length - 1);
    }

    var charCode = url.charCodeAt(0);
    if (charCode >= 48 && charCode <= 57) {
      url = `http://${url}`;
    }

    this.baseUrl = url;

    this.logService.getStatus(url)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(
        data => {
          this.isUrlSaved = true;
        },
        error => console.log(error)
      );
  }

  millisToMinutesAndSeconds(millis): string {
    if (millis == null) return "00:00";
    var ms = millis;
    return new Date(ms / 1000 * 1000).toISOString().substr(14, 5);
  }

}
