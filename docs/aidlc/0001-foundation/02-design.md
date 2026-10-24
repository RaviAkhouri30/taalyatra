# 02 · Design — Foundation

- Architecture: [overview](../../architecture/overview.md), [class diagram](../../architecture/class-diagram.md),
  [sequences](../../architecture/sequence-diagrams.md), [flows](../../architecture/flow-diagrams.md).
- Decisions: ADR-0001 (MVVM on standalone), 0002 (ports, adapters and factory), 0003 (signals and RxJS, no Promises),
  0004 (Bootstrap 5.3.8), 0005 (ESLint instead of TSLint).
- Base classes (`ViewModel`, `BaseComponent`, `ApiBaseService`) and ports are specified in `CLAUDE.md` §3.
  They will be implemented in the first feature that needs them, with tests.

---

**Approval:** ☐ Pending product-owner review
