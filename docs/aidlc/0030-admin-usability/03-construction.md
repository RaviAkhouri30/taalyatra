# 03 · Construction — An admin that's easier to use (2.14.0)

Built on the approved [inception](01-inception.md) and [design](02-design.md).

| #   | Increment                         | Files                                                                                                                                                                                                                                     | Tests                                                                                                                                                                                                     |
| --- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | The editor sliding away (2.13.0)  | `editor-layout.component.scss`, `editor-page.component.scss` (positioned scroll panels), `ai-assist.component.scss`                                                                                                                       | `admin-ai-help.e2e.ts`: on a wide screen the page stays one screen tall and doesn't move while AI help opens                                                                                              |
| 1   | Dropdowns, Leads, the publish bar | `forms.select` in `_forms.scss`, used by every admin `select`; `LeadFiltersComponent` (Clear filters), `LeadsPageViewModel.filtering`; `PublishBarComponent.onlyWhenNeeded`, `PublishBarViewModel.needed`; the Theme spec's `test.slow()` | `lead-filters.component.spec.ts`, `leads-page.view-model.spec.ts`, `publish-bar.component.spec.ts`; `admin-visitors.e2e.ts`                                                                               |
| 2   | The dashboard                     | `DashTone`, `DashCardComponent`, `MiniBarsComponent`; `DashboardModel.caughtUp`, `visitsWeek`, `access.approvalsWaiting`; `lastWeek` (visits); the dashboard's groups                                                                     | `dash-card.component.spec.ts`, `mini-bars.component.spec.ts`, `dashboard.model.spec.ts`, `visits-page.model.spec.ts`, `dashboard.component.spec.ts` (Needs you first, all caught up)                      |
| 3   | Team access                       | `ManagerFormComponent`: email first, the paste switch, the three-way choices, Set all, the legend, the aligned boxes, the submit's label                                                                                                  | `manager-form.component.spec.ts`; the e2e specs that add a manager                                                                                                                                        |
| 4   | Invite by email                   | `IAccountService`, `AccountError`, `AccountErrorKind`; `FirebaseAccountService`, `FakeAccountService`, `accountServiceFactory`, `provideAccounts()` (admin routes); `TeamAccessViewModel` (invite, `usePastedUid`, `setAll`)              | the adapters' specs (`HttpTestingController`: the request, the emulator, each error), the factory's; `team-access.view-model.spec.ts` (invite, each failure, the email failing, nothing saved on failure) |
| 5   | E2E and records                   | `admin-team-access.e2e.ts` (invite, an email already used, the form's look), `firebase-roles.e2e.ts` (an invited manager sets a password and signs in, on the emulator); ADR-0021, component tree, class and sequence diagrams, CHANGELOG | three sizes, axe; 12 dashboard baselines re-recorded and 3 manager-form baselines added, each checked by eye                                                                                              |

## Decisions & deviations from design

- **The 2.13.0 bug is fixed here, at your request** (increment 0). Screen-reader-only text in the AI help is placed
  absolutely; with no positioned ancestor it belonged to the page, stretching it to about 5,000 px on a screen showing
  900, and the menu's `scrollIntoView` then scrolled the page itself, which nothing lets you scroll back. The editor's
  scroll panels are now positioned, so the page is one screen tall again.
- **Each page's setting is a native radio**, invisible but covering its segment, so a click or tap lands on the radio
  itself (an earlier version left it unclickable to Playwright).
- **The dashboard's badges** show the theme's text on a tint of the card's colour: on the full colour, the muted tone
  failed axe (3.16:1).
- **The first download is 509.99 kB, 0.01 kB under the warning**, and nothing public changed. New imports from the
  admin of things that live in the first download add an export there: `FirebaseAccountService` reads the error's
  shape instead of importing `HttpErrorResponse`, and the dashboard repeats two cards' markup instead of using
  `NgTemplateOutlet`.
- **The editor layout's stylesheet** went 16 bytes over its 4 kB with the fix; an unused `box-sizing` on two 32 px
  buttons made the room.
- **The emulator test of an invited manager** stops once they're signed in: a new account is offered the guided
  tour (0020), which on a phone covers Sign out. The test is marked slow (two sign-ins and a password set).
- **No dependency added.**

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-23.
