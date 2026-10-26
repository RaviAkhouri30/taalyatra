import { OverlayStateService } from './overlay-state.service';

describe('OverlayStateService', () => {
  it('should report whether a floating panel is open', () => {
    const overlay = new OverlayStateService();

    expect(overlay.panelOpen()).toBe(false);
    overlay.setPanelOpen(true);
    expect(overlay.panelOpen()).toBe(true);
  });
});
