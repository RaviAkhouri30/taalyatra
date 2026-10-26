# 02 · Design — Home page

## Component tree

```mermaid
flowchart TD
  Home["HomePageComponent<br/>(composition only)"] --> Intro[app-home-intro]
  Home --> Hero[app-home-hero] & Marquee[app-home-marquee] & Trust[app-home-trust]
  Home --> Defer{{"@defer (on idle)"}}
  Defer --> Offer[app-home-offer] & Aud[app-home-audiences] & Exp[app-home-experiences]
  Defer --> Shows[app-home-shows] & DC[app-home-drum-circle] & Game[app-home-rhythm-game]
  Defer --> Vid[app-home-videos] & Gal[app-home-gallery] & Phil[app-home-philosophy]
  Defer --> Mid[app-home-mid-cta] & Cities[app-home-cities] & How[app-home-how]
  Defer --> Team[app-home-team] & Insta[app-home-instagram] & Proof[app-home-proof]
  Defer --> Faq[app-home-faq] & Contact[app-home-contact] & Asst[app-home-assistant]
  Exp --> Chips[app-filter-chips] & Card[app-experience-card]
  Gal --> LB[app-lightbox]
  Vid --> VC[app-video-card]
  Contact --> PF[app-proposal-form] & CA[app-contact-aside]
  Asst --> Launcher[app-assistant-launcher] & Panel[app-assistant-panel]
  Panel --> Msgs[app-assistant-messages]
```

Every `app-home-*` is a container with its own `@Injectable()` view model; children are
presentational (`input()` / `output()` only).

## Class diagram

```mermaid
classDiagram
  direction LR
  class ViewModel~T~ { <<abstract>> }
  class ApiBaseService~T~ { <<abstract>> }
  class IEmailService { <<abstract port>> +send(IEmailMessage) Observable~void~ }
  class EmailJsEmailService
  class FakeEmailService
  class HomeContactService { +attachViewDataHandler() Observable~IContactDto~ }
  class HomeContactViewModel {
    +form: FormGroup~ProposalControls~
    +status: Signal~ProposalStatus~
    +whatsAppHref: Signal~string~
    +submit() void
  }
  class ContactModel { +message: ProposalMessage +whatsAppHref(value) string }
  class ProposalMessage { +body(value) string +subject(value) string +email(value) IEmailMessage }
  class HomeAssistantViewModel {
    +isOpen: Signal~boolean~
    +recent: Signal~IChatMessage[]~
    +typing: Signal~boolean~
    +toggle() void
    +ask(text) void
  }
  class AssistantModel { +reply(question) string }
  class AssistantReplies { +reply(question) string }
  class OverlayStateService { +panelOpen: Signal~boolean~ }

  ViewModel <|-- HomeContactViewModel
  ViewModel <|-- HomeAssistantViewModel
  ApiBaseService <|-- HomeContactService
  IEmailService <|.. EmailJsEmailService
  IEmailService <|.. FakeEmailService
  HomeContactViewModel --> HomeContactService
  HomeContactViewModel --> IEmailService
  HomeContactViewModel ..> ContactModel : creates
  ContactModel --> ProposalMessage
  HomeAssistantViewModel ..> AssistantModel : creates
  AssistantModel --> AssistantReplies
  HomeAssistantViewModel --> OverlayStateService
```

## Sequence diagram

The proposal request and the chat are in
[architecture/sequence-diagrams.md](../../architecture/sequence-diagrams.md) (§3 and §5).

## Data model / endpoints

`ApiEndpoint` values map 1:1 to `fake-db.json` paths (and later to Firestore documents):
`home/hero`, `home/marquee`, `home/trust`, `home/offer`, `home/audiences`, `home/experiences`,
`home/shows`, `home/drumCircle`, `home/rhythmGame`, `home/videos`, `home/gallery`,
`home/philosophy`, `home/midCta`, `home/cities`, `home/how`, `home/team`, `home/instagram`,
`home/proof`, `home/faq`, `home/contact`, `home/assistant`, plus the `videos`, `gallery` and
`team` collections. See [architecture/data-model.md](../../architecture/data-model.md).

## ADRs raised

- [ADR-0006](../../architecture/adr/0006-email-port-emailjs.md): email port with EmailJS and fake adapters.
- [ADR-0007](../../architecture/adr/0007-defer-below-the-fold-on-idle.md): `@defer (on idle)` instead of `on viewport`.
- [ADR-0008](../../architecture/adr/0008-accessibility-over-design-parity.md): accessibility fixes that deviate from the design.

---

**Approval:** ☐ Pending
