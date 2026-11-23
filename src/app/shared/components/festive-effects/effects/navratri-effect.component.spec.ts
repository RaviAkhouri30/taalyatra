import { FESTIVE_BADGE_PARTICLES, FESTIVE_PARTICLES } from '@shared/constants/festive.constants';
import { renderEffect } from '@shared/testing/render-effect';
import { NavratriEffectComponent } from './navratri-effect.component';

describe('NavratriEffectComponent', () => {
  it('should draw every particle across the band, hidden from screen readers', () => {
    const layer = renderEffect(NavratriEffectComponent, false);

    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(layer.querySelectorAll('.fp')).toHaveLength(FESTIVE_PARTICLES.length);
  });

  it('should draw fewer, around the badge, when compact', () => {
    const layer = renderEffect(NavratriEffectComponent, true);

    expect(layer.classList).toContain('fx--compact');
    expect(layer.querySelectorAll('.fp')).toHaveLength(FESTIVE_BADGE_PARTICLES.length);
  });
});
