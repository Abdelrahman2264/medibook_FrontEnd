import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsCompomemt } from './doctors.component';

describe('Doctors', () => {
  let component: DoctorsCompomemt;
  let fixture: ComponentFixture<DoctorsCompomemt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorsCompomemt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorsCompomemt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
