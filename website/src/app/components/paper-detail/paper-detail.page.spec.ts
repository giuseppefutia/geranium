import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperDetailPage } from './paper-detail.page';

describe('PaperDetailPage', () => {
  let component: PaperDetailPage;
  let fixture: ComponentFixture<PaperDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaperDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaperDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
