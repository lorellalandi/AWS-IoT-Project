import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvaSensorComponent } from './prova-sensor.component';

describe('ProvaSensorComponent', () => {
  let component: ProvaSensorComponent;
  let fixture: ComponentFixture<ProvaSensorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvaSensorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvaSensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
