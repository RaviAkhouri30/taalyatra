# Versioning & Releases

Taal Yatra uses [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

| Change                                                | Bump  | Command                 | Example       |
| ----------------------------------------------------- | ----- | ----------------------- | ------------- |
| New feature (each feature upgrade)                    | MINOR | `npm run release:minor` | 1.0.0 → 1.1.0 |
| Bug fix, no new behaviour                             | PATCH | `npm run release:patch` | 1.1.0 → 1.1.1 |
| Breaking change (routes, data model, design overhaul) | MAJOR | `npm run release:major` | 1.4.2 → 2.0.0 |

- **1.0.0** is the foundation release: tooling, rules and architecture.
- The version lives **only** in `package.json`. SonarQube reads it through `$npm_package_version`.

## Release steps

1. The feature is complete: `npm run verify` and `npm run e2e` are green.
2. Move the `## [Unreleased]` notes in `CHANGELOG.md` under a new `## [x.y.z] - YYYY-MM-DD` heading.
3. Commit the changelog: `docs(changelog): x.y.z`.
4. Run `npm run release:minor` (or patch/major). It updates `package.json` and the lockfile,
   commits `chore(release): vX.Y.Z` and tags `vX.Y.Z`. The working tree must be clean.
5. Record the version in `docs/aidlc/<feature>/05-operations.md`.
6. Push with tags: `git push --follow-tags`.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org): `feat(scope): …`, `fix(scope): …`,
`docs`, `test`, `refactor`, `perf`, `chore`, `ci`. A `BREAKING CHANGE:` footer means a MAJOR bump.
