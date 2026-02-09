import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTaskCard } from './single-task-card';

describe('SingleTaskCard', () => {
  let component: SingleTaskCard;
  let fixture: ComponentFixture<SingleTaskCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleTaskCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleTaskCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
