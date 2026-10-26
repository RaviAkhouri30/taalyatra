import { TestBed } from '@angular/core/testing';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { queryAll, texts } from '@shared/testing/fixtures';
import { AUDIENCES_DTO, stubBackend } from '../../testing/home-fixtures';
import { AudienceCardModel } from './audiences.model';
import { HomeAudiencesComponent } from './home-audiences.component';

describe('HomeAudiencesComponent', () => {
  function render(body: unknown): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const fixture = TestBed.createComponent(HomeAudiencesComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should render the heading under the #for-everyone anchor', () => {
    const { element, get } = render(AUDIENCES_DTO);

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeAudiences);
    expect(element.querySelector('section')?.id).toBe('for-everyone');
    expect(element.querySelector('h2')?.textContent).toBe('Made for every kind of gathering.');
  });

  it('should render each audience card with its icon and tags', () => {
    const { element } = render(AUDIENCES_DTO);

    expect(texts(element, '.acard h3')).toEqual([
      'Corporate teams',
      'Family functions',
      'Fun seekers',
    ]);
    expect(queryAll(element, '.ico svg')).toHaveLength(3);
    expect(texts(element, '.acard:first-child li')).toEqual([
      'Team building',
      'Engagement',
      'Rewards',
    ]);
  });

  it('should render nothing until the section has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});

describe('AudienceCardModel', () => {
  it('should replace an unknown icon with the default', () => {
    const card = new AudienceCardModel({ icon: 'nope', title: 'T', text: 'x', tags: [] });

    expect(card.icon).toBe(IconName.Sparkle);
  });
});
