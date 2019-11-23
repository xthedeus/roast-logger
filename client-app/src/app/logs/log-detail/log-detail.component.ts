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
  logs: any[];

  isLoading: boolean;

  @Output() lastReading = new EventEmitter();
  @Output() nextReadingTimer = new EventEmitter();

  lastReadingTime: number = 0;

  isLoggingStopped: boolean = false;
  shouldStopLogging: boolean = false;

  lastReadingObj: any = {};

  Highcharts = Highcharts;
  chartConstructor = "chart";
  oneToOneFlag = false;
  logChartOptions: any;
  updateFlag: boolean;

  intervalId: any;
  timerId: any;
  statusId: any;

  thread_running: boolean;

  loggingStopped: boolean;

  btData: any[] = [];

  lastTempReading: number;

  tempThreshold = 3.5;

  firstLog: boolean;

  firstLogTime: number;
  predefinedFirstLogTime: number;

  logI: number;

  constructor(private logService: LogService) { }

  ngOnInit() {
    this.loggingStopped = true;
    this.firstLog = true;
    this.logChartOptions = this.getBaseChart();
    this.startSubscriber();
    this.loadPredefinedLogs();
  }

  loadPredefinedLogs(): void {
    if (!this.logs) return;

    let formattedLogs = [];
    this.predefinedFirstLogTime = this.logs.reduce((min, p) => p.time < min.time ? p : min, this.logs[0]).time;

    this.logs.forEach(log => {
      let entry = {
        temp: Math.round(log.temp),
        time: log.time - this.predefinedFirstLogTime
      };
      formattedLogs.push(entry);
    });

    this.logChartOptions.series[1].data = formattedLogs.map(x => [x.time, x.temp]);
    this.updateFlag = true;
  }

  startLogging(): void {
    this.logI = 0;
    this.firstLog = null;
    this.lastTempReading = null;
    this.loggingStopped = false;
  }

  saveLog(): void {
    this.logService.sendLogs(this.btData.map(x => {
      return { temp: x.temp, time: x.orgTime };
    }));
  }

  startSubscriber(): void {
    this.logService
      .getNewTemp()
      .subscribe((message: any) => {
        if (this.loggingStopped) return;
        if (this.firstLog) {
          this.firstLog = false;
        }
        if (!this.loggingStopped) {
          let newTemp = message.data.temp;
          if (!this.lastTempReading) this.lastTempReading = newTemp;

          if (newTemp + this.tempThreshold > this.lastTempReading && message.data.temp - this.tempThreshold < this.lastTempReading) {
            if (this.logI % 2 == 0) {

              if (this.btData.length == 0) this.firstLogTime = message.data.time;

              let entry = {
                temp: message.data.temp,
                time: message.data.time - this.firstLogTime,
                orgTime: message.data.time
              };

              this.btData.push(entry);

              this.logChartOptions.series[0].data = this.btData.map(x => [x.time, x.temp]);
              this.updateFlag = true;
            }
          }
          this.lastTempReading = newTemp;
          this.logI++;
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
        type: "category",
        labels: {
          formatter: (l) => {
            return this.getTimeBetweenString(l.value, 0);
          },
        }
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
        type: 'spline',
        name: "BT",
        color: "#F44336",
        data: [],
        selected: true
      }, {
        type: 'spline',
        name: "BT",
        color: "#2196F3",
        data: [],
        opacity: 0.5
      }]

    };
  }

}
