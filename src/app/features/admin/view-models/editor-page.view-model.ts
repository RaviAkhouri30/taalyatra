import { Injectable, inject, signal } from '@angular/core';
import { type AbstractControl, type FormRecord } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  EMPTY,
  type Observable,
  catchError,
  concatMap,
  debounceTime,
  forkJoin,
  from,
  map,
  merge,
  switchMap,
  tap,
} from 'rxjs';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { ViewModel } from '@shared/base/view-model';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { buildFormGroup } from '../forms/schema-control.factory';
import { mergeSchemaValue, readSchemaValue } from '../forms/schema-value';
import { type ContentPath } from '../models/content-path.enum';
import { AUTOSAVE_DEBOUNCE_MS, EDITOR_TAB_ROUTE_KEY } from '../models/editor-nav.constants';
import { EditorTab } from '../models/editor-tab.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type IEditorTabSchema, tabSchema } from '../schemas/editor-tabs';
import { DraftService } from '../services/draft.service';
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

  private readonly route = inject(ActivatedRoute);
  private readonly drafts = inject(DraftService);
  private readonly layout = inject(EditorLayoutViewModel);
  /** The documents as last loaded or saved, by path; edits are merged into them. */
  private readonly documents = new Map<string, DocumentFields>();
  /** A change is waiting for its debounce or its save. */
  private readonly pending = signal(false);

  public focus(section: IEditorSection): void {
    this.activeAnchor.set(section.anchor);
  }

  public togglePreview(): void {
    this.previewOpen.update((open) => !open);
  }

  /** @returns Whether leaving now could lose a change (still saving, or the save failed). */
  public hasUnsavedChanges(): boolean {
    return this.pending() || this.layout.failed();
  }

  protected override attachViewHandler(): Observable<unknown> {
    const tab = tabSchema(this.routeTab());
    if (tab === undefined) {
      return EMPTY;
    }
    const paths = [...new Set(tab.sections.map((section) => section.path))];
    // forkJoin: every document the tab edits, read in parallel, before any form is built.
    return forkJoin(paths.map((path) => this.drafts.document(path))).pipe(
      map((documents) => {
        paths.forEach((path, index) => this.documents.set(path, documents.at(index) ?? {}));
        return this.buildPage(tab);
      }),
      tap((page) => {
        this.setData(page);
        this.activeAnchor.set(tab.sections[0]?.anchor ?? PageAnchor.Top);
      }),
      // switchMap: the page is built once; from then on, follow its changes.
      switchMap((page) => this.autosave(page, paths)),
    );
  }

  private routeTab(): EditorTab {
    const value: unknown = new Map(Object.entries(this.route.snapshot.data)).get(
      EDITOR_TAB_ROUTE_KEY,
    );
    return Object.values(EditorTab).find((tab) => tab === value) ?? EditorTab.Offer;
  }

  private buildPage(tab: IEditorTabSchema): IEditorPage {
    return {
      tab,
      sections: tab.sections.map((section) => ({
        section,
        form: buildFormGroup(section.fields, this.documents.get(section.path)),
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
          this.pending.set(true);
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

  private save(page: IEditorPage, path: ContentPath): Observable<unknown> {
    const content = page.sections
      .filter(({ section }) => section.path === path)
      .reduce<DocumentFields>(
        (document, { section, form }) =>
          mergeSchemaValue(
            document,
            section.fields,
            readSchemaValue(section.fields, form.getRawValue()),
          ),
        this.documents.get(path) ?? {},
      );
    this.layout.reportSaving();
    return this.drafts.save(path, content).pipe(
      tap(() => {
        this.documents.set(path, content);
        this.pending.set(false);
        this.layout.reportSaved();
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
