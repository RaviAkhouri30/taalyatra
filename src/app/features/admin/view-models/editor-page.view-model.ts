import { Injectable, inject, signal } from '@angular/core';
import { type AbstractControl, type FormRecord } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  concatMap,
  debounceTime,
  exhaustMap,
  forkJoin,
  from,
  map,
  merge,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { ViewModel } from '@shared/base/view-model';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { buildFormGroup } from '../forms/schema-control.factory';
import { sectionContent, writeSection } from '../forms/schema-value';
import { type ContentPath } from '../models/content-path.enum';
import { formatMoment } from '../models/editor-dates';
import {
  AUTOSAVE_DEBOUNCE_MS,
  routeTab,
  PREVIEW_FOLLOW_DEBOUNCE_MS,
} from '../models/editor-nav.constants';
import { type EditorTab } from '../models/editor-tab.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type IEditorTabSchema, tabSchema } from '../schemas/editor-tabs';
import { DraftService } from '../services/draft.service';
import { type ISafetyCopy, SafetyCopyService } from '../services/safety-copy.service';
import { EditorLayoutViewModel } from './editor-layout.view-model';

/** One card on an editor page: its schema and its form. */
export interface IEditorSectionForm {
  readonly section: IEditorSection;
  readonly form: FormRecord<AbstractControl>;
  /** The id of the card's heading, which names the card. */
  readonly titleId: string;
  /** Prefix for the ids of the card's fields (kept apart from heading ids). */
  readonly fieldPrefix: string;
}

/** Changes kept on this device that never reached the draft (0016 V2). */
export interface IUnsavedOffer {
  /** When the newest of them was made, e.g. "18 Nov 2026, 10:42 am". */
  readonly when: string;
  readonly copies: readonly ISafetyCopy[];
}

/** What the owner is told about changes kept on this device. */
export const SAFETY_COPY_MESSAGES = {
  restored: 'Your changes are back, and saved in your draft.',
  failed: 'Couldn’t bring them back. Check your connection and try again.',
} as const;

/** An editor page: the tab and its cards. */
export interface IEditorPage {
  readonly tab: IEditorTabSchema;
  readonly sections: readonly IEditorSectionForm[];
}

/**
 * One editor tab (0008 D3): loads each document it edits (draft, else live), builds a form per
 * section from its schema, and autosaves changes to the document's draft.
 */
@Injectable()
export class EditorPageViewModel extends ViewModel<IEditorPage> {
  /** The section the owner is working in, where the preview scrolls. */
  public readonly activeAnchor = signal(PageAnchor.Top);
  /** Bumped after each save, which reloads the preview. */
  public readonly previewVersion = signal(0);
  /** Phones show the form or the preview; this switches between them. */
  public readonly previewOpen = signal(false);
  /** Changes made on this device that weren't saved, offered back (0016 V2). */
  public readonly unsaved = signal<IUnsavedOffer | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly drafts = inject(DraftService);
  private readonly layout = inject(EditorLayoutViewModel);
  private readonly safety = inject(SafetyCopyService);
  private readonly toasts = inject(ToastService);
  private readonly restoreRequests = new Subject<IUnsavedOffer>();
  /** The documents as last loaded or saved, by path; edits are merged into them. */
  private readonly documents = new Map<string, DocumentFields>();
  /** A change is waiting for its debounce or its save. */
  private readonly pending = signal(false);
  /** Counts changes, so a save can tell whether a newer change arrived while it ran. */
  private changeCount = 0;
  /** Cards the owner has scrolled to. */
  private readonly scrolledTo = new Subject<PageAnchor>();

  /** The owner is working in `section`: the preview moves there now. */
  public focus(section: IEditorSection): void {
    this.activeAnchor.set(section.anchor);
  }

  /** The owner has scrolled to `section`: the preview follows once scrolling pauses. */
  public follow(section: IEditorSection): void {
    this.scrolledTo.next(section.anchor);
  }

  public togglePreview(): void {
    this.previewOpen.update((open) => !open);
  }

  /** Puts the changes kept on this device back into the draft, and the page reloads with them. */
  public restoreUnsaved(): void {
    const offer = this.unsaved();
    if (offer) {
      this.restoreRequests.next(offer);
    }
  }

  /** Throws away the changes kept on this device. */
  public discardUnsaved(): void {
    for (const copy of this.unsaved()?.copies ?? []) {
      this.safety.clear(copy.path);
    }
    this.unsaved.set(null);
  }

  /** @returns Whether leaving now could lose a change (still saving, or the save failed). */
  public hasUnsavedChanges(): boolean {
    return this.pending() || this.layout.failed();
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(
      // debounceTime: a quick scroll past several cards moves the preview once, to where it stops.
      this.scrolledTo.pipe(
        debounceTime(PREVIEW_FOLLOW_DEBOUNCE_MS),
        tap((anchor) => {
          this.activeAnchor.set(anchor);
        }),
      ),
      // exhaustMap: a second press while the copies are being saved is ignored.
      this.restoreRequests.pipe(exhaustMap((offer) => this.restoreCopies(offer))),
    );
  }

  protected override attachViewHandler(): Observable<unknown> {
    const tab = tabSchema(this.routeTab());
    if (tab === undefined) {
      return EMPTY;
    }
    const paths = [...new Set(tab.sections.map((section) => section.path))];
    return this.layout.contentResets$.pipe(
      startWith(undefined),
      // switchMap: a reset replaces the page and its autosave with freshly read ones.
      switchMap(() => this.loadPage(tab, paths)),
    );
  }

  private loadPage(tab: IEditorTabSchema, paths: readonly ContentPath[]): Observable<unknown> {
    // forkJoin: every document the tab edits, read in parallel, before any form is built.
    return forkJoin(paths.map((path) => this.drafts.document(path))).pipe(
      map((documents) => {
        paths.forEach((path, index) => this.documents.set(path, documents.at(index) ?? {}));
        this.unsaved.set(this.findUnsaved(paths));
        return this.buildPage(tab);
      }),
      tap((page) => {
        this.pending.set(false);
        this.setData(page);
        this.activeAnchor.set(tab.sections[0]?.anchor ?? PageAnchor.Top);
      }),
      // switchMap: the page is built once; from then on, follow its changes.
      switchMap((page) => this.autosave(page, paths)),
    );
  }

  private routeTab(): EditorTab {
    return routeTab(this.route.snapshot.data);
  }

  private buildPage(tab: IEditorTabSchema): IEditorPage {
    return {
      tab,
      sections: tab.sections.map((section) => ({
        section,
        form: buildFormGroup(
          section.fields,
          sectionContent(section, this.documents.get(section.path)),
        ),
        // Separate namespaces: section "hero" + field "title" must not reuse the heading's id.
        titleId: `card-${section.id}`,
        fieldPrefix: `field-${section.id}`,
      })),
    };
  }

  private autosave(page: IEditorPage, paths: readonly ContentPath[]): Observable<unknown> {
    const changes = page.sections.map(({ section, form }) =>
      form.valueChanges.pipe(
        tap(() => {
          this.changeCount += 1;
          this.pending.set(true);
          // On this device first: if the save never happens, the change can be offered back.
          this.safety.keep(section.path, this.contentOf(page, section.path));
          // At once, not after the debounce: "Saved" would be untrue while a change waits.
          this.layout.reportSaving();
        }),
        debounceTime(AUTOSAVE_DEBOUNCE_MS),
        map(() => section.path),
      ),
    );
    // A retry saves every document on the page again: a draft save is idempotent.
    const retries = this.layout.retries$.pipe(switchMap(() => from(paths)));
    // concatMap: saves run one at a time, in order, so a slow earlier save can't overwrite a later.
    return merge(...changes, retries).pipe(concatMap((path) => this.save(page, path)));
  }

  /** @returns The whole document as the page's forms have it now. */
  private contentOf(page: IEditorPage, path: ContentPath): DocumentFields {
    return page.sections
      .filter(({ section }) => section.path === path)
      .reduce<DocumentFields>(
        (document, { section, form }) => writeSection(section, document, form.getRawValue()),
        this.documents.get(path) ?? {},
      );
  }

  private findUnsaved(paths: readonly ContentPath[]): IUnsavedOffer | null {
    const copies = this.safety.unsaved(paths, this.documents);
    const newest = copies
      .map((copy) => copy.savedAt)
      .sort((first, second) => first.localeCompare(second))
      .at(-1);
    return newest === undefined ? null : { when: formatMoment(newest), copies };
  }

  private restoreCopies(offer: IUnsavedOffer): Observable<unknown> {
    const contents = new Map(offer.copies.map((copy) => [copy.path, copy.content] as const));
    return this.drafts.saveAll(contents).pipe(
      tap(() => {
        offer.copies.forEach((copy) => {
          this.safety.clear(copy.path);
        });
        this.unsaved.set(null);
        this.toasts.show(SAFETY_COPY_MESSAGES.restored);
        // Reloads the page from the drafts, now holding the copies, and recounts them.
        this.layout.refreshChanges();
        this.layout.resetContent();
      }),
      // Long-lived: the copies stay on the device, and the owner can try again.
      catchError(() => {
        this.toasts.show(SAFETY_COPY_MESSAGES.failed, ToastTone.Error);
        return EMPTY;
      }),
    );
  }

  private save(page: IEditorPage, path: ContentPath): Observable<unknown> {
    const content = this.contentOf(page, path);
    this.layout.reportSaving();
    const savedThrough = this.changeCount;
    return this.drafts.save(path, content).pipe(
      tap(() => {
        this.documents.set(path, content);
        this.safety.clearIfSaved(path, content);
        // A change made during this save isn't in it: saying "Saved" would let the owner leave
        // and lose it. Its own save reports when it's done.
        if (savedThrough === this.changeCount) {
          this.pending.set(false);
          this.layout.reportSaved();
        }
        this.previewVersion.update((version) => version + 1);
      }),
      // The change stays in the form; the owner can retry, and the next change saves it too.
      catchError(() => {
        this.layout.reportFailed();
        return EMPTY;
      }),
    );
  }
}
