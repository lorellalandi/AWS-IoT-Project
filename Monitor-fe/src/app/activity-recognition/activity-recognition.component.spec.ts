import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityRecognitionComponent } from './activity-recognition.component';

describe('ActivityRecognitionComponent', () => {
  let component: ActivityRecognitionComponent;
  let fixture: ComponentFixture<ActivityRecognitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityRecognitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
