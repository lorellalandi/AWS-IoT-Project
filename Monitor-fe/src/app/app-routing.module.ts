import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitorComponent } from './monitor/monitor.component';
import { ActivityRecognitionComponent } from './activity-recognition/activity-recognition.component';
import { AccelerometerSensorComponent } from './accelerometer-sensor/accelerometer-sensor.component';

const routes: Routes = [
  { path: '', component: MonitorComponent },
  { path: 'edge', component: ActivityRecognitionComponent },
  { path: 'cloud', component: AccelerometerSensorComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }