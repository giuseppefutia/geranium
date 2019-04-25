import { TestBed } from '@angular/core/testing';

import { PapersService } from './papers.service';

describe('PapersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PapersService = TestBed.get(PapersService);
    expect(service).toBeTruthy();
  });
});
