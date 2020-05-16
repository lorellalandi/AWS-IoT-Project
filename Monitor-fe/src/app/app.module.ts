import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';
export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'localhost',
  port: 9001,
  path: '/mqtt'
};

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MonitorComponent } from './monitor/monitor.component';
import { ProvaSensorComponent } from './prova-sensor/prova-sensor.component';

@NgModule({
  declarations: [
    AppComponent,
    MonitorComponent,
    ProvaSensorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS)
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
