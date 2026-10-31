# ADR-0008: Accessibility fixes that deviate from the design

- **Status:** Accepted · **Date:** 2026-10-26 · **Version:** 1.1.0

## Context

The home page matches the prototype's computed styles, but a few prototype details fail WCAG 2.2
AA (axe) or strand keyboard users. Pixel parity and accessibility are both mandatory (CLAUDE.md §10).

## Decision

Accessibility wins; each deviation is minimal and commented where it is made:

| Where                                  | Design                    | App                                                           | Why                                         |
| -------------------------------------- | ------------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| Proof section button                   | ghost (cream on ivory)    | `Line` variant                                                | colour contrast                             |
| Contact note (`.cnote`)                | 9 % dark tint on clay     | 10 % light tint                                               | ink text 4.2:1 → above 5:1                  |
| Promo badge                            | stays under the open chat | hidden while a floating panel is open (`OverlayStateService`) | covered but focusable targets (target-size) |
| Launcher column (`.fab`)               | box takes clicks          | `pointer-events: none`, buttons opt back in                   | it covered the chat's send button           |
| Floating call/WhatsApp while chat open | faded but focusable       | `tabindex="-1"`, `aria-hidden`                                | hidden controls out of the tab order        |
| Lightbox focus                         | n/a                       | moved one animation frame after render                        | WebKit dropped earlier focus                |
| Login icon link                        | icon only                 | `aria-label="Admin login"`                                    | accessible name                             |

## Consequences

- axe reports no violations on the closed page and with the chat, form errors or photo viewer open.
- Visual baselines record the deviations, so they cannot regress silently.
