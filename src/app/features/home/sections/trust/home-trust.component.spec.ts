import { TestBed } from '@angular/core/testing';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { queryAll, texts } from '@shared/testing/fixtures';
import { TRUST_DTOS, stubBackend } from '../../testing/home-fixtures';
import { HomeTrustComponent } from './home-trust.component';
import { TrustCardModel } from './trust-card.model';

describe('HomeTrustComponent', () => {
  it('should render nothing until its data has loaded, so nothing shifts under the hero', () => {
    TestBed.configureTestingModule({ providers: [stubBackend(null).provider] });
    const fixture = TestBed.createComponent(HomeTrustComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('section')).toBeNull();
  });

  it('should render one card per reassurance with its icon', () => {
    const backend = stubBackend(TRUST_DTOS);
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const fixture = TestBed.createComponent(HomeTrustComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(backend.get).toHaveBeenCalledWith(ApiEndpoint.HomeTrust);
    expect(texts(element, '.tcard b')).toEqual([
      'Facilitator-led',
      'A drum for everyone',
      '10 to 5,000 people',
      'Indoors or outdoors',
    ]);
    expect(queryAll(element, '.tico svg')).toHaveLength(4);
  });
});

describe('TrustCardModel', () => {
  it('should keep known icons and replace unknown ones', () => {
    expect(new TrustCardModel({ icon: 'group', title: 'T', text: 'x' }).icon).toBe(IconName.Group);
    expect(new TrustCardModel({ icon: 'nope', title: 'T', text: 'x' }).icon).toBe(IconName.Sparkle);
  });
});
