import { Component, OnInit } from '@angular/core';
import { LinearAccelerationSensor } from 'motion-sensors-polyfill/src/motion-sensors';
import { MqttService } from 'ngx-mqtt';

@Component({
  selector: 'app-activity-recognition',
  templateUrl: './activity-recognition.component.html',
  styleUrls: ['./activity-recognition.component.css']
})
export class ActivityRecognitionComponent implements OnInit {

  constructor(private readonly mqttService: MqttService) { }

  historicMotion = {
    x: [],
    y: [],
    z: []
  };

  activity= '';
  topicname = 'accelerometer/values';

  ngOnInit() {

    const sensor = new LinearAccelerationSensor({ frequency: 1 });
    sensor.start();

    sensor.onreading = () => {

        this.motion(sensor);
      
    };

  }

  updateStatus() {
    const movement = this.mostRecentMovementOverall(30);

    if (movement > 90) {
      this.activity = 'running';
    } else if (movement > 20) {
      this.activity = 'walking';
    } else {
      this.activity = 'standing still';
    }
  }

  mostRecentMovementOverall(numberOfHistoricPoints) {
    return (this.mostRecentMovement(this.historicMotion.x, numberOfHistoricPoints, true) +
      this.mostRecentMovement(this.historicMotion.y, numberOfHistoricPoints, true) +
      this.mostRecentMovement(this.historicMotion.z, numberOfHistoricPoints, true)) / 3.0;
  }

  motion(sensor: any) {
    this.historicMotion.x.push(sensor.x);
    this.historicMotion.y.push(sensor.y);
    this.historicMotion.z.push(sensor.z);

    const oldActivity = this.activity;
    this.updateStatus();
   
    if (this.activity != oldActivity){
      const timestamp = new Date().getTime() + '';
      const message = JSON.stringify({"activityRecognition": "edge", "activityTimestamp": timestamp, "activity": this.activity});
      this.sendmsg(message);
    }
  }

  mostRecentMovement(array, numberOfHistoricPoints, removeNegatives) {
    if (array.length > numberOfHistoricPoints) {
      let totalSum = 0;
      for (let toCount = 0; toCount < numberOfHistoricPoints; toCount++) {
        let currentElement = array[array.length - toCount - 1];
        currentElement *= (1 - toCount / numberOfHistoricPoints) // weight the most recent data more
        if (currentElement < 0 && removeNegatives) {
          currentElement = currentElement * -1;
        }
        if (currentElement > 0.1 || currentElement < -0.1) {
          totalSum += currentElement;
        }
      }
      return totalSum * 100 / numberOfHistoricPoints;
    }
    return 0; // not enough data yet
  }

  sendmsg(msg: string): void {
    // use unsafe publish for non-ssl websockets
    this.mqttService.unsafePublish(this.topicname, msg, { qos: 1, retain: false });
  }

}