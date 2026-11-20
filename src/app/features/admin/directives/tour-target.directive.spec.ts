import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TourTarget } from '../models/tour.model';
import { TourService } from '../services/tour.service';
import { provideEditorTesting } from '../testing/editor-testing';
import { TourTargetDirective } from './tour-target.directive';

@Component({
  imports: [TourTargetDirective],
  template: `@if (shown()) {
    <a [appTourTarget]="target()">Link</a>
  }`,
})
class HostComponent {
  public readonly shown = signal(true);
  public readonly target = signal<TourTarget | null>(TourTarget.Review);
}

describe('TourTargetDirective', () => {
  function render() {
    TestBed.configureTestingModule({
      providers: [...provideEditorTesting().providers, TourService],
    });
    const tour = TestBed.inject(TourService);
    const register = vi.spyOn(tour, 'register');
    const unregister = vi.spyOn(tour, 'unregister');
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture, register, unregister };
  }

  it('should tell the tour while its area is on the page', () => {
    const { fixture, register, unregister } = render();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a')!;

    expect(register).toHaveBeenCalledWith(TourTarget.Review, link);
    fixture.componentInstance.shown.set(false);
    fixture.detectChanges();

    expect(unregister).toHaveBeenCalledWith(TourTarget.Review, link);
  });

  it('should follow a change of area, and register nothing for none', () => {
    const { fixture, register, unregister } = render();

    fixture.componentInstance.target.set(null);
    fixture.detectChanges();
    fixture.componentInstance.shown.set(false);
    fixture.detectChanges();

    expect(unregister).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledTimes(1);
  });

  it('should work on a page without the tour', () => {
    TestBed.configureTestingModule({ providers: provideEditorTesting().providers });
    const fixture = TestBed.createComponent(HostComponent);

    expect(() => {
      fixture.detectChanges();
    }).not.toThrow();
  });
});
