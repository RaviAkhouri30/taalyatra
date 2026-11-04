import { TestBed } from '@angular/core/testing';
import { LocalStoreService } from '@core/services/local-store.service';
import {
  EditorNavService,
  NAV_COLLAPSED_STORAGE_KEY,
  PREVIEW_HIDDEN_STORAGE_KEY,
} from './editor-nav.service';

describe('EditorNavService', () => {
  function create(stored: string | null = null) {
    const set = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        EditorNavService,
        { provide: LocalStoreService, useValue: { get: () => stored, set } },
      ],
    });
    return { nav: TestBed.inject(EditorNavService), set };
  }

  it.each([
    [null, false],
    ['0', false],
    ['1', true],
  ])('should start from what was remembered: %s', (stored, collapsed) => {
    expect(create(stored).nav.collapsed()).toBe(collapsed);
  });

  it('should remember each change to the panel', () => {
    const { nav, set } = create();

    nav.toggleCollapsed();
    expect(nav.collapsed()).toBe(true);
    expect(set).toHaveBeenLastCalledWith(NAV_COLLAPSED_STORAGE_KEY, '1');

    nav.toggleCollapsed();
    expect(nav.collapsed()).toBe(false);
    expect(set).toHaveBeenLastCalledWith(NAV_COLLAPSED_STORAGE_KEY, '0');
  });

  it('should start with the menu closed, even when the panel was left open', () => {
    expect(create('0').nav.drawerOpen()).toBe(false);
  });

  it('should open and close the menu without remembering it', () => {
    const { nav, set } = create();

    nav.toggleDrawer();
    expect(nav.drawerOpen()).toBe(true);
    nav.closeDrawer();

    expect(nav.drawerOpen()).toBe(false);
    expect(set).not.toHaveBeenCalled();
  });

  it('should show the preview unless it was hidden before', () => {
    expect(create().nav.previewHidden()).toBe(false);
  });

  it('should start with the preview hidden when that was remembered', () => {
    expect(create('1').nav.previewHidden()).toBe(true);
  });

  it('should remember each change to the preview', () => {
    const { nav, set } = create();

    nav.togglePreview();
    expect(nav.previewHidden()).toBe(true);
    expect(set).toHaveBeenLastCalledWith(PREVIEW_HIDDEN_STORAGE_KEY, '1');

    nav.togglePreview();
    expect(nav.previewHidden()).toBe(false);
    expect(set).toHaveBeenLastCalledWith(PREVIEW_HIDDEN_STORAGE_KEY, '0');
  });
});
