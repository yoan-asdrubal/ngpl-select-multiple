import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgplSelectMultipleTestComponent } from './ngpl-select-multiple-test.component';

describe('NgplSelectTestComponent', () => {
  let component: NgplSelectMultipleTestComponent;
  let fixture: ComponentFixture<NgplSelectMultipleTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgplSelectMultipleTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgplSelectMultipleTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
