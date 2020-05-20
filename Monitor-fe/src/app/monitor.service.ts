import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Station } from './model/station.model';
import { StationResponse, PayloadResponse } from './model/station.response';
import { StationSensor } from './model/stationSensor.model';
import { ActivityCloudResponse } from './model/activityCloud.response';
import { ActivityCloud } from './model/activityCloud.model';
const API_URL = 'http://localhost:5000/api/';


@Injectable({
  providedIn: 'root'
})
export class MonitorService {

  constructor(private readonly http: HttpClient) { }

  // Calls backend service, maps result
  getLatestValues(id: number): Observable<Station> {
    return this.http.get<PayloadResponse[]>(API_URL + 'station?id=' + id).pipe(map(data => {
      const stationPayload: StationResponse = data[0].Payload.M;
      const station = new Station();
      station.humidity = stationPayload.humidity.N ? Number(stationPayload.humidity.N) : Number(stationPayload.humidity.S);
      station.temperature = stationPayload.temperature.N ? Number(stationPayload.temperature.N) : Number(stationPayload.temperature.S);
      station.stationId = stationPayload.id.N ? Number(stationPayload.id.N) : Number(stationPayload.id.S);
      station.timestamp = stationPayload.timestamp.N ? new Date(Number(stationPayload.timestamp.N))
        : new Date(Number(stationPayload.timestamp.S));
      station.windDirection = stationPayload.windDirection.N ? Number(stationPayload.windDirection.N)
        : Number(stationPayload.windDirection.S);
      station.windIntensity = stationPayload.windIntensity.N ? Number(stationPayload.windIntensity.N)
        : Number(stationPayload.windIntensity.S);
      station.rainHeight = stationPayload.rainHeight.N ? Number(stationPayload.rainHeight.N) : Number(stationPayload.rainHeight.S);
      return station;
    }));
  }

  // Calls backend service, maps result and shows only the selected field
  getLastHourValues(value: string): Observable<StationSensor[]> {
    const uom = this.getUnitOfMeasure(value);
    return this.http.get<PayloadResponse[]>(API_URL + 'lastHour').pipe(map(data => {
      const stations: StationSensor[] = [];
      data.forEach(element => {
        const stationPayload: StationResponse = element.Payload.M;
        const station = new StationSensor();
        station.value = stationPayload[value].N ? stationPayload[value].N + ' ' + uom : stationPayload[value].S + ' ' + uom;
        station.stationId = stationPayload.id.N ? Number(stationPayload.id.N) : Number(stationPayload.id.S);
        station.timestamp = stationPayload.timestamp.N ? new Date(Number(stationPayload.timestamp.N))
          : new Date(Number(stationPayload.timestamp.S));
        stations.push(station);
      });
      return stations;
    }));
  }

  getUnitOfMeasure(value: string): string {
    let unit: string;
    switch (value) {
      case 'temperature':
        unit = 'Celsius';
        break;
      case 'humidity':
        unit = '%';
        break;
      case 'windDirection':
        unit = 'degrees';
        break;
      case 'windIntensity':
        unit = 'm/s';
        break;
      case 'rainHeight':
        unit = 'mm/h';
        break;
      default:
        break;
    }
    return unit;
  }

  /**
   * Calls backend service and maps results
   * @param isLatest boolean -> if true returns latest activity, else last hour activities
   * @param type string -> either 'cloud' or 'edge'
   */
  getActivities(isLatest: boolean, type: string): Observable<ActivityCloud[]> {
    const partUrl = isLatest ? 'latestActivity' : 'lastHourActivities';
    return this.http.get<ActivityCloudResponse[]>(API_URL + partUrl + '?activityRecognition=' + type).pipe(map(data => {
      const activities: ActivityCloud[] = [];
      if (type === 'edge') {
        data.forEach(element => {
          const activity = new ActivityCloud();
          activity.activity = element.activity.S;
          activity.activityTimestamp = new Date(Number(element.activityTimestamp.S));
          activities.push(activity);
        });
      } else {
        data.forEach(element => {
          const activity = new ActivityCloud();
          activity.activity = element.activity.S;
          activity.activityTimestamp = new Date(Number(element.activityTimestamp.S));
          activity.latestX = Number(element.latestX.N);
          activity.latestY = Number(element.latestY.N);
          activity.latestZ = Number(element.latestZ.N);
          activity.motionOverall = Number(element.motionOverall.S);
          activities.push(activity);
        });
      }
      return activities;
    }));
  }
}