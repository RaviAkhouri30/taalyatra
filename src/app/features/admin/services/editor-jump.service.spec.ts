import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EditorJumpService } from './editor-jump.service';

describe('EditorJumpService', () => {
  const navigate = vi.fn(() => Promise.resolve(true));
  const scroll = vi.fn();

  function setUp(url: string) {
    navigate.mockClear();
    document.body.innerHTML = '<section id="card-hero"><input id="field-hero-title" /></section>';
    scroll.mockClear();
    Element.prototype.scrollIntoView = scroll;
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { url, navigate } }],
    });
    return TestBed.inject(EditorJumpService);
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should open another tab at the field', () => {
    setUp('/admin/offer').jump('/admin/hero', 'field-hero-title');

    expect(navigate).toHaveBeenCalledWith(['/admin/hero'], { fragment: 'field-hero-title' });
  });

  it('should scroll to a field on this tab and put the cursor in it', () => {
    setUp('/admin/hero#card-hero').jump('/admin/hero', 'field-hero-title');

    expect(navigate).not.toHaveBeenCalled();
    expect(document.activeElement?.id).toBe('field-hero-title');
  });

  it('should fall back to the card when the field isn’t showing', () => {
    const jumper = setUp('/admin/hero');

    jumper.reveal('field-hero-gone', 'card-hero');

    expect(scroll).toHaveBeenCalled();
    expect(document.activeElement?.id).not.toBe('card-hero');
  });
});
