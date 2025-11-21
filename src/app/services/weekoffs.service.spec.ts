import { TestBed } from '@angular/core/testing';

import { WeekoffsService } from './weekoffs.service';

describe('WeekoffsService', () => {
  let service: WeekoffsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeekoffsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
