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

| #    | Feature                                                      | Version | Status   |
| ---- | ------------------------------------------------------------ | ------- | -------- |
| 0001 | [Foundation: rules, architecture, tooling](0001-foundation/) | 1.0.0   | Released |
| 0003 | [Home page](0003-home-page/)                                 | 1.1.0   | Built · release commit and tag pending |
| 0004 | [Firebase data](0004-firebase-data/)                         | 1.2.0   | Construction approved · PR open, verification pending |
| 0005 | [Inner pages: Videos, Team, Shows, Achievements](0005-inner-pages/) | 1.3.0 | Construction · awaiting approval |
