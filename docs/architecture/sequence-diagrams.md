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

## 4. Media delivery and upload (Cloudinary, 1.7.0)

Delivery, on every page ([ADR-0017](adr/0017-upload-function-and-media.md)):

```mermaid
sequenceDiagram
  autonumber
  participant C as Component
  participant IMG as NgOptimizedImage
  participant L as mediaImageUrl (IMAGE_LOADER)
  participant CDN as Cloudinary CDN

  C->>IMG: ngSrc = image.src
  IMG->>L: src and width
  alt a local path or full URL
    L-->>IMG: unchanged
  else an uploaded image, with or without a crop
    L-->>IMG: /image/upload/[crop/]f_auto,q_auto,w_{n}/v…/id
    IMG->>CDN: GET
    CDN-->>IMG: optimised image
  end
```

Upload, in the admin area only:

```mermaid
sequenceDiagram
  autonumber
  actor O as Owner
  participant VM as MediaUploadViewModel
  participant M as CloudinaryMediaService
  participant P as ImagePreparer
  participant FN as /api/media/sign
  participant CDN as Cloudinary
  participant LIB as MediaLibraryService

  O->>VM: chooses photos
  VM->>VM: checks type and 15 MB limit
  VM->>M: upload(file), three at a time
  M->>P: shrink to 2400 px, drop metadata
  Note over P: a file it can't decode, like HEIC in Chrome, goes as it is
  M->>FN: POST with x-firebase-token
  FN->>FN: verify the token, sub is the admin
  FN-->>M: signed settings (the API secret stays server-side)
  M->>CDN: POST the file and signed settings
  CDN->>CDN: a_exif, resize, fl_force_strip
  CDN-->>M: progress, then id, size, format
  M-->>VM: progress events, then the stored file
  VM->>LIB: register, writes media/{id}
  VM-->>O: shows it, ready to use
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

## 9. Publish a collection (1.7.0)

The gallery, team, shows and videos are drafted as one document, and stored as numbered documents.

```mermaid
sequenceDiagram
  autonumber
  participant VM as PublishPageViewModel
  participant PS as PublishService
  participant D as DraftService
  participant E as expandCollection
  participant S as IDocumentStore

  VM->>PS: publish(drafts)
  PS->>D: live(path), collapsed into one list, kept for undo
  PS->>S: readAll(path), the stored numbers
  PS->>E: the draft's _items and the stored numbers
  E-->>PS: set 001…N with order, delete the rest
  PS->>S: commit live, history and draft removal (atomic)
  S-->>VM: done, or nothing stored
```

## 10. Replace and delete an image (1.7.0)

```mermaid
sequenceDiagram
  autonumber
  actor O as Owner
  participant VM as MediaManageViewModel
  participant U as MediaUsageService
  participant M as IMediaService
  participant LIB as MediaLibraryService

  O->>VM: Delete
  VM->>U: usages(), live and drafts
  alt the image is in use
    VM-->>O: refused, and the card lists where
  else not in use
    VM-->>O: asks to confirm
    O->>VM: Yes, delete
    VM->>M: remove(publicId), "not found" counts as done
    VM->>LIB: remove the entry
  end

  O->>VM: Replace, with a new file
  VM->>M: upload(file)
  VM->>LIB: register, copying the description
  VM->>U: replace(old, new), rewrites each use into drafts, without crops
  VM-->>O: "Replaced in N places as a draft"
```
