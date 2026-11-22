import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { FEATURES } from './features.constants';
import { EditorTab } from './editor-tab.enum';

describe('FEATURES', () => {
  const anchors = new Set<string>(Object.values(PageAnchor));
  const tabs = new Set<string>(Object.values(EditorTab));

  it('should give every feature a unique id, a title and a sentence', () => {
    expect(new Set(FEATURES.map((feature) => feature.id)).size).toBe(FEATURES.length);
    for (const feature of FEATURES) {
      expect(feature.title.length).toBeGreaterThan(0);
      expect(feature.description).toMatch(/\.$/u);
    }
  });

  it('should point every site link at a page and section that exist', () => {
    const pages = [
      AppRoute.Home,
      AppRoute.Videos,
      AppRoute.Team,
      AppRoute.Shows,
      AppRoute.Achievements,
    ];
    for (const feature of FEATURES.filter((entry) => entry.site !== undefined)) {
      const [path, anchor] = (feature.site ?? '').split('#');
      expect(pages).toContain(path);
      expect(anchor === undefined || anchors.has(anchor)).toBe(true);
    }
  });

  it('should point every change link at an editor page that exists', () => {
    for (const feature of FEATURES) {
      if ('tab' in feature.change) {
        expect(tabs.has(feature.change.tab)).toBe(true);
      }
    }
  });
});
