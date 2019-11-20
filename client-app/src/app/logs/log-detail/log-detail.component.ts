import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { LogService } from '../log.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-log-detail',
  templateUrl: './log-detail.component.html',
  styleUrls: ['./log-detail.component.scss']
})
export class LogDetailComponent implements OnInit {

  @Input()
  baseUrl: string;

  @Input()
  logId: number;

  @Input()
  pollingInterval: number;

  isLoading: boolean;

  @Output() lastReading = new EventEmitter();
  @Output() nextReadingTimer = new EventEmitter();

  lastReadingTime: number = 0;

  isLoggingStopped: boolean = false;
  shouldStopLogging: boolean = false;

  lastReadingObj: any = {};

  Highcharts = Highcharts;
  chartConstructor = "chart";
  oneToOneFlag = true;
  logChartOptions: any;
  updateFlag: boolean;

  intervalId: any;
  timerId: any;

  startTime: number;

  constructor(private logService: LogService) { }

  ngOnInit() {
    this.startTime = new Date().getTime();
    this.logChartOptions = this.getBaseChart();
    this.startLogging();
  }

  startLogging(): void {
    this.getLog();

    this.timerId = setInterval(() => {
      let timeLeft = this.pollingInterval - (new Date().getTime() - this.lastReadingTime);
      if (timeLeft < 1000 && timeLeft >= 100) this.nextReadingTimer.emit(0)
      else if (timeLeft < 100) this.nextReadingTimer.emit(this.pollingInterval)
      else this.nextReadingTimer.emit(timeLeft)
    }, 500);

    this.intervalId = setInterval(() => {
      if (this.shouldStopLogging) {
        this.shouldStopLogging = false;
        clearInterval(this.intervalId);
        clearInterval(this.timerId);
        this.timerId = null;
        this.intervalId = null;
        setTimeout(() => {
          this.getLog();
          this.isLoggingStopped = true;
        }, this.pollingInterval);
      }
      this.getLog();
    }, this.pollingInterval);
  }

  resumeLogging(): void {
    this.isLoading = true;
    this.logService.resumeLogging(this.baseUrl, this.logId).pipe(finalize(() => this.isLoading = false)).subscribe(
      data => this.startLogging(),
      error => console.error(error)
    );
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getElapsedTime(): number {
    return new Date().getTime() - this.startTime;
  }

  getLog(): void {
    this.isLoading = true;
    this.logService.getLog(this.baseUrl, this.logId).pipe(finalize(() => this.isLoading = false)).subscribe(
      data => {
        this.lastReadingTime = new Date().getTime();
        this.reloadGraph(data);
        let lastReading = data[data.length - 1];
        this.lastReading.emit(lastReading);
        this.lastReadingObj = lastReading;
      },
      error => console.error(error)
    );
  }

  stopLog(): void {
    this.isLoading = true;
    this.logService.stopLog(this.baseUrl, this.logId).pipe(finalize(() => this.isLoading = false)).subscribe(
      data => {
        console.log(data);
        this.shouldStopLogging = true;
      },
      error => console.error(error)
    );
  }

  reloadGraph(data): void {
    this.logChartOptions.series[0].data = data.map(l => [new Date(l.time * 1000).getTime(), l.bt]);
    this.logChartOptions.series[1].data = data.map(l => [new Date(l.time * 1000).getTime(), l.et]);

    this.updateFlag = true;
  }

  private getBaseChart(): any {
    return {
      title: {
        text: ""
      },
      chart: {
        zoomType: 'x'
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: ""
        }
      }, legend: {
        enabled: false
      },
      series: [{
        type: 'line',
        name: "BT",
        color: "#F44336",
        data: []
      }, {
        type: 'line',
        name: "ET",
        color: "#2196F3",
        data: []
      }]

    };
  }

}
