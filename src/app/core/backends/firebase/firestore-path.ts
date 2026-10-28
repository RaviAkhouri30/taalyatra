import { FirestorePathKind } from './firestore-path-kind.enum';

/** Letters, digits, `_` and `-` only: rejects `.`, `..` and anything Firestore treats specially. */
const SEGMENT_PATTERN = /^[\w-]+$/;

/** Paths alternate collection / document, so every document adds two segments. */
const SEGMENTS_PER_DOCUMENT = 2;

/** A validated Firestore path, built from an `ApiEndpoint` such as `home/hero` or `videos`. */
export class FirestorePath {
  private constructor(private readonly segments: readonly string[]) {}

  /** The path as the SDK expects it, without leading or trailing slashes. */
  public get path(): string {
    return this.segments.join('/');
  }

  /** Document for an even segment count, collection for an odd one. */
  public get kind(): FirestorePathKind {
    return this.segments.length % SEGMENTS_PER_DOCUMENT === 0
      ? FirestorePathKind.Document
      : FirestorePathKind.Collection;
  }

  /**
   * @param path Slash-separated endpoint path.
   * @returns The parsed path, or `null` when it is empty or has an unsafe segment.
   */
  public static parse(path: string): FirestorePath | null {
    const segments = path.split('/').filter((segment) => segment.length > 0);
    const valid = segments.length > 0 && segments.every((segment) => SEGMENT_PATTERN.test(segment));
    return valid ? new FirestorePath(segments) : null;
  }
}
