# Taal Yatra — Engineering Rules & Architecture

These rules are **mandatory**. Every change — feature, fix, refactor, test — must comply.
If a request conflicts with a rule, stop and raise the conflict instead of silently breaking it.
Most rules are enforced by tooling (`eslint.config.mjs`, `tsconfig.json`, `angular.json`); the
rest are enforced by review. Background and diagrams live in [`docs/`](docs/README.md).

Reference implementation of the architecture: `/Users/raviakhouri/MyWorks/Resume3.0/src/app`
(NgModule-based — port its patterns to **standalone**, never copy its modules).

---

## 1. Tech Stack (exact versions pinned in `package.json`)

| Concern           | Choice                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Framework         | Angular 22: standalone, zoneless, **signals** for state                                       |
| UI / Layout       | Bootstrap **5.3.8** (latest stable; SCSS, imported selectively)                               |
| Icons             | Bootstrap Icons 1.13: import individual SVGs, never the full icon font                        |
| Async / Data flow | RxJS 7 for **all** asynchronous work                                                          |
| Backend / DB      | Firebase Firestore 13, behind the `IHttpBackend` adapter                                      |
| Authentication    | Firebase Auth, behind the `IAuthService` adapter                                              |
| Media             | Cloudinary via `NgOptimizedImage` + `provideCloudinaryLoader`                                 |
| Email             | EmailJS (`@emailjs/browser` 5), behind the `IEmailService` adapter                            |
| Unit tests        | Vitest 4 (`@angular/build:unit-test`) + `@vitest/coverage-v8`                                 |
| E2E tests         | Playwright 1.64 + `@axe-core/playwright`                                                      |
| Static analysis   | ESLint 10 (`angular-eslint`, `typescript-eslint`, `sonarjs`, `security`), SonarQube, Prettier |

- **Bootstrap 6** is still in alpha. Upgrading to it requires a stable release and an ADR.
- **TSLint** is deprecated. `typescript-eslint` covers its rules. Never install `tslint` or `codelyzer`.

---

## 2. Commands

```bash
npm start              # dev server on :4200
npm run build          # production build (budgets + auto strict CSP)
npm run lint           # ESLint, 0 errors / 0 warnings      (lint:fix to autofix)
npm run format:check   # Prettier check                      (format to write)
npm run typecheck      # tsc for app, spec and e2e configs
npm test               # Vitest, single run                  (test:watch for watch mode)
npm run test:coverage  # Vitest + coverage, fails below 90%  → coverage/taal-yatra/
npm run e2e            # Playwright: desktop, tablet, mobile (e2e:install once for browsers)
npm run e2e:visual:update  # re-record all visual baselines after an approved visual change
npm run test:rules     # firestore.rules tests on the emulator (needs Java)
npm run e2e:firebase   # Firebase smoke suite: emulator, seeded, 3 viewports (needs Java)
npm run start:emulator # dev server against a running local Firestore emulator
npm run seed:firestore -- <key.json> [--dry-run|--yes] | --emulator   # fake-db.json → Firestore
npm run deploy:rules   # deploy firestore.rules + indexes to project taal-yatra
npm run sonar          # SonarQube scan (needs SONAR_HOST_URL and SONAR_TOKEN env vars)
npm run verify         # format:check + lint + typecheck + test:coverage + build
```

**Definition of done:** `npm run verify` ✔ · `npm run e2e` ✔ · `npm run test:rules` ✔ and
`npm run e2e:firebase` ✔ when rules or the data layer change · docs and diagrams updated ·
version bumped and CHANGELOG entry added (§12).

---

## 3. Architecture: MVVM

```
Component ──► ViewModel ──────────► Service ─────────────► IHttpBackend (abstract class = DI token)
 (view)       @Injectable()         @Service() (root)        ├─ FirebaseBackendService
              component-scoped      endpoints + data access  ├─ FakeHttpsService (offline / e2e)
              signals + RxJS                                 └─ RestHttpBackend (HttpClient)
```

| Layer         | Does                                                                    | Never does                                 |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------------ |
| **Component** | Renders VM signals, forwards user events to the VM                      | Business logic, data access, mapping       |
| **ViewModel** | Composes RxJS streams, maps DTOs to models, owns state as signals       | Touch the DOM, know about Firebase or HTTP |
| **Service**   | Knows endpoints, calls a port, returns `Observable<T>`                  | Hold UI state, know about components       |
| **Backend**   | Implements one port for one technology, wraps SDK Promises with `defer` | Leak SDK types outside `core/backends`     |
| **Model**     | Typed class built from a DTO interface, with domain behaviour           | Depend on Angular                          |

### Base classes (`shared/base`)

```ts
export interface IViewModel<T> {
  readonly data: Signal<T | undefined>;
  init(): Observable<void>;
}

export abstract class ViewModel<T> implements IViewModel<T> {
  private readonly _data = signal<T | undefined>(undefined);
  public readonly data = this._data.asReadonly();

  /** Starts every stream the VM owns. Subscribed exactly once by BaseComponent. */
  public init(): Observable<void> {
    return merge(this.attachViewHandler(), this.attachCommandHandler()).pipe(map(() => undefined));
  }
  /** Loads view data. Override in concrete VMs. */
  protected attachViewHandler(): Observable<unknown> {
    return EMPTY;
  }
  /** Reacts to user commands (submit, copy, download…). Override when needed. */
  protected attachCommandHandler(): Observable<unknown> {
    return EMPTY;
  }
  protected setData(value: T): void {
    this._data.set(value);
  }
}

@Directive()
export abstract class BaseComponent<T> implements OnInit {
  protected abstract readonly model: IViewModel<T>;
  private readonly destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    // The only subscription in the view layer; torn down automatically on destroy.
    this.model.init().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
```

### Feature pattern (every feature follows it)

```ts
@Service() // root singleton (Angular 22 decorator)
export class AboutService extends ApiBaseService {
  public override attachViewDataHandler<T>(): Observable<T> {
    return this.attachViewApiHandler<T>(UrlConstants.About);
  }
}

@Injectable() // component-scoped, never providedIn root
export class AboutViewModel extends ViewModel<AboutModel> {
  private readonly aboutService = inject(AboutService);
  public readonly title = computed(() => this.data()?.title ?? '');

  protected override attachViewHandler(): Observable<void> {
    return this.aboutService.attachViewDataHandler<IAboutDto>().pipe(
      map((dto) => new AboutModel(dto)),
      tap((model) => {
        this.setData(model);
      }),
      map(() => undefined),
    );
  }
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AboutViewModel],
})
export class AboutComponent extends BaseComponent<AboutModel> {
  protected override readonly model = inject(AboutViewModel);
}
```

### Ports, adapters and factory (Firebase pattern)

Feature code depends only on **ports**. A port is an abstract class that also serves as the DI
token. A **factory** picks the adapter from the environment. Only `core/backends` may import
`firebase/*`, `@emailjs/browser`, Cloudinary or `HttpClient`.

```ts
export abstract class IHttpBackend {
  public abstract get<T>(url: string): Observable<HttpResponse<T>>;
  public abstract post<T, B>(url: string, body: B): Observable<HttpResponse<T>>;
  public abstract put<T, B>(url: string, body: B): Observable<HttpResponse<T>>;
  public abstract patch<T, B>(url: string, body: B): Observable<HttpResponse<T>>;
  public abstract delete<T>(url: string): Observable<HttpResponse<T>>;
}

export class ApiServiceProviderFactory {
  /** Runs in an injection context, so adapters may call inject() internally. */
  public static httpsServiceFactory(): IHttpBackend {
    switch (inject(APP_ENVIRONMENT).backend) {
      case BackendType.Fake:
        return new FakeHttpsService();
      case BackendType.Firebase:
        return new FirebaseBackendService();
      default:
        return new RestHttpBackend();
    }
  }
}
// core/config/provide-backend.ts → { provide: IHttpBackend, useFactory: ApiServiceProviderFactory.httpsServiceFactory }
```

- Every adapter honours the same `HttpResponse<T>` contract (Liskov). `RestHttpBackend` wraps
  `HttpClient` with `observe: 'response'`, so it matches the contract exactly.
- The same pattern applies to `IAuthService`, `IEmailService` and `IMediaService`. Each has a
  Fake implementation for unit tests and e2e.
- `ApiBaseService` sends every call through `HttpsErrorHandler` (loader, timeout, status check,
  notification) and unwraps `body`.
- The canonical example of this pattern is `docs/architecture/backend-adapter-example.md`
  (Resume3.0's Firestore adapter plus a porting table). The Firestore adapter follows it
  ([ADR-0009](docs/architecture/adr/0009-firestore-data-adapter.md)).

---

## 4. Folder Structure & Imports

```
src/app/
├── app.ts · app.config.ts · app.routes.ts
├── core/          tokens/ factories/ interfaces/(ports) backends/(adapters) services/
│                  interceptors/ guards/ config/(provideXxx helpers)
├── shared/        base/ components/ directives/ pipes/ models/ interfaces/ enums/ constants/ utils/
├── shared/components/layout/   shell, header, footer, nav (page chrome)
└── features/<feature>/
    ├── components/<name>/   *.component.ts|html|scss|spec.ts
    ├── view-models/         *.view-model.ts (+ spec)
    ├── services/            *.service.ts (+ spec)
    ├── models/              *.model.ts, i-*.ts (DTOs)
    └── <feature>.routes.ts  lazy-loaded
    (A page built from many sections, like home, uses one folder per section instead:
     sections/<name>/ holding i-*.ts, *.model.ts, *.service.ts, *.view-model.ts, *.component.*
     with presentational children in sub-folders, plus testing/ for spec fixtures.)
src/styles/        _tokens.scss (design tokens), _bootstrap.scss (selective imports)
e2e/               specs/*.e2e.ts, pages/ (Page Objects), fixtures/
docs/              architecture, ADRs, AIDLC records
```

- Path aliases: `@core/*`, `@shared/*`, `@features/*`, `@layout/*`, `@env/*`. Use them instead of `../../`.
- Dependencies flow one way: `features → shared → core/interfaces`. Features never import
  other features. `core/backends` is referenced only by factories.

---

## 5. SOLID & OOP (strict)

- **S**: one reason to change per class. If you need "and" to describe a class, split it.
- **O**: extend by adding classes or strategies, not by adding branches. `switch` on a type
  is allowed only inside a factory.
- **L**: subtypes honour their base contract. Production adapters never throw
  `Not implemented`, and fakes return valid empty results.
- **I**: small ports (`IReadable<T>`, `IWritable<T>`). No god interfaces.
- **D**: depend on abstractions (abstract classes or `InjectionToken`s), never on SDKs.
- OOP: encapsulation (`private readonly` by default, expose read-only signals), composition
  over inheritance (at most 2 levels below a base class), explicit access modifiers on every
  member (lint-enforced), models as classes.

---

## 6. Angular Practices

- **Standalone only.** No `NgModule`, no `standalone: false` (lint-enforced).
- `OnPush` on every component, zoneless app, `inject()` only (lint-enforced).
- `@Service()` for root singletons, `@Injectable()` + component `providers` for view models.
- Signal APIs only: `input()`, `output()`, `model()`, `viewChild()`, `computed()`, `linkedSignal()`.
- Control flow `@if` / `@for` (with `track`) / `@switch` / `@defer`. No `*ngIf` / `*ngFor`.
- Templates contain bindings only. Logic goes in `computed()` or pure pipes. No inline styles.
- Lazy-load every feature route. Wrap below-the-fold sections in `@defer (on viewport)`, or
  `@defer (on idle)` when anchor links must reach them (ADR-0007).
- Functional guards, resolvers and interceptors. Typed Reactive Forms, with validators in classes.
- `NgOptimizedImage` (`ngSrc`) for every image (lint-enforced).
- `host: {}` metadata instead of `@HostBinding` / `@HostListener` (lint-enforced).
- **Segregate the UI**: a smart container plus small presentational children. A component
  that grows past one responsibility gets split.
- **Injection tokens** (`core/tokens/*.token.ts`) for every non-class dependency:
  `APP_ENVIRONMENT`, `FIREBASE_CONFIG`, `EMAILJS_CONFIG`, `CLOUDINARY_CONFIG`, `WINDOW`,
  `COMMAND_CONTEXT`, `REQUEST_TIMEOUT_MS`. Group them in `provideXxx()` helpers.

---

## 7. Signals & RxJS (no Promises)

- **Signals hold state; RxJS moves data.** VMs expose state as read-only signals (`data`,
  `computed`). Data loading, events, retries and other async work are RxJS streams.
- Bridge the two only inside VMs, with `setData()`, `toSignal()` or `toObservable()`.
- **No `Promise`, `async`, `await`, `.then()` or `new Promise` in production code.** ESLint
  enforces this.
- Promise-based SDKs (Firebase, EmailJS) are wrapped **only in `core/backends`** with
  `defer(() => sdkCall())`, which stays lazy and cold. `from(sdkCall())` would run eagerly.
- The framework entry point `main.ts` is the one other permitted exception.
- Never nest `subscribe()`. Pick `switchMap` / `concatMap` / `mergeMap` / `exhaustMap` on
  purpose and comment why.
- Subscribe only in `BaseComponent`. Long-lived streams `catchError` so one failure can't kill them.
- **Tests** (Vitest, Playwright) may use `async`/`await` and Promises.

---

## 8. Clean Code & Comments

- **No file over 300 lines of code**, for both `.ts` and `.html` (lint-enforced). Split before you reach it.
- Lint limits: functions ≤ 30 lines, complexity ≤ 10, cognitive complexity ≤ 15, depth ≤ 3,
  params ≤ 4.
- `strict` TypeScript with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
  No `any` (use `unknown` plus type guards).
- No magic numbers or strings. Put them in `constants/` and `enums/`.
- No `console.*` (use `LoggerService`), no dead or commented-out code. Prefer early returns.
- Naming: kebab-case files with type suffixes (`.component`, `.view-model`, `.service`,
  `.model`, `.token`, `.factory`, `.guard`, `.interceptor`, `.pipe`, `.directive`), `I`-prefixed
  ports and interfaces, `UPPER_CASE` tokens and constants.
- **TSDoc** on every exported class, public member, input/output and token, with
  `@param`, `@returns` and `@throws` as relevant.
- Inline comments say **why**, not what. Comment every non-obvious RxJS operator choice,
  security decision and workaround.

---

## 9. Testing

**Unit (Vitest):**

- **≥ 90 % statements, branches, functions and lines.** The build fails below that
  (thresholds in `angular.json`).
- Every `.ts` file in `src/app` has a co-located `.spec.ts`. Exempt: `*.routes.ts`, `app.config.ts`, environments.
- Mock ports through DI with Fake classes, never by patching SDK modules.
- One behaviour per `it`, in Arrange / Act / Assert order, named `should … when …`.
- Assert streams with `TestScheduler` marbles or `firstValueFrom`.

**E2E (Playwright):**

- Specs live in `e2e/specs/*.e2e.ts` and use Page Objects from `e2e/pages` through fixtures.
- Every spec runs on desktop, tablet and mobile.
- Use the Fake backend for deterministic journeys, plus a separate Firebase smoke suite.
- Use `getByRole` / `getByTestId` locators only.
- Run an axe WCAG 2.2 AA scan per page, and `toHaveScreenshot()` for pixel-perfect sections.

---

## 10. Security & Performance

**Security:**

- No secrets in source. Firebase web config is injected at runtime (`public/runtime-config.js`,
  git-ignored). Admin SDK JSON files are never committed.
- The Cloudinary API secret never reaches the browser. Use signed uploads through a backend
  function. EmailJS uses the public key only, with domain allow-listing and rate limits.
- `firestore.rules` lives in the repo, denies by default, and is tested. Enable App Check.
- Strict CSP: `security.autoCsp` is on for production. No `bypassSecurityTrust*`
  without a commented review.
- Validate input on the client **and** in rules. `npm audit` must show no high or critical issues.
  Pin dependency versions exactly (`--save-exact`).
- The SonarQube quality gate allows 0 bugs, 0 vulnerabilities and 0 unreviewed hotspots,
  with duplication < 3 %, coverage ≥ 90 % and maintainability A.

**Performance / pixel-perfect:**

- Lighthouse: Performance ≥ 95, Accessibility 100, Best Practices 100, SEO ≥ 95.
- Core Web Vitals: LCP < 2.5 s, CLS < 0.1, INP < 200 ms. The `angular.json` budgets are hard limits.
- Add a Bootstrap partial to `_bootstrap.scss` only when it is actually used.
- Images: `ngSrc` with `priority` on the LCP image, Cloudinary `f_auto,q_auto` and
  responsive `sizes`.
- All colours, spacing and type come from `_tokens.scss`. Never hard-code them in components.
- Match the design at `sm` / `md` / `lg` / `xl` / `xxl`, verified by Playwright screenshots.
  Semantic HTML and WCAG 2.2 AA throughout.

---

## 11. AIDLC & Documentation

Every feature follows the **AI-Driven Development Lifecycle**, recorded in
`docs/aidlc/<NNNN-feature>/` (copy `docs/aidlc/_template`). Each phase ends with **human
approval** before the next one starts:

1. **Inception** (`01-inception.md`): requirements, user stories with acceptance criteria,
   units of work, risks.
2. **Design** (`02-design.md`): domain model, component tree, and class, sequence and flow diagrams.
3. **Construction** (`03-construction.md`): code and tests in small increments, plus a decision log.
4. **Verification** (`04-verification.md`): results from verify, e2e, Sonar and Lighthouse.
5. **Operations** (`05-operations.md`): release version, deploy notes, monitoring, rollback.

Diagrams are Mermaid in Markdown, kept in `docs/architecture/`: overview, class diagram,
component tree, sequence diagrams, flow diagrams, data model, deployment, plus `adr/`.
**Update them in the same change** that alters the architecture or a flow. Significant
decisions get an ADR (`adr/NNNN-title.md`).

---

## 12. Versioning & Releases

- **Semantic Versioning**, starting at **1.0.0** (the foundation release). The single source of
  truth is the `version` field in `package.json`. Sonar reads its version from there.
- **Every feature release bumps MINOR** (`npm run release:minor`, e.g. 1.0.0 → 1.1.0).
  Bug fixes bump PATCH (`release:patch`). Breaking changes bump MAJOR (`release:major`).
- Every release adds a `CHANGELOG.md` entry (Keep a Changelog format) and is recorded in the
  feature's `05-operations.md`. `npm version` creates the `vX.Y.Z` git tag.
- Commits follow **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`,
  `chore:`). `feat` maps to a minor bump and `fix` to a patch bump.
- Details are in [`docs/versioning.md`](docs/versioning.md).

---

## 13. Working Agreement for Claude

- Read this file and the relevant `docs/` before coding. Mirror the nearest existing feature.
- Run `npm run verify` (plus `npm run e2e` for UI changes) before calling work done, and
  report the real output. Never claim a pass you did not see.
- State why before adding any dependency, and install it with `--save-exact`.
- No `eslint-disable` without a comment explaining why **and** user approval.
- If a rule truly cannot be met, say so and record the exception in an ADR.
