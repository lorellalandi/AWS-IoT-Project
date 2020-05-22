import { Component, OnInit } from '@angular/core';
import { LinearAccelerationSensor } from 'motion-sensors-polyfill/src/motion-sensors';
import { MonitorService } from '../monitor.service';
import { ActivityEdge } from '../model/activityEdge.model';
import { MqttService } from 'ngx-mqtt';

@Component({
  selector: 'app-activity-recognition',
  templateUrl: './activity-recognition.component.html',
  styleUrls: ['./activity-recognition.component.css']
})
export class ActivityRecognitionComponent implements OnInit {

  private latest: ActivityEdge;
  private lastHour: ActivityEdge[];
  private activityType = 'edge';

  constructor(private readonly mqttService: MqttService, private readonly monitorService: MonitorService) { }

  historicMotion = {
    x: [],
    y: [],
    z: []
  };

  activity = '';
  topicname = 'accelerometer/values'; // topic name


  ngOnInit() {

    const sensor = new LinearAccelerationSensor({ frequency: 1 });  // frequency: 1 means that the sensor sends a message every second


    sensor.start();

    // start every time the sensor sends a value
    sensor.onreading = () => {
      this.motion(sensor);
    };

  }

  updateStatus() {
    const movement = this.mostRecentMovementOverall(30);

    // activity recognition
    if (movement > 90) {
      this.activity = 'running';
    } else if (movement > 20) {
      this.activity = 'walking';
    } else {
      this.activity = 'standing still';
    }
  }

  // get the average motion of all the axis
  mostRecentMovementOverall(numberOfHistoricPoints) {
    return (this.mostRecentMovement(this.historicMotion.x, numberOfHistoricPoints, true) +
      this.mostRecentMovement(this.historicMotion.y, numberOfHistoricPoints, true) +
      this.mostRecentMovement(this.historicMotion.z, numberOfHistoricPoints, true)) / 3.0;
  }

  motion(sensor: any) {
    // collect the values
    this.historicMotion.x.push(sensor.x);
    this.historicMotion.y.push(sensor.y);
    this.historicMotion.z.push(sensor.z);

    const oldActivity = this.activity;
    this.updateStatus();

    // send the message only if the user activity is changed
    if (this.activity != oldActivity) {
      const timestamp = new Date().getTime() + '';
      const message = JSON.stringify({ "activityRecognition": "edge", "activityTimestamp": timestamp, "activity": this.activity });
      this.sendmsg(message);
      this.refreshLatestValue();
      this.refreshLastHourValues();
    }
  }

  // get the weighted average of a given number of values of an axis
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
      return totalSum * 100 / numberOfHistoricPoints; // give the value in percentual
    }
    return 0; // not enough data yet
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