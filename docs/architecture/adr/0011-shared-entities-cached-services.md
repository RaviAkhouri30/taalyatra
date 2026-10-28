# ADR-0011: Shared entity collections and cached services

- **Status:** Accepted · **Date:** 2026-10-28 · **Version:** 1.3.0

## Context

The inner pages (Videos, Team, Shows, Achievements) show the same entities as the home teasers:
videos, team members, show formats and contact details. The owner's condition for 0005: **no
duplicated data**; shared data is fetched once into a common service and reused. Also,
`site` and `home` were preloaded together (ADR-0009), so every inner page would download all 21
home documents.

## Decision

- **One source per entity:** `videos/*`, `team/*`, `showFormats/*` (new; replaces
  `home/shows.formats`) and `site/config`. Page documents (`pages/*`) hold only that page's copy.
  Derived values, such as the video categories, are computed, not stored.
- **Strings two pages need move to `site/config.labels`** (first: `watchVideo`).
- **A `cacheLatest()` operator** (`throwIfEmpty` + `shareReplay(1)` + `catchError → EMPTY`) gives
  every shared service one read per visit. A failure is never cached, so the next subscriber
  retries. `SiteConfigService`, `VideosService`, `TeamService` and `ShowFormatsService` use it.
- **Each preloaded collection (`site`, `home`, `pages`) loads independently,** on the first
  request for one of its documents.
- **Each inner page has one container and one view model** combining its page document with any
  shared list, so it renders in one pass.

## Consequences

- Editing a video, member or format in Firestore updates every page that shows it.
- Navigating between pages re-reads nothing already loaded. Data refreshes on reload.
- Inner pages no longer pay for the home collection.
- Matching short labels in different sections ("Request a proposal") stay section copy.
  Consolidating older home repeats into `site/config.labels` is a possible follow-up.
