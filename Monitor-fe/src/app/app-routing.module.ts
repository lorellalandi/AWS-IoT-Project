import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitorComponent } from './monitor/monitor.component';
import { ProvaSensorComponent } from './prova-sensor/prova-sensor.component';

const routes: Routes = [
  { path: '', component: MonitorComponent },
  { path: 'prova', component: ProvaSensorComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
