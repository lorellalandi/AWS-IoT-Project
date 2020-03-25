import { Component, OnInit } from '@angular/core';
import { MonitorService } from '../monitor.service';
import { Station } from '../model/station.model';
import { StationSensor } from '../model/stationSensor.model';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit {

  private values = ['humidity', 'temperature', 'windDirection', 'windIntensity', 'rainHeight'];
  private selectedValue: string;
  private latest1: Station;
  private latest2: Station;
  private lastHour: StationSensor[];

  constructor(private readonly monitorService: MonitorService) { }

  ngOnInit() {
    // Gets latest values of both stations
    this.refreshLatestValue(1); 
    this.refreshLatestValue(2);
  }

  getLastHourValues() {
    this.getLastHourValue(this.selectedValue);
  }

  refreshLatestValue(stationId: number) {
    this.monitorService.getLatestValues(stationId).subscribe(res => {
      if (stationId == 1) this.latest1 = res;
      else this.latest2 = res;
    });
  }

  refreshLastHourValue() {
    this.monitorService.getLastHourValues(this.selectedValue).subscribe(res => {
      this.lastHour = res.sort(function (a,b) {
        return a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0
      });
    });

  }

  getLastHourValue(sensor: string) {
    this.monitorService.getLastHourValues(sensor).subscribe(res => {
      this.lastHour = res.sort(function (a,b) {
        return a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0
      });
    });
  }

}
