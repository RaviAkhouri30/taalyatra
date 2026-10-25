import { TestBed } from '@angular/core/testing';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { texts } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeMarqueeComponent } from './home-marquee.component';
import { MarqueeModel } from './marquee.model';

describe('HomeMarqueeComponent', () => {
  it('should draw the items twice for a seamless loop, hidden from assistive tech', () => {
    const backend = stubBackend(HOME.marquee);
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const fixture = TestBed.createComponent(HomeMarqueeComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(backend.get).toHaveBeenCalledWith(ApiEndpoint.HomeMarquee);
    expect(element.querySelector('.strip')?.getAttribute('aria-hidden')).toBe('true');
    expect(texts(element, 'span')).toEqual([...HOME.marquee, ...HOME.marquee]);
  });
});

describe('MarqueeModel', () => {
  it('should keep the original items and a doubled track', () => {
    const model = new MarqueeModel(['A', 'B']);

    expect(model.items).toEqual(['A', 'B']);
    expect(model.track).toEqual(['A', 'B', 'A', 'B']);
  });
});
