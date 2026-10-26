import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeMidCtaComponent } from './home-mid-cta.component';

describe('HomeMidCtaComponent', () => {
  function render(body: unknown): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [provideRouter([]), backend.provider] });
    const fixture = TestBed.createComponent(HomeMidCtaComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should invite a proposal or a WhatsApp message', () => {
    const { element, get } = render(HOME.midCta);
    const buttons = queryAll(element, '.midbtns a');

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeMidCta);
    expect(element.querySelector('h2')?.textContent).toBe('Let’s hear your group play.');
    expect(buttons.map((button) => button.getAttribute('href'))).toEqual([
      '/#contact',
      'https://wa.me/919284276168',
    ]);
  });

  it('should render nothing until the band has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});
