import { TestBed } from '@angular/core/testing';

import { PathConfigService } from './path-config.service';

describe('PathConfigService', () => {
  let service: PathConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PathConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
