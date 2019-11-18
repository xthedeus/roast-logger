import { Component, OnInit, Input } from '@angular/core';
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
  isLoading: boolean;

  isLoggingStopped: boolean;

  Highcharts = Highcharts;
  chartConstructor = "chart";
  oneToOneFlag = true;
  logChartOptions: any;
  updateFlag: boolean;

  intervalId: any;
  shouldStopLogging: boolean;

  constructor(private route: ActivatedRoute, private logService: LogService) { }

  ngOnInit() {
    this.logChartOptions = this.getBaseChart();
    this.getLog();
    this.intervalId = setInterval(() => {
      if (this.shouldStopLogging) {
        this.shouldStopLogging = false;
        clearInterval(this.intervalId);
        this.intervalId = null;
        setTimeout(() => {
          this.getLog();
          this.isLoggingStopped = true;
        }, 5000);
      }
      this.getLog();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getLog(): void {
    this.isLoading = true;
    this.logService.getLog(this.baseUrl, this.logId).pipe(finalize(() => this.isLoading = false)).subscribe(
      data => {
        this.reloadGraph(data);
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
