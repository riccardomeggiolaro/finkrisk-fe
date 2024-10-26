import { TestBed } from '@angular/core/testing';

import { DriveService } from './drive-drive.service';

describe('GoogleDriveService', () => {
  let service: DriveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
