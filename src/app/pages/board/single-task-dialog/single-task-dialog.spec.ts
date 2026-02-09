import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTaskDialog } from './single-task-dialog';

describe('SingleTaskDialog', () => {
  let component: SingleTaskDialog;
  let fixture: ComponentFixture<SingleTaskDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleTaskDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleTaskDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
