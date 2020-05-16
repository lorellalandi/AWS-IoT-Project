import { Component, OnInit, OnDestroy } from '@angular/core';
import { LinearAccelerationSensor } from '../../../node_modules/motion-sensors-polyfill/src/motion-sensors.js';
import { Subscription } from 'rxjs';
import { IMqttMessage, MqttService } from 'ngx-mqtt';

@Component({
  selector: 'app-prova-sensor',
  templateUrl: './prova-sensor.component.html',
  styleUrls: ['./prova-sensor.component.css']
})
export class ProvaSensorComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(private readonly mqttService: MqttService) { }

  historicMotion = {
    x: [],
    y: [],
    z: []
  };

  x: string | number;
  y: string | number;
  z: string | number;
  motionOverall: string | number;
  activity: string;
  logMsg: string[];
  topicname = 'sensor/values';
  msg: IMqttMessage;

  ngOnInit() {

    const sensor = new LinearAccelerationSensor({ frequency: 1 });

    this.subscribeNewTopic();
    sensor.start();

    sensor.onreading = () => {

      this.motion(sensor);
      
    };

  }

  updateStatus() {
    const movement = this.mostRecentMovementOverall(15);
    this.motionOverall = movement.toFixed(2);

    if (this.mostRecentMovementOverall(400) > 40) { 
      this.activity = 'driving or other form of transportation';
    } else if (movement > 30) {
      this.activity = 'using your phone while walking';
    } else {
      this.activity = 'using your phone, sitting or standing';
    }
  }

  mostRecentMovementOverall(numberOfHistoricPoints) {
    return (this.mostRecentMovement(this.historicMotion.x, numberOfHistoricPoints, true) +
      this.mostRecentMovement(this.historicMotion.y, numberOfHistoricPoints, true) +
      this.mostRecentMovement(this.historicMotion.z, numberOfHistoricPoints, true)) / 3.0;
  }

  motion(sensor: any) {
    this.x = this.mostRecentMovement(this.historicMotion.x, 15, false).toFixed(2);
    this.y = this.mostRecentMovement(this.historicMotion.y, 15, false).toFixed(2);
    this.z = this.mostRecentMovement(this.historicMotion.z, 15, false).toFixed(2);

    this.historicMotion.x.push(sensor.x);
    this.historicMotion.y.push(sensor.y);
    this.historicMotion.z.push(sensor.z);

    this.updateStatus(), 100;
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

  subscribeNewTopic(): void {
    console.log('inside subscribe new topic')
    this.subscription = this.mqttService.observe(this.topicname).subscribe((message: IMqttMessage) => {
      this.msg = message;
      console.log('msg: ', message);
      this.logMsg.push('Message: ' + message.payload.toString() + ' for topic: ' + message.topic);
    });
    this.logMsg.push('subscribed to topic: ' + this.topicname);
  }

  sendmsg(msg: string): void {
    // use unsafe publish for non-ssl websockets
    this.mqttService.unsafePublish(this.topicname, msg, { qos: 1, retain: true });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}