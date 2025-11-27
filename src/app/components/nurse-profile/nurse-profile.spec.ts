import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseProfile } from './nurse-profile.component';

describe('NurseProfile', () => {
  let component: NurseProfile;
  let fixture: ComponentFixture<NurseProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NurseProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NurseProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
