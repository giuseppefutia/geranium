import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalsPage } from './journals.page';

describe('JournalsPage', () => {
  let component: JournalsPage;
  let fixture: ComponentFixture<JournalsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
