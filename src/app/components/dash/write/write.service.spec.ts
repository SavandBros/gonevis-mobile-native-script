import { TestBed } from '@angular/core/testing';

import { WriteService } from './write.service';

describe('WriteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WriteService = TestBed.get(WriteService);
    expect(service).toBeTruthy();
  });
});
