import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitorComponent } from './monitor/monitor.component';
import { ActivityRecognitionComponent } from './activity-recognition/activity-recognition.component';

const routes: Routes = [
  { path: '', component: MonitorComponent },
  { path: 'prova', component: ActivityRecognitionComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
