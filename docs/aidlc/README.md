# AIDLC — AI-Driven Development Lifecycle

Each feature gets a folder `NNNN-feature-name/`. Copy it from [`_template/`](_template/).
Each phase ends with **human approval** recorded at the bottom of its file. No phase is skipped.

| Phase           | File                 | Output                                                              |
| --------------- | -------------------- | ------------------------------------------------------------------- |
| 1. Inception    | `01-inception.md`    | Problem, user stories, acceptance criteria, units of work, risks    |
| 2. Design       | `02-design.md`       | Component tree, class, sequence and flow diagrams, data model, ADRs |
| 3. Construction | `03-construction.md` | Increment log, decisions, deviations                                |
| 4. Verification | `04-verification.md` | verify/e2e/Sonar/Lighthouse results (real output)                   |
| 5. Operations   | `05-operations.md`   | Version released, deploy notes, monitoring, rollback                |

| #    | Feature                                                              | Version       | Status                                                                                                                     |
| ---- | -------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 0001 | [Foundation: rules, architecture, tooling](0001-foundation/)         | 1.0.0         | Released                                                                                                                   |
| 0003 | [Home page](0003-home-page/)                                         | 1.1.0         | Released 2026-10-26 · tag `v1.1.0` pending                                                                                 |
| 0004 | [Firebase data](0004-firebase-data/)                                 | 1.2.0         | Released 2026-10-28 · verification: performance below target (fix in 1.4.2)                                                |
| 0005 | [Inner pages: Videos, Team, Shows, Achievements](0005-inner-pages/)  | 1.3.0         | Released 2026-10-28 · verification: performance below target (fix in 1.4.2)                                                |
| 0006 | [Admin sign-in](0006-admin-login/)                                   | 1.4.0 (1.4.1) | Released 2026-10-28 (1.4.1: 2026-10-29) · verification: performance below target                                           |
| 0007 | [Performance & SEO](0007-performance-seo/)                           | 1.5.0         | Released 2026-10-30 · verification: mobile performance below target                                                        |
| 0008 | [Admin content editor](0008-admin-content-editor/)                   | 1.6.0         | 1.6.0 released 2026-10-31 · verification: mobile performance below target                                                  |
| 0009 | [Media](0009-media/)                                                 | 1.7.0 (1.7.1) | Released 2026-11-05 · approved · mobile performance still below target                                                     |
| 0012 | [Real-phone speed reports](0012-real-phone-speed/)                   | 1.8.0         | Released 2026-11-05 · verification and operations approval pending                                                         |
| 0013 | [Drum circle editor and gentle reveal](0013-drum-circle-and-reveal/) | 1.9.0         | Released 2026-11-17 · design approved; construction, verification and operations approval pending                          |
| 0014 | [Version 2 programme](0014-version-2/)                               | 1.10.0–2.3.0  | Programme approved 2026-11-17                                                                                              |
| 0015 | [Site and editor polish](0015-site-and-editor-polish/)               | 1.10.0        | Released 2026-11-18 · construction, verification and operations approval pending; screenshot baselines await look approval |
| 0016 | [Nothing lost, and what's new](0016-safety-and-releases/)            | 1.12.0        | Design approved 2026-11-18 · construction approved 2026-11-18 · rules to deploy before merge                               |
| 0017 | [An admin anyone can use](0017-easy-admin/)                          | 1.11.0        | Design and records 03–05 approved 2026-11-18 · deployed 2026-11-18                                                         |
| 0018 | [Visits and leads](0018-visits-and-leads/)                           | 1.13.0        | Design approved 2026-11-18                                                                                                 |
