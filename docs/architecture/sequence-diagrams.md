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

## 2. Admin sign-in (Firebase Auth, 1.4.0)

```mermaid
sequenceDiagram
  autonumber
  participant C as SignInComponent
  participant VM as SignInViewModel
  participant A as IAuthService (FirebaseAuthService)
  participant G as AuthGateway (lazy chunk)
  participant FA as Firebase Auth
  participant R as Router + adminGuard

  C->>VM: submit() (ngSubmit)
  VM->>VM: markAllAsTouched · filter(valid)
  Note right of VM: exhaustMap: one request at a time
  VM->>A: signIn(email, password)
  A->>G: first use: import('./auth-gateway')
  G->>FA: defer(signInWithEmailAndPassword)
  alt success
    FA-->>VM: IAuthUser
    VM->>R: navigateByUrl('/admin') → uid === adminUid ? home : sign out + ?reason=not-admin
  else failure
    FA-->>A: FirebaseError(code)
    A-->>VM: AuthError(kind) → one generic message, password cleared
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

## 6. From a home teaser to an inner page (shared data read once)

```mermaid
sequenceDiagram
  autonumber
  participant HV as HomeVideosViewModel
  participant VS as VideosService (cacheLatest)
  participant P as IHttpBackend
  participant VP as VideosPageViewModel
  HV->>VS: getVideos()
  VS->>P: get('videos'), first subscriber only
  P-->>VS: videos
  VS-->>HV: replay
  Note over HV,VP: visitor follows "View all videos"
  VP->>VS: getVideos()
  VS-->>VP: replayed, no request
  VP->>P: get('pages/videos') (the `pages` collection, read whole once)
  VP->>VP: combineLatest → one render; chip click → computed filter, no I/O
```

## 7. Edit, autosave and preview (1.6.0)

```mermaid
sequenceDiagram
  autonumber
  actor O as Owner
  participant VM as EditorPageViewModel
  participant D as DraftService
  participant S as IDocumentStore
  participant F as Preview frame (?preview)
  participant X as DraftOverlayBackend
  O->>VM: types in a field
  Note right of VM: debounceTime(800) · concatMap(save) keeps saves in order
  VM->>D: save(path, whole document)
  D->>S: commit([set drafts/{id}])
  S-->>VM: saved → status "Saved in your draft"
  VM->>F: load /?preview=1&v=n#section
  F->>X: read home/hero
  X->>X: Auth session ✓ → readAll(drafts) once
  X-->>F: the draft, else the live document
```

## 8. Publish and undo (1.6.0)

```mermaid
sequenceDiagram
  autonumber
  actor O as Owner
  participant P as PublishPageViewModel
  participant R as PublishReport
  participant PS as PublishService
  participant S as IDocumentStore
  O->>P: open Review & publish
  P->>R: check(drafts, schemas, now)
  R-->>P: errors (block) · warnings
  O->>P: Publish changes → Yes, publish
  Note right of P: exhaustMap ignores repeat clicks
  PS->>S: read live versions · readAll(publishes)
  PS->>S: commit([set live…, set publishes/{id} with before, delete drafts…, trim history to 20])
  S-->>P: done → toast, reload, recount drafts
  O->>P: Undo this publish → Restore
  PS->>S: commit([set drafts from record.before])
```
