import { Component, OnInit } from '@angular/core';
import { LinearAccelerationSensor } from '../../../node_modules/motion-sensors-polyfill/src/motion-sensors.js';
import { MqttService } from 'ngx-mqtt';

@Component({
  selector: 'app-accelerometer-sensor',
  templateUrl: './accelerometer-sensor.component.html',
  styleUrls: ['./accelerometer-sensor.component.css']
})
export class AccelerometerSensorComponent implements OnInit {

  constructor(private readonly mqttService: MqttService) { }

  historicMotion = {
    x: [],
    y: [],
    z: []
  };

  topicname = 'accelerometer/values';

  ngOnInit() {

    const sensor = new LinearAccelerationSensor({ frequency: 1 });

    sensor.start();

    sensor.onreading = () => {

        this.manageAndSendValues(sensor);   

    };

  }

  manageAndSendValues(sensor: any) {

    this.historicMotion.x.push(Number(sensor.x.toFixed(2)));
    this.historicMotion.y.push(Number(sensor.y.toFixed(2)));
    this.historicMotion.z.push(Number(sensor.z.toFixed(2)));

    if(this.historicMotion.z.length == 60 ){
      const timestamp = new Date().getTime() + '';

      const message = JSON.stringify({"activityRecognition": "cloud","activityTimestamp": timestamp, "historicMotion": this.historicMotion});
      this.sendmsg(message);
      this.historicMotion = {
        x: [],
        y: [],
        z: []
      };

    }

  }

  sendmsg(msg: string): void {
    // use unsafe publish for non-ssl websockets
    this.mqttService.unsafePublish(this.topicname, msg, { qos: 1, retain: false });
  }

}