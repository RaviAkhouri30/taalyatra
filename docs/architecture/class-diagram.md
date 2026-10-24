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
`IMediaService`. Add them here when they are implemented.
