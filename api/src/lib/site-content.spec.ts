import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  type ITestKeys,
  NOW_MS,
  createTestKeys,
  fakeDependencies,
  restList,
  restText,
} from '../testing/api-testing.js';
import {
  CONTENT_MAX,
  CONTENT_TTL_MS,
  SiteContent,
  hiddenSections,
  siteText,
  wordsOf,
} from './site-content.js';

const HOME = {
  faq: {
    title: restText('Questions'),
    items: {
      arrayValue: {
        values: [{ mapValue: { fields: { q: restText('How long?'), a: restText('Two hours.') } } }],
      },
    },
  },
  experiences: {
    title: restText('Experiences'),
    image: { mapValue: { fields: { src: restText('v1/x.jpg'), alt: restText('A photo') } } },
  },
  offer: { title: restText('Diwali offer') },
  gallery: { title: restText('Photos') },
};
const CONFIG = {
  fields: {
    brand: { mapValue: { fields: { name: restText('Taal Yatra') } } },
    socials: restText('@taal'),
    contact: { mapValue: { fields: { phone: restText('+91 98765') } } },
  },
};
const hidden = (sections: Record<string, boolean>) => ({
  fields: {
    sections: {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(sections).map(([key, on]) => [key, { booleanValue: on }]),
        ),
      },
    },
  },
});

describe('site content (0025 V7)', () => {
  it('should keep words, not addresses, ids or pictures', () => {
    expect(
      wordsOf({
        mapValue: {
          fields: {
            title: restText('Drum'),
            url: restText('x'),
            link: restText('https://x'),
            path: restText('/videos'),
            empty: restText(' '),
          },
        },
      }),
    ).toEqual(['Drum']);
    expect(wordsOf({ integerValue: '3' })).toEqual([]);
  });

  it('should leave out an item the owner hid, keeping the rest (2.15.0)', () => {
    const question = (text: string, hidden: boolean) => ({
      mapValue: { fields: { question: restText(text), hidden: { booleanValue: hidden } } },
    });

    expect(
      wordsOf({
        arrayValue: { values: [question('Shown?', false), question('Hidden?', true)] },
      }),
    ).toEqual(['Shown?']);
  });

  it('should read the chosen sections, the show formats and the business, not the offer or the gallery', async () => {
    const text = siteText({
      home: await restList('home', HOME).json(),
      config: CONFIG,
      visibility: hidden({}),
      shows: await restList('showFormats', { '001': { title: restText('Corporate show') } }).json(),
    });

    expect(text).toContain('## faq\nQuestions\nHow long?\nTwo hours.');
    expect(text).toContain('## experiences\nExperiences');
    expect(text).toContain('## show formats\nCorporate show');
    expect(text).toContain('## business\nTaal Yatra\n+91 98765');
    for (const left of ['Diwali offer', 'Photos', 'v1/x.jpg', 'A photo', '@taal']) {
      expect(text).not.toContain(left);
    }
  });

  it('should leave out what the owner hid, shows with their formats', async () => {
    const text = siteText({
      home: await restList('home', HOME).json(),
      config: null,
      visibility: hidden({ faq: false, shows: false, experiences: true }),
      shows: await restList('showFormats', { '001': { title: restText('Corporate show') } }).json(),
    });

    expect(hiddenSections(hidden({ faq: false, shows: true }))).toEqual(new Set(['faq']));
    expect(text).not.toContain('Questions');
    expect(text).not.toContain('Corporate show');
    expect(text).toContain('Experiences');
  });

  it('should cut the text to what’s sent', () => {
    const long = { faq: { a: restText('x'.repeat(CONTENT_MAX * 2)) } };

    expect(
      siteText({
        home: { documents: [{ name: 'a/faq', fields: long.faq }] },
        config: null,
        visibility: null,
        shows: null,
      }),
    ).toHaveLength(CONTENT_MAX);
  });

  describe('SiteContent', () => {
    let test: ITestKeys;

    beforeAll(async () => {
      test = await createTestKeys();
    });

    function readPublic() {
      return vi.fn((url: string) =>
        Promise.resolve(
          url.includes('/home') ? restList('home', HOME) : new Response('{}', { status: 404 }),
        ),
      );
    }

    it('should read the site once, then keep it for 15 minutes', async () => {
      const read = readPublic();
      let now = NOW_MS;
      const deps = fakeDependencies(test.keys, { readPublic: read, now: () => now });
      const content = new SiteContent();

      await firstValueFrom(content.text(deps));
      await firstValueFrom(content.text(deps));
      expect(read).toHaveBeenCalledTimes(4);
      now += CONTENT_TTL_MS;
      await firstValueFrom(content.text(deps));

      expect(read).toHaveBeenCalledTimes(8);
    });

    it('should say the chat is unavailable when the home sections can’t be read', async () => {
      const deps = fakeDependencies(test.keys, {
        readPublic: vi.fn(() => Promise.reject(new Error('offline'))),
      });

      await expect(firstValueFrom(new SiteContent().text(deps))).rejects.toMatchObject({
        status: 503,
      });
    });
  });
});
