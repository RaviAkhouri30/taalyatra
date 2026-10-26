# Component Tree & Routing

## Current (v1.1.0)

```mermaid
flowchart TD
  App["App (app-root)"] --> Shell["SiteShellComponent<br/>utility bar · header · footer · promo badge · mobile action bar · WhatsApp FAB"]
  Shell --> RO["router-outlet"]
  RO -->|"'' (lazy, layout: Home)"| Home["HomePageComponent"]
  RO -->|"** → ''"| Home
  Home --> Eager["intro · hero · marquee · trust"]
  Home --> Deferred{{"@defer (on idle)<br/>offer … contact · assistant"}}
```

The home page's full section tree is in
[aidlc/0003-home-page/02-design.md](../aidlc/0003-home-page/02-design.md). Page chrome lives in
`shared/components/layout/` and varies per route through `layout` route data (`LAYOUT_CHROME`).

## Conventions

- One **container** component per route. It owns the ViewModel and composes **presentational**
  children, which take signal `input()`s and emit `output()`s and have no injected services.
- Layout components (`layout/`) such as header, footer and nav sit in the App shell around the outlet.
- Update this tree whenever a route or component is added.
