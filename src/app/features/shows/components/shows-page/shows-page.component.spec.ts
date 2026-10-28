import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideFakeContent, queryAll, texts } from '@shared/testing/fixtures';
import ShowsPageComponent from './shows-page.component';

describe('ShowsPageComponent', () => {
  it('should render the hero buttons, formats, setups, steps and closing buttons', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideFakeContent().provider],
    });
    const fixture = TestBed.createComponent(ShowsPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Not just workshops');
    expect(texts(element, '.hero-actions a')).toEqual(['Enquire about a show', 'WhatsApp us']);
    expect(queryAll(element, 'app-show-format-card')).toHaveLength(6);
    expect(queryAll(element, '.setup')).toHaveLength(6);
    expect(queryAll(element, 'app-steps .step')).toHaveLength(4);
    expect(texts(element, '.process-actions a')).toEqual(['Request a proposal', 'Watch us play']);
  });
});
