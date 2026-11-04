import { TestBed } from '@angular/core/testing';
import { type FormControl } from '@angular/forms';
import { IMediaService } from '@core/interfaces/i-media-service';
import { type IImage } from '@shared/interfaces/i-image';
import { buildControl } from '../../forms/schema-control.factory';
import { IMAGE_ASPECT } from '../../models/image-aspect.constants';
import { image as imageField } from '../../schemas/schema-fields';
import { provideEditorTesting } from '../../testing/editor-testing';
import { ImageFieldComponent } from './image-field.component';

describe('ImageFieldComponent', () => {
  const field = imageField('photo', 'Photo', IMAGE_ASPECT.team);
  const local = { src: '/images/team/1.webp', alt: 'Asha', width: 600, height: 600 };
  const uploaded = { src: 'v1/taal-yatra/media/abc', alt: 'Asha', width: 1000, height: 500 };
  const dto = {
    publicId: 'taal-yatra/media/abc',
    version: 1,
    width: 1000,
    height: 500,
    bytes: 10,
    format: 'jpg',
    name: 'photo.jpg',
    description: 'From the library',
    uploadedAt: '2026-11-03T10:00:00.000Z',
  };

  async function render(value: IImage | undefined, seed = { 'media/abc': dto }) {
    TestBed.configureTestingModule({
      providers: [
        ...provideEditorTesting(seed).providers,
        { provide: IMediaService, useValue: { upload: vi.fn(), remove: vi.fn() } },
      ],
    });
    const control = buildControl(field, value) as FormControl<IImage>;
    const fixture = TestBed.createComponent(ImageFieldComponent);
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('fieldId', 'f');
    fixture.componentRef.setInput('describedBy', 'f-error');
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (candidate) => candidate.textContent.trim() === name,
      );
    return { fixture, control, element, button };
  }

  it('should show the image and describe it for screen readers', async () => {
    const { element } = await render(local);

    expect(element.querySelector('.if-label')?.textContent).toBe('Photo');
    expect(element.querySelector('img')?.alt).toBe('Asha');
    expect(element.querySelector('textarea')?.value).toBe('Asha');
    expect(element.querySelector('textarea')?.getAttribute('aria-describedby')).toBe('f-error');
    expect(element.querySelector('label')?.htmlFor).toBe('f');
  });

  it('should set the frame to the slot shape', async () => {
    const { element } = await render(local);

    expect(element.style.getPropertyValue('--if-aspect')).toBe('1');
  });

  it('should say when no photo has been chosen', async () => {
    const { element, control } = await render(undefined);

    expect(element.querySelector('.if-empty')?.textContent).toBe('No photo yet');
    expect(control.errors).toEqual({ imageMissing: true, imageDescription: true });
  });

  it('should store a typed description and mark the form changed', async () => {
    const { element, control } = await render(local);
    const area = element.querySelector('textarea')!;

    area.value = 'Asha at a circle';
    area.dispatchEvent(new Event('input'));

    expect(control.value).toEqual({ ...local, alt: 'Asha at a circle' });
    expect(control.dirty).toBe(true);
  });

  it('should not offer a crop for a local image', async () => {
    const { button } = await render(local);

    expect(button('Crop')).toBeUndefined();
  });

  it('should open and close the picker, and show that it is open', async () => {
    const { fixture, element, button } = await render(local);

    button('Choose or upload')?.click();
    await fixture.whenStable();
    expect(element.querySelector('app-media-picker')).not.toBeNull();
    expect(button('Choose or upload')?.getAttribute('aria-expanded')).toBe('true');

    button('Choose or upload')?.click();
    await fixture.whenStable();
    expect(element.querySelector('app-media-picker')).toBeNull();
  });

  it('should use a chosen photo, keeping a description already typed', async () => {
    const { fixture, element, button, control } = await render(local);

    button('Choose or upload')?.click();
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('[aria-label="Choose photo.jpg"]')?.click();
    await fixture.whenStable();

    expect(control.value).toEqual({ ...uploaded });
    expect(element.querySelector('app-media-picker')).toBeNull();
  });

  it('should offer the library description when none has been typed', async () => {
    const { fixture, element, button, control } = await render(undefined);

    button('Choose or upload')?.click();
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('[aria-label="Choose photo.jpg"]')?.click();
    await fixture.whenStable();

    expect(control.value.alt).toBe('From the library');
  });

  it('should store the crop for this use, with the cropped size', async () => {
    const { fixture, element, button, control } = await render(uploaded);

    button('Crop')?.click();
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.ic-apply')?.click();
    await fixture.whenStable();

    expect(control.value).toEqual({
      src: 'c_crop,x_250,y_0,w_500,h_500/v1/taal-yatra/media/abc',
      alt: 'Asha',
      width: 500,
      height: 500,
    });
    expect(element.querySelector('app-image-crop')).toBeNull();
  });

  it('should leave the image alone when the crop is cancelled', async () => {
    const { fixture, button, control } = await render(uploaded);

    button('Crop')?.click();
    await fixture.whenStable();
    button('Cancel')?.click();
    await fixture.whenStable();

    expect(control.value).toEqual(uploaded);
    expect(control.dirty).toBe(false);
  });

  it('should close the crop tool when Crop is pressed again', async () => {
    const { fixture, element, button } = await render(uploaded);

    button('Crop')?.click();
    await fixture.whenStable();
    button('Crop')?.click();
    await fixture.whenStable();

    expect(element.querySelector('app-image-crop')).toBeNull();
  });

  it('should explain when the file is no longer in the library', async () => {
    const { fixture, element, button } = await render(uploaded, {} as never);

    button('Crop')?.click();
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('isn’t in the library');
  });
});
