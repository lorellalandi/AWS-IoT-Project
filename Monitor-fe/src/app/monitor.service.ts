import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Station } from './model/station.model';
import { StationResponse, PayloadResponse } from './model/station.response';
import { StationSensor } from './model/stationSensor.model';
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
      station.windDirection = stationPayload.windDirection.N ? Number(stationPayload.windDirection.N) : Number(stationPayload.windDirection.S);
      station.windIntensity = stationPayload.windIntensity.N ? Number(stationPayload.windIntensity.N) : Number(stationPayload.windIntensity.S);
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

  getUnitOfMeasure(value: string): String {
    let unit: string;
    switch (value) {
      case 'temperature':
        unit = 'Celsius'
        break;
      case 'humidity':
        unit = '%'
        break;
      case 'windDirection':
        unit = 'degrees'
        break;
      case 'windIntensity':
        unit = 'm/s'
        break;
      case 'rainHeight':
        unit = 'mm/h'
        break;
    
      default:
        break;
    }
    return unit;
  }
}
