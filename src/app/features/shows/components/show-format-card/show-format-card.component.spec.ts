import { TestBed } from '@angular/core/testing';
import { IconName } from '@shared/enums/icon-name.enum';
import { texts } from '@shared/testing/fixtures';
import { ShowFormatCardComponent } from './show-format-card.component';

describe('ShowFormatCardComponent', () => {
  it('should show the icon, name, description and each spec as a term and value', () => {
    const fixture = TestBed.createComponent(ShowFormatCardComponent);
    fixture.componentRef.setInput('format', {
      image: { src: '/images/shows/live-band.svg', alt: '', width: 800, height: 500 },
      icon: IconName.Mic,
      title: 'Live band',
      text: 'A full band set.',
      specs: [{ label: 'Ensemble', value: '6–8 players' }],
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('img.art')?.getAttribute('alt')).toBe('');
    expect(element.querySelector('.sico svg')).not.toBeNull();
    expect(element.querySelector('h3')?.textContent).toBe('Live band');
    expect(texts(element, 'dt')).toEqual(['Ensemble']);
    expect(texts(element, 'dd')).toEqual(['6–8 players']);
  });
});
