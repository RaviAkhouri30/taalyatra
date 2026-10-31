import { TestBed } from '@angular/core/testing';
import fakeDb from '@core/backends/fake/fake-db.json';
import { layoutStub, provideEditorTesting, provideLayout } from '../../testing/editor-testing';
import PublishPageComponent from './publish-page.component';

describe('PublishPageComponent', () => {
  function render(seed: Parameters<typeof provideEditorTesting>[0] = {}) {
    const testing = provideEditorTesting(seed);
    TestBed.configureTestingModule({
      providers: [...testing.providers, provideLayout(layoutStub())],
    });
    const fixture = TestBed.createComponent(PublishPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (candidate) =>
          (candidate.getAttribute('aria-label') ?? candidate.textContent.trim()) === name,
      );
    return { fixture, element, button };
  }

  it('should say everything is published when there are no drafts', () => {
    const { element } = render();

    expect(element.textContent).toContain('Everything is published.');
    expect(element.textContent).toContain('Nothing published from the editor yet.');
  });

  it('should list a draft with its warnings and confirm before publishing', () => {
    const { fixture, element, button } = render({
      'drafts/home__offer': {
        path: 'home/offer',
        content: fakeDb.home.offer,
        savedAt: '2026-10-31T09:00:00.000Z',
      },
    });

    expect(element.querySelector('.pp-list b')?.textContent).toBe('Offer section');
    expect(element.querySelector('.pp-issues h3')?.textContent).toBe('Worth a look');
    button('Publish changes')?.click();
    fixture.detectChanges();

    expect(element.querySelector('#pp-confirm-text')?.textContent).toContain(
      'Publish 1 changed document?',
    );
    expect(button('Yes, publish')).toBeDefined();
  });

  it('should block publishing and list the errors', () => {
    const { element, button } = render({
      'drafts/home__hero': {
        path: 'home/hero',
        content: { ...fakeDb.home.hero, title: '' },
        savedAt: 'x',
      },
    });

    expect(element.querySelector('.pp-issues--error')?.textContent).toContain(
      'Hero · Headline, first line',
    );
    expect(button('Publish changes')?.disabled).toBe(true);
  });

  it('should confirm before undoing a publish', () => {
    const { fixture, element, button } = render({
      'publishes/2026-10-30T10-00-00-000Z': {
        publishedAt: '2026-10-30T10:00:00.000Z',
        changed: ['home/hero'],
        before: { 'home/hero': fakeDb.home.hero },
      },
    });

    button('Undo the publish of 30 Oct 2026, 3:30 pm')?.click();
    fixture.detectChanges();

    expect(element.textContent).toContain('Replace your draft of these');
    expect(button('Restore')).toBeDefined();
  });
});
