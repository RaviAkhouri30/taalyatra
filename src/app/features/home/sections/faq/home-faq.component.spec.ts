import { TestBed } from '@angular/core/testing';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll, texts } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeFaqComponent } from './home-faq.component';

describe('HomeFaqComponent', () => {
  function render(body: unknown): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const fixture = TestBed.createComponent(HomeFaqComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should render each question as a disclosure, with the first one open', () => {
    const { element, get } = render(HOME.faq);
    const details = queryAll(element, 'details') as HTMLDetailsElement[];

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeFaq);
    expect(element.querySelector('section')?.id).toBe('faq');
    expect(texts(element, 'summary')).toHaveLength(5);
    expect(details.map((detail) => detail.open)).toEqual([true, false, false, false, false]);
  });

  it('should render nothing until the FAQ has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});
