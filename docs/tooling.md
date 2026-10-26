# Tooling

| Tool          | Config                                                                 | What it enforces                                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript    | `tsconfig*.json`                                                       | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, strict templates, extended diagnostics as errors                                                  |
| ESLint        | `eslint.config.mjs`                                                    | 300-line files, function size and complexity, Promise ban, explicit access modifiers, Angular signal/standalone/OnPush rules, template a11y, Sonar and security rules |
| Prettier      | `.prettierrc`                                                          | Formatting (ESLint formatting rules disabled via `eslint-config-prettier`)                                                                                            |
| Vitest        | `angular.json → test`                                                  | Coverage ≥ 90 % (statements, branches, functions, lines). Reports in `coverage/taal-yatra/` (html, lcov)                                                              |
| Playwright    | `playwright.config.ts`                                                 | Specs `e2e/specs/*.e2e.ts` on desktop Chrome, iPad, Pixel 7. Screenshot diff ≤ 1 %. axe WCAG 2.2 AA                                                                   |
| SonarQube     | `sonar-project.properties` (scanner runs via pinned `npx @sonar/scan`) | Quality gate (reads `coverage/taal-yatra/lcov.info` and `reports/eslint-report.json`)                                                                                 |
| Angular build | `angular.json → build`                                                 | Budgets (initial 500 kB warn / 1 MB error, component style 4/8 kB), `autoCsp`                                                                                         |

## Running SonarQube

```bash
export SONAR_HOST_URL=https://sonarcloud.io   # or your SonarQube server
export SONAR_TOKEN=…                          # never commit this
npm run test:coverage && npm run sonar
```

For SonarCloud, also add `sonar.organization=<org>` to `sonar-project.properties`.

## First-time setup

```bash
npm ci
npm run e2e:install     # downloads the Playwright browsers
npm run verify
npm run e2e
```

## Notes

- npm 11 blocks dependency install scripts by default (`lmdb`, `msgpackr-extract`, `protobufjs`).
  The build works without them. Approve them only if needed: `npm install-scripts approve <pkg>`.
- `package.json → overrides` pins patched transitive versions so `npm audit` stays clean:
  `@grpc/grpc-js` 1.14.6 (used only by Firestore's Node build, not the browser bundle) and
  `vite` 8.3.5 (dev server and tests). Remove an override once its upstream package ships the fix.
- The Sonar scanner is not a devDependency, because its `node-forge` dependency has an unpatched
  advisory. It runs on demand via `npx @sonar/scan@5.0.2`.
- E2E starts its own dev server on port **4210**, so it never reuses a stale server on 4200.
- Visual baselines (`e2e/specs/home-visual.e2e.ts-snapshots/`) are per platform. After an approved
  visual change, run `npm run e2e:visual:update` and review the new images against the prototype.
  `e2e/support/visual.css` hides fixed chrome and random particles during screenshots.
- Playwright's emulated reduced motion does not reach SVGs loaded through `<img>`, so the hero's
  animated stage is hidden in screenshots.
