import { TestBed } from '@angular/core/testing';

import { LocalAuthService } from './local-auth.service';

describe('LocalAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocalAuthService = TestBed.get(LocalAuthService);
    expect(service).toBeTruthy();
  });
});
