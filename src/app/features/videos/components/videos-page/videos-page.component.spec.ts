import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideFakeContent, queryAll, texts } from '@shared/testing/fixtures';
import VideosPageComponent from './videos-page.component';

describe('VideosPageComponent', () => {
  function render() {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideFakeContent().provider],
    });
    const fixture = TestBed.createComponent(VideosPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const chip = (label: string) =>
      queryAll(element, '.fc').find((button) => button.textContent.trim() === label)!;
    return { fixture, element, chip };
  }

  it('should render the hero, chips, a featured video, the grid and the calls to action', () => {
    const { element } = render();

    expect(element.querySelector('h1')?.textContent).toContain('Watch the beat');
    expect(texts(element, '.fc')).toEqual([
      'All',
      'Corporate',
      'Family',
      'Workshops',
      'Behind the scenes',
    ]);
    expect(element.querySelector('.count')?.getAttribute('aria-live')).toBe('polite');
    expect(element.querySelector('app-video-card.featured h2')?.textContent).toBe(
      '[Video title 1]',
    );
    expect(queryAll(element, '.vg .vcard')).toHaveLength(8);
    expect(texts(element, 'app-page-cta a')).toEqual([
      'Visit our YouTube channel',
      'Plan your session',
    ]);
  });

  it('should filter by category when a chip is pressed', () => {
    const { fixture, element, chip } = render();

    chip('Family').click();
    fixture.detectChanges();

    expect(chip('Family').getAttribute('aria-pressed')).toBe('true');
    expect(element.querySelector('.count')?.textContent).toBe('Showing 2 videos');
    expect(queryAll(element, '.vg .vcard')).toHaveLength(1);
  });
});
