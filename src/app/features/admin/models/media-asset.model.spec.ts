import { type IMediaAssetDto } from './i-media-asset';
import { MediaAsset } from './media-asset.model';

describe('MediaAsset', () => {
  const dto: IMediaAssetDto = {
    publicId: 'taal-yatra/media/abc-123',
    version: 123,
    width: 2400,
    height: 1800,
    bytes: 5000,
    format: 'jpg',
    name: 'photo.jpg',
    description: '',
    uploadedAt: '2026-11-03T10:00:00.000Z',
  };

  it('should use the last part of the file id as its id', () => {
    expect(new MediaAsset(dto).id).toBe('abc-123');
  });

  it('should build the versioned source images are stored with', () => {
    expect(new MediaAsset(dto).src).toBe('v123/taal-yatra/media/abc-123');
  });

  it('should describe its size for the library', () => {
    expect(new MediaAsset({ ...dto, bytes: 2_621_440 }).sizeLabel).toBe('2400 × 1800 · 2.5 MB');
  });

  it('should rebuild from stored fields when they are complete', () => {
    expect(MediaAsset.fromFields({ ...dto })?.dto.publicId).toBe(dto.publicId);
  });

  it.each([
    ['a missing field', { ...dto, name: undefined }],
    ['a wrong type', { ...dto, width: '2400' }],
  ])('should ignore stored fields when they have %s', (_case, fields) => {
    expect(MediaAsset.fromFields(fields)).toBeNull();
  });
});
