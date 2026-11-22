# Component Tree & Routing

## Current (v1.6.0)

```mermaid
flowchart TD
  App["App (app-root)"] --> Shell["SiteShellComponent<br/>preview banner (?preview) · utility bar · header · footer (+ credit, copyable address) · promo · action bar · WhatsApp FAB · toast host<br/>links and widgets follow site/visibility · main hidden until site config settles"]
  Shell --> RO["router-outlet"]
  RO -->|"'' (lazy, layout: Home)"| Home["HomePageComponent"]
  RO -->|"videos (lazy, layout: Page)"| V["VideosPageComponent<br/>page-hero · filter-chips · video-card (featured / library) · page-cta"]
  RO -->|"team"| T["TeamPageComponent<br/>page-hero · team-card × n · values · page-cta"]
  RO -->|"shows"| S["ShowsPageComponent<br/>page-hero (+ page-cta) · show-spotlight · show-format-card × n · setups · steps · page-cta"]
  RO -->|"achievements"| A["AchievementsPageComponent<br/>page-hero · stats · milestones · recognition · press · performances · page-cta"]
  RO -->|"videos · team · shows · achievements: pageEnabledGuard (canMatch)"| V
  RO -->|"admin (lazy, layout: Bare)"| AD["AdminShellComponent (noindex)<br/>sign-in · signedOutGuard → SignIn · reset-password → ResetPassword (app-auth-card)"]
  AD -->|"'' · adminGuard"| EL["EditorLayoutComponent<br/>account bar · side panel (What’s new and new-leads markers) · save status (EditorLayoutViewModel)<br/>route providers: IMediaService · IFileService · BackupService"]
  EL --> DB["'' → DashboardComponent"]
  EL --> EP["one tab per site section (hero · offer · audiences · experiences · shows · drum-circle · rhythm-game · videos · gallery · philosophy · cities · how · team · instagram · testimonials · faq · proposal-form; 2.10.0 added six) and settings (business · contact · visibility · theme) → EditorPageComponent<br/>(unsavedChangesGuard) · unsaved-changes bar (safety copy, 0016) · cards with appInView · schema-fields · schema-field · preview-frame (PreviewScroller)"]
  EL --> ML["media → MediaLibraryComponent (MediaManageViewModel)<br/>MediaUploadComponent · MediaCardComponent"]
  EL --> PP["publish → PublishPageComponent<br/>BackupPanelComponent (BackupPanelViewModel, 0016) · PublishHistoryComponent (go back, 0016)"]
  EL --> VS["visits → VisitsPageComponent (VisitsPageViewModel, 0018)<br/>period switch · BarChartComponent × 2 (visits, proposals) · where visitors arrive · devices"]
  EL --> LD["leads → LeadsPageComponent (LeadsPageViewModel, 0018)<br/>LeadFiltersComponent · LeadCardComponent × n (status, remove) · Export CSV"]
  EL --> RL["releases → ReleasesComponent (What’s new, 0016)<br/>notes from the bundled CHANGELOG; opening it clears the New marker"]
  RO -->|"** → ''"| Home
  Home --> Eager["intro · hero · marquee · trust<br/>(each optional section only when switched on)"]
  Home --> Deferred{{"@defer (on idle)<br/>offer … contact (each with appReveal) · assistant"}}
  Home -.->|"#fragment"| Hold["SectionHoldService<br/>keeps a linked section in place while the page fills in"]
```

The home page's full section tree is in
[aidlc/0003-home-page/02-design.md](../aidlc/0003-home-page/02-design.md), and the inner pages'
in [aidlc/0005-inner-pages/02-design.md](../aidlc/0005-inner-pages/02-design.md). Each inner page
is one container with one view model that combines its `pages/*` document with any shared list,
so it renders in one pass. Page chrome lives in
`shared/components/layout/` and varies per route through `layout` route data (`LAYOUT_CHROME`).

## Conventions

- One **container** component per route. It owns the ViewModel and composes **presentational**
  children, which take signal `input()`s and emit `output()`s and have no injected services.
- Layout components (`layout/`) such as header, footer and nav sit in the App shell around the outlet.
- Update this tree whenever a route or component is added.

## Image field (1.7.0)

`SchemaFieldComponent` renders `FieldKind.Image` as an image field, in lists and groups alike.

```mermaid
flowchart TD
  SF["SchemaFieldComponent"] --> IF["ImageFieldComponent (ImageFieldViewModel)<br/>thumbnail · description · YouTube thumbnail"]
  IF -->|Choose or upload| MP["MediaPickerComponent (MediaLibraryViewModel)"]
  MP --> UP["MediaUploadComponent (MediaUploadViewModel)<br/>queue · progress · retry"]
  IF -->|Crop| CR["ImageCropComponent<br/>drag · move buttons · arrow keys · zoom<br/>(CropBoxDirective, CropFrame)"]
```

## Roles and approvals (2.0.0)

New admin routes and components ([ADR-0018](adr/0018-roles-and-approvals.md)). Every editor route sits behind
`editorGuard` (owner or manager); `editorTabGuard` keeps a manager off hidden pages, and `ownerGuard` keeps them off the
owner's own pages.

```mermaid
flowchart TD
  L["EditorLayoutComponent<br/>menu from navGroupsFor(permissions) · approvals badge"]
  L -->|team-access · ownerGuard| TA["TeamAccessPageComponent (TeamAccessViewModel)"]
  TA --> MC["ManagerCardComponent"]
  TA --> MF["ManagerFormComponent<br/>UID · email · setting per page · uploads"]
  L -->|publish| PP["PublishPageComponent (PublishPageViewModel)<br/>authors · ticks · publish or send · note"]
  PP --> AP["ApprovalsPanelComponent (ApprovalsPanelViewModel)"]
  AP --> AC["ApprovalCardComponent<br/>approve · send back · withdraw · clear"]
  L -->|editor tabs · editorTabGuard| EP["EditorPageComponent<br/>waiting notice · locked fieldset for managers"]
  L -->|visits, leads · ownerGuard| OW["Owner-only pages"]
```

## Guided tour and Features (2.1.0)

The tour's state lives in `TourService`, provided by the editor layout. Areas mark themselves with `TourTargetDirective`;
`TourComponent` is the only part that measures them ([0020 design](../aidlc/0020-tour-and-showcase/02-design.md)).

```mermaid
flowchart TD
  L["EditorLayoutComponent<br/>provides TourService"] --> TB["EditorTopBarComponent"]
  TB --> HM["HelpMenuComponent<br/>Take the tour · Features · What's new"]
  L --> TO["TourOfferComponent<br/>once per account and device"]
  L --> TC["TourComponent<br/>highlight · step card"]
  L --> N["Menu, Find, Review link<br/>appTourTarget"]
  L -->|editor tabs| EP["EditorPageComponent<br/>cards · preview · publish bar: appTourTarget"]
  L -->|features| FP["FeaturesPageComponent (FeaturesPageViewModel)"]
  EP -->|"Theme card (0021)"| TP["ThemePanelComponent (ThemePanelViewModel)<br/>Themes: yours · dark · light · contrast · Reset"]
  TP --> SW["ThemeSwatchComponent (colours)"]
  TP -->|"Saved themes (0027)"| ST["SavedThemesPanelComponent (SavedThemesViewModel)<br/>save · rename · delete"]
  TP -.-> STS["SavedThemesService (admin routes)"]
  ST -.-> STS
```

## AI help (2.6.0)

Each prose field and each photo description gets its own `AiAssistComponent` with a component-scoped view model; the
Leads page gets `LeadsAnalysisComponent`. Both ask `IAiService`, provided on the admin routes
([ADR-0020](adr/0020-ai-through-the-function.md), [0025 design](../aidlc/0025-ai-help/02-design.md)).

```mermaid
flowchart TD
  SFS["SchemaFieldsComponent<br/>passes each field the card's other prose"] --> SF["SchemaFieldComponent"]
  SF -->|"text and multi-line only"| AA["AiAssistComponent (AiAssistViewModel)<br/>AI help · styles · Suggest a first version"]
  IF["ImageFieldComponent"] -->|"uploaded photos"| AA2["AiAssistComponent<br/>Suggest a description"]
  AA --> AS["AiSuggestionComponent<br/>Use it · Try again · Keep mine"]
  AA2 --> AS
  LP["LeadsPageComponent"] --> LA["LeadsAnalysisComponent (LeadsAnalysisViewModel)<br/>Analyse these N leads"]
  AA --> S[(IAiService)]
  AA2 --> S
  LA --> S
```

## The admin as an app (2.8.0)

The shell adds the manifest and iPhone tags while the admin is open, through `AdminAppService`, and keeps the browser's
install offer for the Install page ([0026 design](../aidlc/0026-admin-app/02-design.md)).

```mermaid
flowchart TD
  SH["AdminShellComponent (AdminShellViewModel)<br/>provides AdminAppService · IInstallPrompt"] --> S["AdminAppService<br/>manifest · iPhone tags · canInstall"]
  S --> P[(IInstallPrompt · BrowserInstallPrompt)]
  SH --> EL["EditorLayoutComponent"]
  EL --> HM["HelpMenuComponent<br/>+ Install on your phone"]
  EL -->|install| IP["InstallPageComponent (InstallPageViewModel)<br/>steps · Install"]
  IP --> S
```
