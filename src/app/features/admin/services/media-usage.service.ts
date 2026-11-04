import { Service, inject } from '@angular/core';
import { type Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { type MediaAsset } from '../models/media-asset.model';
import { imageUsesIn, replaceImage } from '../models/media-use';
import { ALL_SECTIONS } from '../schemas/editor-tabs';
import { DraftService } from './draft.service';

/**
 * Where uploaded images are used (D17). Worked out from the documents each time, so there are no
 * stored counts to fall out of step.
 */
@Service()
export class MediaUsageService {
  private readonly drafts = inject(DraftService);
  private readonly paths = [...new Set(ALL_SECTIONS.map((section) => section.path))];

  /**
   * @returns Where each image is used, by library id, in published documents and drafts both: a
   *   draft-only use still needs the file when it's published.
   */
  public usages(): Observable<ReadonlyMap<string, readonly string[]>> {
    // forkJoin: independent reads, all needed before anything can be said about an image.
    return forkJoin([
      forkJoin(this.paths.map((path) => this.drafts.live(path))),
      this.drafts.drafts(),
    ]).pipe(
      map(([live, drafts]) => {
        const labels = new Map<string, Set<string>>();
        const liveByPath = new Map(this.paths.map((path, index) => [path, live.at(index)]));
        for (const section of ALL_SECTIONS) {
          const versions = [liveByPath.get(section.path), drafts.get(section.path)?.content];
          for (const { id, label } of versions.flatMap((doc) => imageUsesIn(section, doc))) {
            labels.set(id, (labels.get(id) ?? new Set<string>()).add(label));
          }
        }
        return new Map([...labels].map(([id, found]) => [id, [...found]]));
      }),
    );
  }

  /**
   * Puts a new file everywhere the old one is used, as drafts: it goes through review and publish
   * like any other change (D19).
   *
   * @param old The file being replaced.
   * @param next The new file.
   * @returns How many documents changed, once their drafts are saved.
   */
  public replace(old: MediaAsset, next: MediaAsset): Observable<number> {
    return forkJoin(this.paths.map((path) => this.drafts.document(path))).pipe(
      map((documents) => this.rewritten(documents, old, next)),
      // switchMap: the documents are read once, then saved together.
      switchMap((contents) =>
        contents.size === 0 ? of(0) : this.drafts.saveAll(contents).pipe(map(() => contents.size)),
      ),
    );
  }

  private rewritten(
    documents: readonly (DocumentFields | null)[],
    old: MediaAsset,
    next: MediaAsset,
  ): ReadonlyMap<string, DocumentFields> {
    const contents = new Map<string, DocumentFields>();
    this.paths.forEach((path, index) => {
      const content = documents.at(index);
      const used = ALL_SECTIONS.some(
        (section) =>
          section.path === path && imageUsesIn(section, content).some((use) => use.id === old.id),
      );
      if (used && content) {
        contents.set(path, replaceImage(content, old.id, next) as DocumentFields);
      }
    });
    return contents;
  }
}
