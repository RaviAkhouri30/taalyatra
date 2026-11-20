import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { SectionPanel } from '../models/section-panel.enum';
import { SectionPartsPipe } from './section-parts.pipe';

const field = (key: string) => ({ key, label: key, kind: FieldKind.Text }) as const;
const section: IEditorSection = {
  id: 's',
  title: 'S',
  path: ContentPath.SiteTheme,
  anchor: PageAnchor.Top,
  fields: [field('a'), field('b'), field('c')],
};

describe('SectionPartsPipe', () => {
  const pipe = new SectionPartsPipe();
  const keys = (parts: ReturnType<SectionPartsPipe['transform']>) =>
    parts.map((part) => [part.panel, part.fields.map((entry) => entry.key)]);

  it('should keep a card without panels as one part', () => {
    expect(keys(pipe.transform(section))).toEqual([[null, ['a', 'b', 'c']]]);
  });

  it('should put each panel above the fields after the one it follows', () => {
    const parts = pipe.transform({
      ...section,
      panels: [
        { panel: SectionPanel.ThemePresets, after: null },
        { panel: SectionPanel.ThemeContrast, after: 'a' },
        { panel: SectionPanel.ThemeReset, after: 'c' },
      ],
    });

    expect(keys(parts)).toEqual([
      [SectionPanel.ThemePresets, ['a']],
      [SectionPanel.ThemeContrast, ['b', 'c']],
      [SectionPanel.ThemeReset, []],
    ]);
  });
});
