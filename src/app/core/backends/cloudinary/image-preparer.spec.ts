import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ImagePreparer } from './image-preparer';

describe('ImagePreparer', () => {
  const output = new Blob(['drawn'], { type: 'image/jpeg' });
  const drawImage = vi.fn();
  const close = vi.fn();
  let toBlob: ReturnType<typeof vi.fn>;
  let canvas: { width: number; height: number; getContext: () => unknown; toBlob: unknown };

  function photo(type = 'image/jpeg'): File {
    return new File(['bytes with a location'], 'photo', { type });
  }

  function create(): ImagePreparer {
    return TestBed.runInInjectionContext(() => new ImagePreparer());
  }

  function decodeAs(width: number, height: number): void {
    vi.stubGlobal('createImageBitmap', () =>
      Promise.resolve({ width, height, close } as unknown as ImageBitmap),
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    toBlob = vi.fn((done: (blob: Blob | null) => void) => {
      done(output);
    });
    canvas = { width: 0, height: 0, getContext: () => ({ drawImage }), toBlob };
    vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLCanvasElement);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should shrink a photo wider than the limit and keep its shape', async () => {
    decodeAs(4000, 3000);

    await expect(firstValueFrom(create().prepare(photo()))).resolves.toBe(output);

    expect(canvas).toMatchObject({ width: 2400, height: 1800 });
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 2400, 1800);
    expect(close).toHaveBeenCalled();
  });

  it('should redraw a small photo at its own size, so its metadata still goes', async () => {
    decodeAs(800, 600);

    await expect(firstValueFrom(create().prepare(photo()))).resolves.toBe(output);

    expect(canvas).toMatchObject({ width: 800, height: 600 });
  });

  it.each([
    ['image/png', 'image/png'],
    ['image/webp', 'image/png'],
    ['image/jpeg', 'image/jpeg'],
    ['image/heic', 'image/jpeg'],
  ])('should store %s as %s', async (input, stored) => {
    decodeAs(800, 600);

    await firstValueFrom(create().prepare(photo(input)));

    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), stored, 0.9);
  });

  it('should send the file as it is when the browser cannot decode it', async () => {
    vi.stubGlobal('createImageBitmap', () => Promise.reject(new Error('No HEIC here')));
    const heic = photo('image/heic');

    await expect(firstValueFrom(create().prepare(heic))).resolves.toBe(heic);
  });

  it('should send the file as it is when the browser cannot encode it', async () => {
    decodeAs(800, 600);
    toBlob.mockImplementation((done: (blob: Blob | null) => void) => {
      done(null);
    });
    const file = photo();

    await expect(firstValueFrom(create().prepare(file))).resolves.toBe(file);
  });
});
