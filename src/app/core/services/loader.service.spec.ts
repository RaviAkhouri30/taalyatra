import { TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  it('should stay loading until every started request stops', () => {
    const loader = TestBed.inject(LoaderService);

    loader.start();
    loader.start();
    loader.stop();
    expect(loader.isLoading()).toBe(true);

    loader.stop();
    expect(loader.isLoading()).toBe(false);
  });

  it('should never count below zero', () => {
    const loader = TestBed.inject(LoaderService);

    loader.stop();
    loader.start();

    expect(loader.isLoading()).toBe(true);
  });
});
