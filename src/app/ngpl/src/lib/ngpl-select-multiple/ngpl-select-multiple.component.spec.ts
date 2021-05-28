import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NgplSelectMultipleComponent } from './ngpl-select-multiple.component';

describe('WidgetAutocompleteMultipleComponent', () => {
  let component: NgplSelectMultipleComponent;
  let fixture: ComponentFixture<NgplSelectMultipleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NgplSelectMultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgplSelectMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
