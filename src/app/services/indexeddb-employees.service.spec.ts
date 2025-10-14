import { TestBed } from '@angular/core/testing';

import { IndexeddbEmployeesService } from './indexeddb-employees.service';

describe('IndexeddbEmployeesService', () => {
  let service: IndexeddbEmployeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexeddbEmployeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
