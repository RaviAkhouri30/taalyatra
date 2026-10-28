import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PAGES, provideFakeContent, queryAll, texts } from '@shared/testing/fixtures';
import AchievementsPageComponent from './achievements-page.component';

describe('AchievementsPageComponent', () => {
  function render() {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideFakeContent().provider],
    });
    const fixture = TestBed.createComponent(AchievementsPageComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should render stats as terms and values, the timeline, recognition and the call to action', () => {
    const element = render();

    expect(element.querySelector('h1')?.textContent).toContain('Years of stages');
    expect(texts(element, '.astats dt')).toEqual(
      PAGES.achievements.stats.map((stat) => stat.label),
    );
    expect(queryAll(element, '.mline li')).toHaveLength(6);
    expect(queryAll(element, '.aw .awi svg')).toHaveLength(4);
    expect(element.querySelector('app-page-cta h2')?.textContent).toBe('Want us at your event?');
  });

  it('should show unlinked press items as text and list the performances', () => {
    const element = render();

    expect(queryAll(element, '.press a')).toHaveLength(0);
    expect(queryAll(element, '.press .pr')).toHaveLength(3);
    expect(queryAll(element, '.perf li')).toHaveLength(5);
  });
});
