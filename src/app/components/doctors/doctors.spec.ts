import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsComponent } from './doctors.component';

describe('Doctors', () => {
  let component: DoctorsComponent;
  let fixture: ComponentFixture<DoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
