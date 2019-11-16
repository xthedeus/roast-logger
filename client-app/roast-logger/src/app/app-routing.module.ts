import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogDetailComponent } from './logs/log-detail/log-detail.component';


const routes: Routes = [
  { path: 'logs/:id', component: LogDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
