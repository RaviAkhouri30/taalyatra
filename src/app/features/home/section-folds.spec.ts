import { FoldMode } from '@shared/enums/fold-mode.enum';
import { HomeSection } from '@shared/enums/home-section.enum';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { sectionFolds } from './section-folds';

describe('sectionFolds', () => {
  it('should use each section’s default when the owner hasn’t chosen', () => {
    const folds = sectionFolds(SiteVisibility.allVisible);

    expect(folds[HomeSection.Philosophy]).toBe(FoldMode.Always);
    expect(folds[HomeSection.Faq]).toBe(FoldMode.Always);
    expect(folds[HomeSection.Cities]).toBe(FoldMode.Phone);
    expect(folds[HomeSection.Gallery]).toBe(FoldMode.Never);
  });

  it('should follow the owner’s choice for a foldable section', () => {
    const folds = sectionFolds(new SiteVisibility({ folded: { faq: FoldMode.Never } }));

    expect(folds[HomeSection.Faq]).toBe(FoldMode.Never);
  });

  it('should ignore an unknown mode, and a choice for a section that can’t fold', () => {
    const folds = sectionFolds(
      new SiteVisibility({
        folded: { faq: 'sometimes', gallery: FoldMode.Always } as never,
      }),
    );

    expect(folds[HomeSection.Faq]).toBe(FoldMode.Always);
    expect(folds[HomeSection.Gallery]).toBe(FoldMode.Never);
  });
});
