/** One run of text in a release note: plain, bold or code. */
export interface ITextPart {
  readonly text: string;
  readonly strong: boolean;
  readonly code: boolean;
}

/** One list under a release, e.g. "Added". */
export interface IReleaseGroup {
  readonly heading: string;
  /** Each note, as runs of text. */
  readonly items: readonly (readonly ITextPart[])[];
}

/** One release, as written in the CHANGELOG. */
export interface IRelease {
  /** e.g. "1.11.0". */
  readonly version: string;
  /** The release day, YYYY-MM-DD. */
  readonly date: string;
  readonly groups: readonly IReleaseGroup[];
}

/** `## [1.11.0] - 2026-11-18`; `[Unreleased]` has no date, so it never matches. Lines are trimmed. */
const RELEASE_HEADING = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})$/;
const GROUP_PREFIX = '### ';
const ITEM_PREFIX = '- ';
/** An indented line carries on the note above it. */
const CONTINUATION_PREFIX = '  ';
/** `**bold**` or `` `code` ``, in the order they appear. */
const EMPHASIS = /\*\*([^*]+)\*\*|`([^`]+)`/g;
/**
 * `[text](url)`: the page shows the text; the links point into the repository. Bounded, so a
 * stray bracket can't make the match slow.
 */
const LINK = /\[([^\]]{1,200})\]\([^)]{0,500}\)/g;

/** Builds releases line by line; Keep a Changelog is regular enough not to need a Markdown parser. */
class ChangelogReader {
  public readonly releases: { version: string; date: string; groups: IMutableGroup[] }[] = [];
  /** False while inside `[Unreleased]` or the file's preamble, whose lines are skipped. */
  private inRelease = false;

  private static addTo(items: string[], line: string): void {
    if (line.startsWith(ITEM_PREFIX)) {
      items.push(line.slice(ITEM_PREFIX.length));
    } else if (line.startsWith(CONTINUATION_PREFIX) && items.length > 0) {
      items.push(`${items.pop() ?? ''} ${line.trim()}`);
    }
  }

  public read(raw: string): void {
    const line = raw.trimEnd();
    const [, version, date] = RELEASE_HEADING.exec(line) ?? [];
    if (version !== undefined && date !== undefined) {
      this.releases.push({ version, date, groups: [] });
      this.inRelease = true;
    } else if (line.startsWith('## ')) {
      this.inRelease = false;
    } else if (this.inRelease) {
      this.readInRelease(line);
    }
  }

  private readInRelease(line: string): void {
    const groups = this.releases.at(-1)?.groups;
    if (line.startsWith(GROUP_PREFIX)) {
      groups?.push({ heading: line.slice(GROUP_PREFIX.length).trim(), items: [] });
      return;
    }
    const items = groups?.at(-1)?.items;
    if (items) {
      ChangelogReader.addTo(items, line);
    }
  }
}

interface IMutableGroup {
  heading: string;
  items: string[];
}

/**
 * @param text One note, in Markdown.
 * @returns It as runs of plain, bold and code text; links keep only their text.
 */
export function inlineParts(text: string): ITextPart[] {
  const plain = text.replace(LINK, '$1');
  const parts: ITextPart[] = [];
  let from = 0;
  for (const match of plain.matchAll(EMPHASIS)) {
    const [whole, strong, code] = match;
    if (match.index > from) {
      parts.push({ text: plain.slice(from, match.index), strong: false, code: false });
    }
    parts.push({ text: strong ?? code ?? '', strong: strong !== undefined, code: !strong });
    from = match.index + whole.length;
  }
  if (from < plain.length) {
    parts.push({ text: plain.slice(from), strong: false, code: false });
  }
  return parts;
}

/**
 * @param markdown The CHANGELOG, in Keep a Changelog format.
 * @returns Its releases, newest first as written; `[Unreleased]` is left out.
 */
export function parseChangelog(markdown: string): IRelease[] {
  const reader = new ChangelogReader();
  for (const line of markdown.split(/\r?\n/)) {
    reader.read(line);
  }
  return reader.releases.map((release) => ({
    version: release.version,
    date: release.date,
    groups: release.groups
      .filter((group) => group.items.length > 0)
      .map((group) => ({ heading: group.heading, items: group.items.map(inlineParts) })),
  }));
}
