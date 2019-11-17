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

  constructor(private router: Router, private logService: LogService) { }

  ngOnInit() {
  }

  startLog(): void {
    this.isLoading = true;
    this.logService.startLog().pipe(finalize(() => this.isLoading = false)).subscribe(
      data => {
        this.router.navigate(['logs', data.id]);
      },
      error => console.error(error)
    );
  }

}
