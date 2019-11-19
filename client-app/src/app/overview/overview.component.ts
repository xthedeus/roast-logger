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

  currentBT: number;
  currentET: number;

  pollingInterval = 5500;

  nextReadingTimePercentage: number;

  elapsedInterval: any;
  elapsedTime: number;

  constructor(private logService: LogService) { }

  ngOnInit() {
  }

  getCurrentBT() { return 0; }
  getCurrentET() { return 0; }
  stopLog(): void { }
  isLoggingStopping(): boolean { return false; }
  isLoggingStopped(): boolean { return false; }

  startLog(): void {

    this.elapsedInterval = setInterval(() => {
      this.elapsedTime = this.logger.getElapsedTime();
    }, 1000);

    this.isLoading = true;
    this.logService.startLog(this.baseUrl).pipe(finalize(() => this.isLoading = false)).subscribe(
      data => {
        //this.router.navigate(['logs', data.id]);
        this.loggingId = data.id;
        setTimeout(() => this.getCurrentBT = () => this.logger.lastReadingObj.bt, 0);
        setTimeout(() => this.getCurrentET = () => this.logger.lastReadingObj.et, 0);
        setTimeout(() => this.stopLog = () => {
          this.logger.stopLog();
          clearInterval(this.elapsedInterval);
        }, 0);
        setTimeout(() => this.isLoggingStopped = () => {
          return (this.logger.isLoggingStopped && this.logger.intervalId == null);
        }, 0);

        setTimeout(() => this.isLoggingStopping = () => {
          return (!this.logger.isLoggingStopped && this.logger.intervalId == null) || this.logger.shouldStopLogging;
        }, 0);
      },
      error => console.error(error)
    );
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

  onLastReading(lastReading): void {
    this.currentBT = lastReading.bt;
    this.currentET = lastReading.et;
  }

  onNextReadingTimer(nextReadingTime): void {
    this.nextReadingTimePercentage = nextReadingTime / this.pollingInterval * 100;
  }

  millisToMinutesAndSeconds(millis): string {
    if (millis == null) return "0:00";
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (parseInt(seconds) < 10 ? '0' : '') + seconds;
  }

}
