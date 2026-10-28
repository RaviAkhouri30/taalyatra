import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShowSpotlightModel } from '@shared/models/show-spotlight.model';
import { SHOW_FORMATS_FIXTURE, queryAll } from '@shared/testing/fixtures';
import { ShowSpotlightComponent } from './show-spotlight.component';

describe('ShowSpotlightComponent', () => {
  function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ShowSpotlightComponent);
    fixture.componentRef.setInput('spotlight', ShowSpotlightModel.from(SHOW_FORMATS_FIXTURE));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the image, eyebrow, title, story and the two buttons', () => {
    const element = render();

    expect(element.querySelector('img')?.getAttribute('alt')).toContain('tabla');
    expect(element.querySelector('.eyebrow')?.textContent).toBe('Classical concerts');
    expect(element.querySelector('h3')?.textContent).toBe(
      'An evening of Hindustani classical rhythm.',
    );
    expect(queryAll(element, 'a').map((link) => link.getAttribute('href'))).toEqual([
      '/#contact',
      '/videos',
    ]);
  });
});
