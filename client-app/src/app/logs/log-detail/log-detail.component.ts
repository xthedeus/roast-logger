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
  statusId: any;

  thread_running: boolean;

  startTime: number;

  loggingStopped: boolean;

  btData: any[] = [];

  lastTempReading: number;

  tempThreshold = 5;

  firstLog: boolean;

  constructor(private logService: LogService) { }

  ngOnInit() {
    this.firstLog = true;
    this.logChartOptions = this.getBaseChart();
    this.startSubscriber();
  }

  startLogging(): void {
    this.startTime = new Date().getTime();
    this.firstLog = null;
    this.lastTempReading = null;
    this.loggingStopped = false;
  }

  startSubscriber(): void {
    this.logService
      .getLogs()
      .subscribe((message: any) => {
        if (this.firstLog) {
          this.startTime = new Date().getTime();
          this.firstLog = false;
        }
        if (!this.loggingStopped) {
          let newTemp = message.data.temp;
          if (!this.lastTempReading) this.lastTempReading = newTemp;

          if (newTemp + this.tempThreshold > this.lastTempReading && message.data.temp - this.tempThreshold < this.lastTempReading) {

            var firstTime;

            if (this.btData.length == 0) firstTime = message.data.time;
            else firstTime = this.btData[0].time;

            let entry = {
              temp: message.data.temp,
              time: message.data.time,
              timeString: this.getTimeBetweenString(message.data.time, firstTime)
            };

            this.btData.push(entry);

            this.logChartOptions.series[0].data = this.btData.map(x => [x.timeString, x.temp]);
            this.updateFlag = true;
          }
          this.lastTempReading = newTemp;
        }
      });
  }

  getTimeBetweenString(t1: number, t2: number): string {
    return new Date((t1 * 1000 - t2 * 1000) / 1000 * 1000).toISOString().substr(14, 5);
  }

  stopLogging(): void {
    this.loggingStopped = true;
  }

  resumeLog(): void {
    this.loggingStopped = false;
  }

  resetLog(): void {
    this.btData = [];
    this.logChartOptions.series[0].data = [];
    this.updateFlag = true;
    this.firstLog = true;
    this.startTime = new Date().getTime();
  }

  getElapsedTime(): number {
    return new Date().getTime() - this.startTime;
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
        type: "category"
      },
      yAxis: {
        title: {
          text: ""
        }
      }, legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false
          }
        }
      },
      series: [{
        type: 'line',
        name: "BT",
        color: "#F44336",
        data: []
      }]

    };
  }

}
