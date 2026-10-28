import { SHOW_FORMATS_FIXTURE } from '@shared/testing/fixtures';
import { ShowSpotlightModel } from './show-spotlight.model';

describe('ShowSpotlightModel', () => {
  it('should build the spotlight from the featured format', () => {
    const spotlight = ShowSpotlightModel.from(SHOW_FORMATS_FIXTURE);

    expect(spotlight?.eyebrow).toBe('Classical concerts');
    expect(spotlight?.title).toBe('An evening of Hindustani classical rhythm.');
    expect(spotlight?.image.src).toBe('/images/shows/classical-tabla.svg');
    expect(spotlight?.book).toMatchObject({ route: '/', fragment: 'contact' });
    expect(spotlight?.watch.route).toBe('/videos');
  });

  it('should have no spotlight when no format is featured', () => {
    const formats = SHOW_FORMATS_FIXTURE.map((format) => ({ ...format, featured: false }));

    expect(ShowSpotlightModel.from(formats)).toBeNull();
  });

  it('should list the other formats in order', () => {
    expect(ShowSpotlightModel.others(SHOW_FORMATS_FIXTURE).map((format) => format.title)).toEqual(
      SHOW_FORMATS_FIXTURE.slice(1).map((format) => format.title),
    );
  });
});
