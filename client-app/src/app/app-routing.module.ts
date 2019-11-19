import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogDetailComponent } from './logs/log-detail/log-detail.component';
import { OverviewComponent } from './overview/overview.component';


const routes: Routes = [
  { path: 'logs/:id', component: LogDetailComponent },
  { path: '**', component: OverviewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
