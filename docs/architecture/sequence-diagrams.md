# Sequence Diagrams

## 1. Loading view data (every feature)

```mermaid
sequenceDiagram
  autonumber
  participant C as Component
  participant BC as BaseComponent
  participant VM as ViewModel
  participant S as FeatureService
  participant EH as HttpsErrorHandler
  participant P as IHttpBackend (FirebaseBackendService)
  participant FB as Firestore (Lite, REST)

  C->>BC: ngOnInit()
  BC->>VM: init().pipe(takeUntilDestroyed).subscribe()
  VM->>S: attachViewDataHandler<IDto>()
  S->>EH: handleHttpsError(backend.get(url))
  EH->>EH: loader.show()
  EH->>P: get<T>(url)
  Note over P: first request: import('./firestore-gateway') once (lazy SDK chunk)
  P->>FB: defer(() => getDoc(ref)) · collection: getDocs(orderBy('order'))
  FB-->>P: snapshot (unwrap { _items }, strip order)
  P-->>EH: HttpResponse<T> (200 · 404 · Firebase code → 403/503/…, never throws)
  EH->>EH: status check · timeout · loader.hide()
  EH-->>S: HttpResponse<T>
  S-->>VM: body as T
  VM->>VM: map to Model → setData(model)
  Note over C,VM: data signal changes → OnPush view re-renders
```

## 2. Sign-in (Firebase Auth)

```mermaid
sequenceDiagram
  autonumber
  participant C as LoginComponent
  participant VM as LoginViewModel
  participant A as IAuthService
  participant FA as Firebase Auth

  C->>VM: submit(credentials)
  VM->>A: signIn(credentials)
  A->>FA: defer(() => signInWithEmailAndPassword())
  FA-->>A: UserCredential
  A-->>VM: Observable<AuthUser>
  VM->>VM: setData(user) · navigate
  alt failure
    FA-->>A: FirebaseError
    A-->>VM: mapped AuthError (no SDK types leak)
    VM->>VM: error signal set → message shown
  end
```

## 3. Proposal request (EmailJS + Firestore)

```mermaid
sequenceDiagram
  autonumber
  participant PF as ProposalFormComponent
  participant VM as HomeContactViewModel
  participant E as IEmailService
  participant PS as ProposalsService
  participant EH as HttpsErrorHandler
  participant P as IHttpBackend

  PF->>VM: submit() (via submitted output)
  VM->>VM: markAllAsTouched · filter(valid, incl. max lengths)
  Note right of VM: exhaustMap ignores clicks while a request is in flight
  VM->>VM: status = sending
  par email
    VM->>E: send(message) → true · error → logged, false
  and stored copy
    VM->>PS: create(value)
    PS->>EH: handleCommand(backend.post('proposals', value))
    EH->>P: post → addDoc {…value, createdAt: serverTimestamp()}
    P-->>EH: 201 · non-2xx → logged, rethrown
    EH-->>PS: ok / error
    PS-->>VM: true / false
  end
  VM->>VM: forkJoin → any true ? sent (form reset) : failed
```

## 4. Media delivery and upload (Cloudinary)

```mermaid
sequenceDiagram
  autonumber
  participant C as Component
  participant IMG as NgOptimizedImage
  participant CDN as Cloudinary CDN
  participant VM as ViewModel
  participant M as IMediaService
  participant FN as Backend function

  C->>IMG: ngSrc="folder/id" (Cloudinary loader)
  IMG->>CDN: GET /image/upload/f_auto,q_auto,w_{n}/folder/id
  CDN-->>IMG: optimised image (srcset)

  VM->>M: upload(file)
  M->>FN: request signature
  FN-->>M: signature + timestamp (API secret stays server-side)
  M->>CDN: POST signed upload
  CDN-->>M: public_id
  M-->>VM: Observable<MediaAsset>
```

## 5. Chat assistant question

```mermaid
sequenceDiagram
  autonumber
  participant P as AssistantPanelComponent
  participant VM as HomeAssistantViewModel
  participant M as AssistantModel
  participant O as OverlayStateService

  P->>VM: toggle() (launcher)
  VM->>O: setPanelOpen(true) (promo badge steps aside)
  P->>VM: ask("Group size?")
  VM->>VM: append visitor message · pending + 1 (typing indicator)
  Note right of VM: mergeMap: each question gets its own reply
  VM->>VM: timer(800 ms)
  VM->>M: reply(question)
  M-->>VM: first rule whose keyword matches, else fallback
  VM->>VM: append bot message · pending − 1
  P->>VM: Escape → close()
  VM->>O: setPanelOpen(false)
```
