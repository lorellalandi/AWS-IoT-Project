import { Component, OnInit } from '@angular/core';
import { LinearAccelerationSensor } from '../../../node_modules/motion-sensors-polyfill/src/motion-sensors.js';


@Component({
  selector: 'app-prova-sensor',
  templateUrl: './prova-sensor.component.html',
  styleUrls: ['./prova-sensor.component.css']
})
export class ProvaSensorComponent implements OnInit {

  constructor() { }

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
  sensorw;
  datestart;
  secondsNow: number;
  secondsSensor: number;

  ngOnInit() {
    const sensor = new LinearAccelerationSensor({ frequency: 1 });

    sensor.start();

    sensor.onreading = () => {
      this.motion(sensor);
    };

  }

  updateStatus() {
    const movement = this.mostRecentMovementOverall(30);
    this.motionOverall = movement.toFixed(2);


    if (this.mostRecentMovementOverall(4000) > 40) {
      this.activity = 'driving or other form of transportation';
    } else if (movement > 100) {
      this.activity = 'using your phone while running';
    } else if (movement > 45) {
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
    this.x = this.mostRecentMovement(this.historicMotion.x, 10, false).toFixed(2);
    this.y = this.mostRecentMovement(this.historicMotion.y, 10, false).toFixed(2);
    this.z = this.mostRecentMovement(this.historicMotion.z, 10, false).toFixed(2);

    this.historicMotion.x.push(sensor.x);
    this.historicMotion.y.push(sensor.y);
    this.historicMotion.z.push(sensor.z);
    this.sensorw = this.historicMotion.x.length + '-' + ((new Date().getTime() - this.datestart) / 1000);

    this.updateStatus();
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
}