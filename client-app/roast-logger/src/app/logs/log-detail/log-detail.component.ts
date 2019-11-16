import { Component, OnInit } from '@angular/core';
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

  logId: number;
  isLoading: boolean;

  Highcharts = Highcharts;
  chartConstructor = "chart";
  oneToOneFlag = true;
  logChartOptions: any;
  updateFlag: boolean;

  intervalId: any;

  constructor(private route: ActivatedRoute, private logService: LogService) {
    this.logChartOptions = this.getBaseChart();
    this.route.params.subscribe(params => {
      this.logId = params['id'];
      this.getLog();
    });
  }

  ngOnInit() {
    this.intervalId = setInterval(() => {
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
    this.logService.getLog(this.logId).pipe(finalize(() => this.isLoading = false)).subscribe(
      data => {
        this.reloadGraph(data);
      },
      error => console.error(error)
    );
  }

  reloadGraph(data): void {
    this.logChartOptions.series[0].data = data.map(l => [new Date(l.time).getTime(), l.bt]);
    this.logChartOptions.series[1].data = data.map(l => [new Date(l.time).getTime(), l.et]);

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
        color: "#9C27B0",
        data: []
      }]

    };
  }

}
