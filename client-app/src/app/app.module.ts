import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OverviewComponent } from './overview/overview.component';
import { LogsComponent } from './logs/logs.component';
import { LogDetailComponent } from './logs/log-detail/log-detail.component';
import { HttpClientModule } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';
import { FormsModule } from '@angular/forms';

import { ButtonsModule, WavesModule, CardsModule, IconsModule } from 'angular-bootstrap-md'
import { LogService } from './logs/log.service';


@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    LogsComponent,
    LogDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    HighchartsChartModule,
    ButtonsModule.forRoot(),
    WavesModule.forRoot(),
    CardsModule.forRoot(),
    IconsModule
  ],
  providers: [LogService],
  bootstrap: [AppComponent]
})
export class AppModule { }
