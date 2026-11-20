import { TestBed } from '@angular/core/testing';
import fakeDb from '@core/backends/fake/fake-db.json';
import {
  layoutStub,
  provideEditorTesting,
  provideLayout,
  provideSignedIn,
} from '../../testing/editor-testing';
import PublishPageComponent from './publish-page.component';

describe('PublishPageComponent', () => {
  function render(
    seed: Parameters<typeof provideEditorTesting>[0] = {},
    user?: { uid: string; email: string },
  ) {
    const testing = provideEditorTesting(seed);
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        ...(user ? provideSignedIn(user) : []),
        provideLayout(layoutStub()),
      ],
    });
    const fixture = TestBed.createComponent(PublishPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (candidate) =>
          (candidate.getAttribute('aria-label') ?? candidate.textContent.trim()) === name,
      );
    return { fixture, element, button, testing };
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

    expect(element.querySelector('.pp-list b')?.textContent).toBe('Offer · Offer section');
    expect(element.querySelector('.pp-issues h3')?.textContent).toMatch(/^Worth a look \(\d+\)$/u);
    expect(element.querySelector('.pp-issues a')?.getAttribute('href')).toMatch(
      /^\/admin\/offer#card-/u,
    );
    button('Publish changes')?.click();
    fixture.detectChanges();

    expect(element.querySelector('#pp-confirm-text')?.textContent).toContain('Publish 1 change?');
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

  const publishes = {
    'publishes/2026-10-30T10-00-00-000Z': {
      publishedAt: '2026-10-30T10:00:00.000Z',
      changed: ['home/hero'],
      before: { 'home/hero': fakeDb.home.hero },
    },
    'publishes/2026-10-31T09-00-00-000Z': {
      publishedAt: '2026-10-31T09:00:00.000Z',
      changed: ['home/hero'],
      before: { 'home/hero': { ...fakeDb.home.hero, title: 'Between' } },
    },
  };

  it('should warn that later publishes are replaced too, and offer a backup first', () => {
    const { fixture, element, button } = render(publishes);

    button('Go back to before the publish of 30 Oct 2026, 3:30 pm')?.click();
    fixture.detectChanges();

    expect(element.textContent).toContain('Anything published after it will be replaced too');
    expect(button('Download a backup first')).toBeDefined();
    expect(button('Go back')).toBeDefined();
  });

  it('should leave out the later-publishes warning for the newest publish', () => {
    const { fixture, element, button } = render(publishes);

    button('Go back to before the publish of 31 Oct 2026, 2:30 pm')?.click();
    fixture.detectChanges();

    expect(element.textContent).toContain('Going back replaces what’s on the website');
    expect(element.textContent).not.toContain('Anything published after it');
  });

  it('should go back, and close the question, when confirmed', () => {
    const { fixture, element, button, testing } = render(publishes);
    button('Go back to before the publish of 30 Oct 2026, 3:30 pm')?.click();
    fixture.detectChanges();

    button('Go back')?.click();
    fixture.detectChanges();

    expect(testing.store.documents.get('drafts/home__hero')).toMatchObject({
      content: fakeDb.home.hero,
    });
    expect(element.textContent).not.toContain('Going back replaces');
  });

  it('should make a backup from the question, or cancel it', () => {
    const { fixture, element, button, testing } = render(publishes);
    button('Go back to before the publish of 30 Oct 2026, 3:30 pm')?.click();
    fixture.detectChanges();

    button('Download a backup first')?.click();
    button('Cancel')?.click();
    fixture.detectChanges();

    expect(testing.files.downloads).toHaveLength(1);
    expect(element.textContent).not.toContain('Going back replaces');
  });

  it('should show the backups card', () => {
    const { element } = render();

    expect(element.querySelector('#backups')?.textContent).toContain('No backup yet');
  });

  it('should show a manager who changed what, with a note for what needs approval', () => {
    const manager = { uid: 'manager', email: 'm@b.co' };
    const { fixture, element, button } = render(
      {
        'roles/manager': { email: manager.email, pages: {}, uploads: true, addedAt: 'x' },
        'drafts/home__hero': {
          path: 'home/hero',
          content: fakeDb.home.hero,
          savedAt: 'x',
          savedBy: manager.uid,
        },
        'drafts/home__offer': { path: 'home/offer', content: fakeDb.home.offer, savedAt: 'x' },
      },
      manager,
    );
    const ticks = element.querySelectorAll<HTMLInputElement>('.pp-tick input');
    const authors = Array.from(element.querySelectorAll('.pp-tick small')).map((small) =>
      small.textContent.replace(/\s+/gu, ' ').trim(),
    );

    expect([...ticks].map((tick) => tick.checked)).toEqual([true, false]);
    expect(authors[0]).toMatch(/^changed by you, .* · needs approval$/u);
    expect(authors[1]).toMatch(/^changed by the owner, /u);
    expect(button('Undo the changes to Hero')).toBeDefined();
    expect(button('Undo the changes to Offer · Offer section')).toBeUndefined();
    expect(element.querySelector('.pp-note textarea')).not.toBeNull();
    expect(button('Send for approval')).toBeDefined();
    expect(element.querySelector('app-backup-panel')).toBeNull();

    ticks[0]!.checked = false;
    ticks[0]!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.querySelector('.pp-note')).toBeNull();
  });
});
