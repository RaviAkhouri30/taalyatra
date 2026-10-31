# Class Diagram

Core abstractions. Feature classes (`About*`) show the pattern every feature follows.

```mermaid
classDiagram
  direction LR

  class IViewModel~T~ {
    <<interface>>
    +data: Signal~T | undefined~
    +init() Observable~void~
  }
  class ViewModel~T~ {
    <<abstract>>
    -_data: WritableSignal~T | undefined~
    +data: Signal~T | undefined~
    +init() Observable~void~
    #attachViewHandler() Observable~unknown~
    #attachCommandHandler() Observable~unknown~
    #setData(value: T) void
  }
  class BaseComponent~T~ {
    <<abstract>>
    #model: IViewModel~T~
    -destroyRef: DestroyRef
    +ngOnInit() void
  }
  class ApiBaseService {
    <<abstract>>
    -backend: IHttpBackend
    -errorHandler: HttpsErrorHandler
    +attachViewDataHandler~T~()* Observable~T~
    +attachViewApiHandler~T~(url) Observable~T~
  }
  class IHttpBackend {
    <<abstract port>>
    +get~T~(url) Observable~HttpResponse~T~~
    +post~T,B~(url, body) Observable~HttpResponse~T~~
    +put~T,B~(url, body) Observable~HttpResponse~T~~
    +patch~T,B~(url, body) Observable~HttpResponse~T~~
    +delete~T~(url) Observable~HttpResponse~T~~
  }
  class FirebaseBackendService
  class FakeHttpsService
  class RestHttpBackend
  class ApiServiceProviderFactory {
    +httpsServiceFactory()$ IHttpBackend
  }
  class HttpsErrorHandler {
    +handleHttpsError~T~(req) Observable~T~
  }

  class AboutComponent
  class AboutViewModel
  class AboutService
  class AboutModel

  IViewModel <|.. ViewModel
  ViewModel <|-- AboutViewModel
  BaseComponent <|-- AboutComponent
  ApiBaseService <|-- AboutService
  IHttpBackend <|.. FirebaseBackendService
  IHttpBackend <|.. FakeHttpsService
  IHttpBackend <|.. RestHttpBackend

  AboutComponent --> AboutViewModel : model
  AboutViewModel --> AboutService : inject
  AboutViewModel ..> AboutModel : creates
  ApiBaseService --> IHttpBackend : inject
  ApiBaseService --> HttpsErrorHandler : inject
  ApiServiceProviderFactory ..> IHttpBackend : creates
```

The same port → adapter → factory shape applies to `IAuthService`, `IEmailService` and
`IMediaService`. `IEmailService` is implemented (1.1.0):

```mermaid
classDiagram
  direction LR
  class IEmailService {
    <<abstract port>>
    +send(message: IEmailMessage) Observable~void~
  }
  class EmailJsEmailService {
    -config: emailJs settings
    +send(message) Observable~void~
  }
  class FakeEmailService {
    -latencyMs: number
    +send(message) Observable~void~
  }
  class emailServiceFactory {
    <<function>>
  }
  IEmailService <|.. EmailJsEmailService
  IEmailService <|.. FakeEmailService
  emailServiceFactory ..> IEmailService : creates
```

`IHttpBackend`'s Firestore adapter (1.2.0, [ADR-0009](adr/0009-firestore-data-adapter.md)):

```mermaid
classDiagram
  direction LR
  class IHttpBackend { <<abstract port>> }
  class FirebaseBackendService {
    -gateway$: Observable~IFirestoreGateway~ | null
    +get / post / put / patch / delete
  }
  class IFirestoreGateway { <<interface>> }
  class FirestoreGateway { <<lazy chunk · only firebase/* importer>> }
  class FIRESTORE_GATEWAY_LOADER { <<InjectionToken>> }
  class FIREBASE_CONFIG { <<InjectionToken>> }
  class FirestorePath { +path +kind +parse(path)$ }
  class toHttpStatus { <<function>> }
  class HttpsErrorHandler { +handle(req) +handleCommand(req) }
  class ApiWriteBaseService~B~ { <<abstract>> #attachCreateApiHandler() +create(body)* }
  class ProposalsService

  IHttpBackend <|.. FirebaseBackendService
  IFirestoreGateway <|.. FirestoreGateway
  FirebaseBackendService --> FIRESTORE_GATEWAY_LOADER : inject
  FirebaseBackendService --> FIREBASE_CONFIG : inject
  FIRESTORE_GATEWAY_LOADER ..> FirestoreGateway : import() once
  FirebaseBackendService ..> FirestorePath
  FirebaseBackendService ..> toHttpStatus
  ApiWriteBaseService <|-- ProposalsService
  ApiWriteBaseService --> HttpsErrorHandler
```

The home page's section classes (contact, assistant) are in
[aidlc/0003-home-page/02-design.md](../aidlc/0003-home-page/02-design.md).

Shared entities and cached services (1.3.0, [ADR-0011](adr/0011-shared-entities-cached-services.md)):

```mermaid
classDiagram
  direction LR
  class cacheLatest { <<operator>> throwIfEmpty · shareReplay(1) · catchError → EMPTY }
  class SiteConfigService { +getSiteConfig() }
  class VideosService { +getVideos() }
  class TeamService { +getTeam() }
  class ShowFormatsService { +getFormats() }
  SiteConfigService ..> cacheLatest
  VideosService ..> cacheLatest
  TeamService ..> cacheLatest
  ShowFormatsService ..> cacheLatest
  HomeVideosViewModel --> VideosService
  VideosPageViewModel --> VideosService
  HomeTeamViewModel --> TeamService
  TeamPageViewModel --> TeamService
  HomeShowsViewModel --> ShowFormatsService
  ShowsPageViewModel --> ShowFormatsService
```

Content editor (1.6.0, [ADR-0013](adr/0013-drafts-publish-preview.md),
[ADR-0014](adr/0014-schema-driven-editors.md), [ADR-0015](adr/0015-site-visibility.md)):

```mermaid
classDiagram
  direction LR
  class IDocumentStore {
    <<abstract port>>
    +read(path) Observable~DocumentFields | null~
    +readAll(collection) Observable~ReadonlyMap~
    +commit(writes) Observable~void~
  }
  class FirestoreConnection { +gateway$ (one per app) }
  class FirebaseDocumentStore
  class FakeDocumentStore
  class FakeDataStore { fake-db.json + writes in localStorage }
  class DraftOverlayBackend { <<IHttpBackend decorator, ?preview>> }
  class DraftService { +drafts() · +document(path) · +save() · +saveAll() · +discard() }
  class PublishService { +publish(drafts) · +history() · +restore(record) }
  class PublishReport { +errors · +warnings · +canPublish }
  class IPublishRule { <<interface>> SchemaRule · PromotionDatesRule · PlaceholderRule }
  class IEditorSection { +path · +anchor · +fields: FieldSchema[] }
  class SiteVisibilityService { +getVisibility() }
  class PromotionSchedule { +status(now) · +isActive(now) }
  IDocumentStore <|.. FirebaseDocumentStore
  IDocumentStore <|.. FakeDocumentStore
  FirebaseDocumentStore --> FirestoreConnection
  FirebaseBackendService --> FirestoreConnection
  FakeDocumentStore --> FakeDataStore
  FakeHttpsService --> FakeDataStore
  DraftOverlayBackend --> IDocumentStore
  DraftService --> IDocumentStore
  PublishService --> IDocumentStore
  PublishService --> DraftService
  PublishReport --> IPublishRule
  IPublishRule ..> IEditorSection
  EditorPageViewModel --> DraftService
  PublishPageViewModel --> PublishService
  SiteShellViewModel --> SiteVisibilityService
  SiteConfigModel ..> PromotionSchedule
```
