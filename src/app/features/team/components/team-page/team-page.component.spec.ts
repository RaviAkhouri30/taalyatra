import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideFakeContent, queryAll, texts } from '@shared/testing/fixtures';
import TeamPageComponent from './team-page.component';

describe('TeamPageComponent', () => {
  it('should render the hero, every member, the three habits and the call to action', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideFakeContent().provider],
    });
    const fixture = TestBed.createComponent(TeamPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('The people behind');
    expect(queryAll(element, 'app-team-card')).toHaveLength(6);
    expect(texts(element, '.val h3')).toEqual([
      'We listen first',
      'We keep it welcoming',
      'We bring the joy',
    ]);
    expect(element.querySelector('app-page-cta h2')?.textContent).toBe('Want to play with us?');
    expect(queryAll(element, 'app-page-cta a').map((link) => link.getAttribute('href'))).toEqual([
      '/#contact',
      '/videos',
    ]);
  });
});
