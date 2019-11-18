import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LogService } from '../logs/log.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  isLoading: boolean;
  serverUrl: string;
  baseUrl: string;
  isUrlSaved: boolean;
  loggingId: number;

  constructor(private router: Router, private logService: LogService) { }

  ngOnInit() {
  }

  startLog(): void {
    this.isLoading = true;
    this.logService.startLog(this.baseUrl).pipe(finalize(() => this.isLoading = false)).subscribe(
      data => {
        //this.router.navigate(['logs', data.id]);
        this.loggingId = data.id;
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

}
