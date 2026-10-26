import { TestBed } from '@angular/core/testing';
import { VideoCardVariant } from '@shared/enums/variant.enums';
import { type IVideoDto } from '@shared/interfaces/i-video';
import { VideoCardComponent } from './video-card.component';

const VIDEO: IVideoDto = {
  title: 'Drum day',
  category: 'Corporate',
  caption: 'Corporate drum circle',
  image: { src: '/images/x.jpg', alt: '', width: 800, height: 450 },
  duration: '3:42',
  url: 'https://youtube.test/v',
};

describe('VideoCardComponent', () => {
  function render(variant?: VideoCardVariant, video: IVideoDto = VIDEO): HTMLElement {
    const fixture = TestBed.createComponent(VideoCardComponent);
    fixture.componentRef.setInput('video', video);
    fixture.componentRef.setInput('ariaLabel', 'Watch Drum day on YouTube');
    if (variant) fixture.componentRef.setInput('variant', variant);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should link to the video with its title, duration and caption (teaser)', () => {
    const element = render();
    const link = element.querySelector('a')!;

    expect(link.getAttribute('href')).toBe(VIDEO.url);
    expect(link.getAttribute('aria-label')).toBe('Watch Drum day on YouTube');
    expect(element.querySelector('.vtime')?.textContent).toBe('3:42');
    expect(element.querySelector('p')?.textContent).toBe('Corporate drum circle');
    expect(element.querySelector('.vcat')).toBeNull();
  });

  it('should show the category instead of the caption in the library', () => {
    const element = render(VideoCardVariant.Library);

    expect(element.querySelector('.vcat')?.textContent).toBe('Corporate');
    expect(element.querySelector('p')).toBeNull();
  });

  it('should omit an empty caption', () => {
    expect(render(undefined, { ...VIDEO, caption: '' }).querySelector('p')).toBeNull();
  });
});
