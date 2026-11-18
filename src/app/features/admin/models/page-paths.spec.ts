import { ContentPath } from './content-path.enum';
import { EditorTab } from './editor-tab.enum';
import { PART_TABS, TABS_BY_PATH, changedPages } from './page-paths';

describe('page paths', () => {
  it('should know which page edits each document', () => {
    expect(TABS_BY_PATH.get(ContentPath.HomeHero)).toEqual([EditorTab.Hero]);
    expect(TABS_BY_PATH.get(ContentPath.ShowFormats)).toEqual([EditorTab.Shows]);
  });

  it('should split the site details into the parts that firestore.rules check', () => {
    const parts = PART_TABS.get(ContentPath.SiteConfig);

    expect(parts && Object.fromEntries(parts)).toEqual({
      brand: EditorTab.Business,
      promotion: EditorTab.Offer,
      contact: EditorTab.Contact,
      socials: EditorTab.Contact,
      copyrightYear: EditorTab.Contact,
    });
  });

  it('should name the page of a document no other page shares', () => {
    expect(changedPages(ContentPath.HomeHero, { title: 'x' }, null)).toEqual({
      tabs: [EditorTab.Hero],
      ownerOnly: false,
    });
  });

  it('should name only the pages whose parts of the site details changed', () => {
    const live = { brand: { name: 'A' }, promotion: { label: 'Diwali' } };

    expect(changedPages(ContentPath.SiteConfig, { ...live, brand: { name: 'B' } }, live)).toEqual({
      tabs: [EditorTab.Business],
      ownerOnly: false,
    });
  });

  it('should flag a change to a part no page edits as the owner’s only', () => {
    expect(changedPages(ContentPath.SiteConfig, { credit: 'x' }, {}).ownerOnly).toBe(true);
  });

  it('should flag a document no page edits as the owner’s only', () => {
    expect(changedPages('pages/secret', {}, null)).toEqual({ tabs: [], ownerOnly: true });
  });
});
