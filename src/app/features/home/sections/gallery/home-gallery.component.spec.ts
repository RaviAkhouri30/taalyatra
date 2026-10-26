import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll } from '@shared/testing/fixtures';
import { GALLERY, HOME } from '../../testing/home-fixtures';
import { HomeGalleryComponent } from './home-gallery.component';
import { HomeGalleryViewModel } from './home-gallery.view-model';

describe('HomeGalleryComponent', () => {
  function render(heading: unknown) {
    const bodies = new Map<string, unknown>([
      [ApiEndpoint.HomeGallery, heading],
      [ApiEndpoint.Gallery, GALLERY],
    ]);
    const get = (path: string) =>
      of(new HttpResponse({ status: 200, body: bodies.get(path) ?? null }));
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: IHttpBackend, useValue: { get } }],
    });
    const fixture = TestBed.createComponent(HomeGalleryComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const model = fixture.debugElement.injector.get(HomeGalleryViewModel);
    return { fixture, element, model };
  }

  it('should render a labelled tile per photo, the Instagram tile and the note', () => {
    const { element } = render(HOME.gallery);
    const tiles = queryAll(element, '.gtile');

    expect(element.querySelector('section')?.id).toBe('gallery');
    expect(tiles).toHaveLength(7);
    expect(tiles[0]?.getAttribute('aria-label')).toBe(
      'Open photo: A full drum circle seen from above',
    );
    expect(element.querySelector('.gmore')?.getAttribute('href')).toBe(
      'https://www.instagram.com/',
    );
    expect(element.querySelector('.note')?.textContent).toContain('placeholder images');
  });

  it('should open the viewer from a tile and return focus to it on close', () => {
    const { fixture, element } = render(HOME.gallery);
    document.body.append(element);
    const tile = queryAll(element, '.gtile')[2]!;

    tile.click();
    fixture.detectChanges();
    expect(element.querySelector('app-lightbox .lbcap')?.textContent).toBe(
      'Hands striking a drum head · 3 of 7',
    );

    element.querySelector<HTMLButtonElement>('.lbx')!.click();
    fixture.detectChanges();
    expect(element.querySelector('app-lightbox')).toBeNull();
    expect(document.activeElement).toBe(tile);
    element.remove();
  });

  it('should wrap around when stepping past either end', () => {
    const { model } = render(HOME.gallery);

    model.show(0);
    model.previous();
    expect(model.openIndex()).toBe(6);
    model.next();
    expect(model.openIndex()).toBe(0);
    model.close();
    model.next();
    expect(model.openIndex()).toBeNull();
  });

  it('should render nothing until the heading has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});
