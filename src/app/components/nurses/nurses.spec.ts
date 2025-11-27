import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nurses } from './nurses.component';

describe('Nurses', () => {
  let component: Nurses;
  let fixture: ComponentFixture<Nurses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nurses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nurses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
