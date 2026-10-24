# 04 · Verification — Foundation (2026-10-24)

| Check                   | Result                                                                      |
| ----------------------- | --------------------------------------------------------------------------- |
| `npm run format:check`  | ✔ All files use Prettier style                                              |
| `npm run lint`          | ✔ All files pass linting (0 warnings)                                       |
| `npm run typecheck`     | ✔ app, spec and e2e                                                         |
| `npm run test:coverage` | ✔ 2/2 tests, statements 100 %, branches 100 %, functions 100 %, lines 100 % |
| `npm run build`         | ✔ initial 358.99 kB raw / 68.99 kB transfer, strict CSP emitted             |
| `npm run e2e`           | ✔ 6/6 (desktop, tablet, mobile; landmark + axe WCAG 2.2 AA)                 |
| `npm audit`             | ✔ 0 vulnerabilities                                                         |
| Rule self-test          | ✔ Promise/async/await and a 305-line file both fail lint                    |
| Sonar quality gate      | ☐ Not run: needs `SONAR_HOST_URL` and `SONAR_TOKEN`                         |
| Lighthouse              | ☐ Not run: no content pages yet                                             |

---

**Approval:** ☐ Pending
