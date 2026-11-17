import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type FakeObserver, stubObservers } from '@shared/testing/motion-stubs';
import { READING_BAND } from '../models/editor-nav.constants';
import { InViewDirective } from './in-view.directive';

@Component({
  imports: [InViewDirective],
  template: '<section appInView (entered)="entered = entered + 1"></section>',
})
class HostComponent {
  public entered = 0;
}

describe('InViewDirective', () => {
  let observers: FakeObserver[];

  beforeEach(() => {
    observers = stubObservers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    return fixture;
  }

  it('should watch its element against the reading band', async () => {
    const fixture = await render();

    expect(observers[0]?.options).toEqual({ rootMargin: READING_BAND });
    const element = fixture.nativeElement as HTMLElement;
    expect(observers[0]?.observed).toEqual([element.querySelector('section')]);
  });

  it('should emit when the element enters the reading band', async () => {
    const fixture = await render();

    observers[0]?.fire(true);

    expect(fixture.componentInstance.entered).toBe(1);
  });

  it('should stay quiet when the element leaves it', async () => {
    const fixture = await render();

    observers[0]?.fire(false);

    expect(fixture.componentInstance.entered).toBe(0);
  });

  it('should stop watching when destroyed', async () => {
    const fixture = await render();

    fixture.destroy();

    expect(observers[0]?.disconnect).toHaveBeenCalled();
  });

  it('should do nothing in a browser without the observer', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    await expect(render()).resolves.toBeDefined();
  });
});
