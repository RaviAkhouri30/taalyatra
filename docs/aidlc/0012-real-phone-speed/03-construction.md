# 03 · Construction — Real-phone speed reports

Built from the approved [design](02-design.md) on `feat/real-phone-speed`.

| Area              | Files                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Port and adapters | `IVitalsReporter`; `BrowserVitalsReporter`; `BrowserVitalsSource` (own chunk) and its loader; `FakeVitalsReporter`; `vitalsReporterFactory` |
| Site              | `SiteShellViewModel` starts the report and marks when data arrives; `reportVitals` in each environment                                      |
| Rules             | `vitals/{id}` in `firestore.rules`                                                                                                          |
| Admin             | `SpeedReportComponent`, view model, service and model; a card on the dashboard                                                              |

## Decisions & deviations from design

- **A report without LCP is still sent.** Some Safari versions have no LCP, and leaving them out would drop older iPhones altogether,
  so they report their other numbers, and `lcp` is `null`. The 200-visit threshold counts only phone visits with an LCP.
- **A fixed wait, not the browser's idle callback (D2).** The initial bundle was 97 bytes over its 500 kB budget, and Safari has no
  idle callback, so two code paths became one: 3 seconds after the page has loaded.
- **The page and opt-out checks are in the measuring chunk,** also to stay under budget. So a visitor who has opted out still downloads
  that small chunk (about 2 kB), but nothing is measured or sent. Previews stop before it loads.
- **The top bar became its own component.** Its stylesheet had taken the layout's over the 4 kB budget, which only showed as a build
  warning, and I missed it when the top bar and side panel were built.
- **The emulator build reports too,** so the Firebase suite tests a real page's report through the real rules.

## Checks

`npm run verify` passes (1,208 site tests, coverage 99.71/97.95/99.44/99.88; 52 function tests at 100 %); `npm run test:rules` 144
passed; `npm run e2e` 360 passed in one clean run; `npm run e2e:firebase` 27 passed, including a real page's report stored through
the real rules and shown on the dashboard.

**Bundle:** the initial download is 499.91 kB, 90 bytes under the 500 kB warning, and the measuring code is a separate chunk of about
2 kB. **The next change to public pages will go over it,** so that budget needs a decision first.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-05 (the owner asked for the release).
