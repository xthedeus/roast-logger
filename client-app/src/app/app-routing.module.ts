import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogDetailComponent } from './logs/log-detail/log-detail.component';
import { OverviewComponent } from './overview/overview.component';
import { LogsComponent } from './logs/logs.component';


const routes: Routes = [
  { path: 'logs/:id', component: LogDetailComponent },
  { path: 'logs', component: LogsComponent },
  { path: '**', component: OverviewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
