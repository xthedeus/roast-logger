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

  lastReadingTime: number;
  lastReadingSeconds: number;

  loggingStopped: boolean;

  isReset: boolean;

  exceptions: any[];

  showGraph: boolean;

  coolThreshold: number;
  mediumThreshold: number;
  hotThreshold: number;

  err7cdString: string;
  err7cdTime: number;

  targetTemp: number;

  startTime: number;

  intervalBool: boolean;

  showLogsFlag: boolean;

  logs: any[];
  selectedLogs: any[];
  allLogs: any[]

  constructor(private logService: LogService) { }

  ngOnInit() {
    this.loggingStopped = true;
    this.elapsedTimeString = "00:00";
    this.err7cdString = "13:30";
    this.currentBT = 0;
    this.exceptions = [];
    this.startSubscribers();
    this.isReset = true;

    this.coolThreshold = 100;
    this.mediumThreshold = 160;
    this.hotThreshold = 1000;

    this.targetTemp = 170;

    this.err7cdTime = (((13 * 60) + 30) * 1000) + 1000; // 13 minutes and 30 seconds
  }

  async interval(): Promise<void> {
    while (this.intervalBool) {
      this.elapsedTimeString = this.getElapsedTimeString();
      this.err7cdString = this.getErr7TimeString();
      this.lastReadingSeconds = this.getLastReadingSeconds();
      await this.delay(1000);
    }
  }

  getElapsedTimeString(): string {
    if (this.loggingStopped) return "00:00";
    let ms = this.getElapsedTime();
    return new Date(ms / 1000 * 1000).toISOString().substr(14, 5);
  }

  getErr7TimeString(): string {
    if (this.loggingStopped) return "13:30";
    let ms = this.err7cdTime - this.getElapsedTime();
    if (ms <= 0) return "00:00";
    return new Date(ms / 1000 * 1000).toISOString().substr(14, 5);
  }

  getTimeString(ms: number): string {
    return new Date(ms * 1000).toLocaleString();
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then();
  }

  private getFirstLog(data: any[]) {
    return data.reduce((min, p) => p.time < min.time ? p : min, data[0]);
  }

  private getLastLog(data: any[]) {
    return data.reduce((max, p) => p.time > max.time ? p : max, data[0]);
  }

  startSubscribers(): void {
    this.logService
      .getNewTemp()
      .subscribe((message: any) => {
        this.currentBT = message.data.temp;
        this.lastReadingTime = new Date().getTime();
      });

    this.logService
      .getAllLogs()
      .subscribe((message: any) => {
        this.logs = [];
        let logs = message.logs;
        let ids = [...new Set(logs.map(x => x.id))];
        ids.forEach(id => {
          let idLogs = logs.filter(x => x.id == id);
          let firstLog = this.getFirstLog(idLogs);
          let lastLog = this.getLastLog(idLogs);

          let firstTime = new Date(firstLog.time * 1000);
          let lastTime = new Date(lastLog.time * 1000);

          let duration = lastTime.getTime() - firstTime.getTime();

          let entry = {
            id: id,
            startTime: new Date(firstLog.time * 1000),
            endTime: new Date(lastLog.time * 1000),
            duration: duration
          };
          this.logs.push(entry);
        });
        this.allLogs = logs;
      });

    this.logService
      .getLogCreated()
      .subscribe((message: any) => {
        alert(`Saved log: ${message.log_id}`);
      });

    this.logService
      .getExceptions()
      .subscribe((message: any) => {
        this.exceptions.push(message.data);
      });
  }

  getLastReadingSeconds(): number {
    if (this.lastReadingTime) {
      let ms = new Date().getTime() - this.lastReadingTime;
      return Math.floor(ms / 1000);
    }
  }

  getElapsedTime(): number {
    return new Date().getTime() - this.startTime;
  }

  startLog(): void {
    this.intervalBool = true;
    this.interval();
    this.startTime = new Date().getTime();
    this.loggingStopped = false;
    this.showGraph = true;
    this.logStarted = true;

    setTimeout(() => {
      this.logger.startLogging();
    }, 0);

    this.elapsedInterval = setInterval(() => {
      this.elapsedTimeString = this.getElapsedTimeString();
      this.err7cdString = this.getErr7TimeString();
    }, 1000);
  }

  showLogs(): void {
    this.showLogsFlag = !this.showLogsFlag;
  }

  selectLog(id: number): void {
    this.selectedLogs = this.allLogs.filter(x => x.id == id);
    this.showLogsFlag = false;
    this.showGraph = true;
  }

  stopLog(): void {
    this.intervalBool = false;
    this.logger.stopLogging();
    this.loggingStopped = true;
    this.logStarted = false;
    this.isReset = false;

    clearInterval(this.elapsedInterval);
  }

  resetLog(): void {
    this.logger.resetLog();
    this.elapsedTimeString = "00:00";
    this.err7cdString = "13:30";
    this.isReset = true;
  }

  saveLog(): void {
    this.logger.saveLog();
  }

  millisToMinutesAndSeconds(millis): string {
    if (millis == null) return "00:00";
    var ms = millis;
    return new Date(ms / 1000 * 1000).toISOString().substr(14, 5);
  }

}
