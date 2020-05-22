import { Component, OnInit } from '@angular/core';
import { LinearAccelerationSensor } from '../../../node_modules/motion-sensors-polyfill/src/motion-sensors.js';
import { MqttService } from 'ngx-mqtt';
import { ActivityCloud } from '../model/activityCloud.model.js';
import { MonitorService } from '../monitor.service.js';

@Component({
  selector: 'app-accelerometer-sensor',
  templateUrl: './accelerometer-sensor.component.html',
  styleUrls: ['./accelerometer-sensor.component.css']
})
export class AccelerometerSensorComponent implements OnInit {

  private latest: ActivityCloud;
  private lastHour: ActivityCloud[];
  private activityType = 'cloud';
  activityTimestamp = new Date();

  constructor(private readonly mqttService: MqttService, private readonly monitorService: MonitorService) { }

  historicMotion = {
    x: [],
    y: [],
    z: []
  };

  topicname = 'accelerometer/values'; // topic name

  ngOnInit() {

    const sensor = new LinearAccelerationSensor({ frequency: 1 });  // frequency: 1 means that the sensor sends a message every second

    sensor.start();

    // start every time the sensor sends a value
    sensor.onreading = () => {

        this.manageAndSendValues(sensor);

    };

  }

  manageAndSendValues(sensor: any) {

    // collects the sensor values
    this.historicMotion.x.push(Number(sensor.x.toFixed(2)));
    this.historicMotion.y.push(Number(sensor.y.toFixed(2)));
    this.historicMotion.z.push(Number(sensor.z.toFixed(2)));

    // send the data of the last 60 seconds
    if(this.historicMotion.z.length === 60 ){
      const timestamp = new Date().getTime() + '';

      const message = JSON.stringify({activityRecognition: 'cloud',activityTimestamp: timestamp, historicMotion: this.historicMotion});
      this.sendmsg(message);
      this.historicMotion = {
        x: [],
        y: [],
        z: []
      };
      // refresh the page with the new values
      this.refreshLatestValue();
      this.refreshLastHourValues();
    }

  }

  // send message to the MQTT broker
  sendmsg(msg: string): void {
    // use unsafe publish for non-ssl websockets
    this.mqttService.unsafePublish(this.topicname, msg, { qos: 1, retain: false });   // retain: false beacuse AWS doesn't accept retained messages
  }

  refreshLastHourValues() {
    this.monitorService.getActivities(false, this.activityType).subscribe(res => {
      this.lastHour = res.sort((a, b) => {
        return a.activityTimestamp.getTime() > b.activityTimestamp.getTime() ? -1
          : a.activityTimestamp.getTime() < b.activityTimestamp.getTime() ? 1 : 0;
      });
    });
  }

  refreshLatestValue() {
    this.monitorService.getActivities(true, this.activityType).subscribe(res => {
      this.latest = res[0];
    });
  }


}