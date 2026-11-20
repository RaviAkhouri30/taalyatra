import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TOUR_VERSION } from '../models/tour.constants';
import { TourTarget } from '../models/tour.model';
import { provideEditorTesting } from '../testing/editor-testing';
import { DeviceStoreService } from './device-store.service';
import { TourService } from './tour.service';

describe('TourService', () => {
  function setUp(seen: string | null = null) {
    const testing = provideEditorTesting();
    if (seen) {
      testing.localStore.values.set('taal-yatra.tour.seen.admin-uid', seen);
    }
    TestBed.configureTestingModule({ providers: [...testing.providers, TourService] });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    return {
      tour: TestBed.inject(TourService),
      navigate,
      store: TestBed.inject(DeviceStoreService),
    };
  }

  it('should offer the tour to an account this device hasn’t asked', () => {
    expect(setUp().tour.offerOpen()).toBe(true);
  });

  it('should not offer it again once answered, here or on a later visit', () => {
    const { tour, store } = setUp();

    tour.decline();

    expect(tour.offerOpen()).toBe(false);
    expect(store.get('taal-yatra.tour.seen.admin-uid')).toBe(TOUR_VERSION);
  });

  it('should offer it again after the tour changes', () => {
    expect(setUp('0').tour.offerOpen()).toBe(true);
    TestBed.resetTestingModule();
    expect(setUp(TOUR_VERSION).tour.offerOpen()).toBe(false);
  });

  it('should go through the steps, opening each step’s page, and close after the last', () => {
    const { tour, navigate } = setUp();

    tour.start();
    expect(tour.step()?.id).toBe('welcome');
    expect(tour.progress()).toBe('Step 1 of 9');
    expect(tour.isFirst()).toBe(true);
    expect(tour.offerOpen()).toBe(false);
    for (let step = 0; step < 3; step += 1) {
      tour.next();
    }
    expect(tour.step()?.id).toBe('cards');
    expect(navigate).toHaveBeenCalledWith('/admin/hero');
    tour.back();
    expect(tour.step()?.id).toBe('find');
    for (let step = 0; step < 6; step += 1) {
      tour.next();
    }
    expect(tour.isLast()).toBe(true);
    tour.next();

    expect(tour.step()).toBeNull();
  });

  it('should stay on the first step when asked to go back', () => {
    const { tour } = setUp();
    tour.start();

    tour.back();

    expect(tour.step()?.id).toBe('welcome');
  });

  it('should close at once', () => {
    const { tour } = setUp();
    tour.start();

    tour.close();

    expect(tour.step()).toBeNull();
  });

  it('should hand the overlay the element of the step’s area, while it’s on the page', () => {
    const { tour } = setUp();
    const menu = document.createElement('nav');
    const other = document.createElement('nav');
    tour.register(TourTarget.Menu, menu);
    tour.start();
    tour.next();

    expect(tour.element()).toBe(menu);
    tour.unregister(TourTarget.Menu, other);
    expect(tour.element()).toBe(menu);
    tour.unregister(TourTarget.Menu, menu);
    expect(tour.element()).toBeNull();
  });
});
