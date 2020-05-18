import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccelerometerSensorComponent } from './accelerometer-sensor.component';

describe('AccelerometerSensorComponent', () => {
  let component: AccelerometerSensorComponent;
  let fixture: ComponentFixture<AccelerometerSensorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccelerometerSensorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccelerometerSensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
