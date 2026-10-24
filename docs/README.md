# Taal Yatra — Documentation

The rules themselves live in [`../CLAUDE.md`](../CLAUDE.md). This folder explains them and records
how the system is built.

| Document                                                               | Purpose                                                |
| ---------------------------------------------------------------------- | ------------------------------------------------------ |
| [architecture/overview.md](architecture/overview.md)                   | System context, layers, dependency rules               |
| [architecture/class-diagram.md](architecture/class-diagram.md)         | Base classes, ports, adapters, feature pattern         |
| [architecture/component-tree.md](architecture/component-tree.md)       | Routing and component hierarchy                        |
| [architecture/sequence-diagrams.md](architecture/sequence-diagrams.md) | Data load, auth, contact email, media                  |
| [architecture/flow-diagrams.md](architecture/flow-diagrams.md)         | Request pipeline, AIDLC flow, release flow             |
| [architecture/data-model.md](architecture/data-model.md)               | Firestore collections and conventions                  |
| [architecture/deployment.md](architecture/deployment.md)               | Environments, CI pipeline, hosting                     |
| [architecture/adr/](architecture/adr/)                                 | Architecture Decision Records                          |
| [tooling.md](tooling.md)                                               | Lint, tests, coverage, Sonar, e2e — how they are wired |
| [versioning.md](versioning.md)                                         | SemVer, release steps, changelog policy                |
| [aidlc/](aidlc/README.md)                                              | AI-Driven Development Lifecycle records per feature    |

Diagrams are Mermaid. They render on GitHub and in VS Code with the _Markdown Mermaid_ extension
(it is in `.vscode/extensions.json`).
