# 01 · Inception — The admin on your phone (2.8.0)

From the [version 2 programme](../0014-version-2/01-inception.md): V10, with decision D2 (2026-11-17): an **installable
web app** of the admin area, on two phones (yours and the website manager's), installed from the browser, opening
straight at the admin sign-in, full screen with its own icon, and updating itself with every release. Placed after the
roles and the AI help, so the app shows the finished admin.

## Problem / goal

Today the admin is a page in the phone's browser: it sits among other tabs, shows the browser's address bar, and has
to be found again each time. The owner and the manager want to open it like any other app, from its own icon, full
screen, signed in, and always on the latest release, without app stores, a Mac or reinstalling.

## What's true today (checked 2026-11-22)

- **Android (Chrome):** "Install app" needs a web app manifest; since Chrome 108 it no longer needs a service worker
  ([Chrome's install criteria](https://developer.chrome.com/blog/update-install-criteria)).
- **iPhone (Safari):** "Add to Home Screen" has never needed a service worker; the manifest and a few `apple-` tags
  give the name, icon and full screen.
- **The site** has neither a manifest nor a service worker. Its icons are a 180 px Apple icon and a 32 px favicon;
  the logo file in the repository is 156 × 156 px, too small for the 512 px icon phones ask for.
- **Photo upload** already uses a file input that accepts photos; on both phones it offers the camera as well as the
  library.

## User stories

- **As the owner or the manager, I want to install the admin on my phone** from the browser, so it has its own icon
  and name.
- **As the owner or the manager, I want it to open full screen at the admin**, signed in when I was, without the
  public site.
- **As the owner, I want it to be the latest release every time**, with nothing to reinstall or update.
- **As the owner or the manager, I want to know how to install it**, on Android and on iPhone.

## Acceptance criteria

- [ ] Given Chrome on Android on an admin page, then **Install app** is offered; installed, it opens full screen at
      `/admin` with its own icon and name, and Chrome's own checks find the manifest valid.
- [ ] Given Safari on iPhone, when the owner chooses **Add to Home Screen** on an admin page, then the icon and name
      are the app's, and it opens full screen at `/admin`, below the phone's status bar, not under it.
- [ ] Given the installed app, then links within the admin stay in it; **View site** opens the public site in the
      browser.
- [ ] Given a new release, then the installed app shows it the next time it's opened, with nothing to do.
- [ ] Given the public site, then nothing changes: no install offer there, and its first download is unchanged.
- [ ] Given **Help → Install on your phone**, then it shows the steps for Android and iPhone, and on Android an
      **Install** button when the browser offers one.
- [ ] Given the changes, then axe finds no WCAG 2.2 AA violations on the new Help page, on three sizes.

## Units of work

1. **The manifest** (`admin.webmanifest`): name, short name, icons (192, 512 and a maskable 512), `start_url` and
   `scope` `/admin`, `display: standalone`, colours from the theme's defaults; linked only from admin pages.
2. **iPhone:** the Apple touch icon, `apple-mobile-web-app-capable`, the status bar style, and safe-area padding so the
   top bar sits below the clock and the notch.
3. **Hosting:** the manifest served with the right type and `no-cache`, as the runtime config is.
4. **Install help:** a Help menu page with the steps for each phone and, on Android, an Install button.
5. Tests (unit, e2e on three sizes with axe, a manifest check), records, CHANGELOG, release 2.8.0. A check on both
   real phones by you, since no test can install an app.

## Decisions for the owner

| #   | Decision                      | Recommendation                                                                                                                                                                                                                                                |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Offline or always online**  | **Always online, no service worker.** The admin needs Firestore to do anything, and with nothing cached every release shows on the next open (D2's "updates itself"). A service worker would add stale-version and update-prompt problems for no gain         |
| D2  | **Where it can be installed** | **From admin pages only:** the manifest is linked there, with `scope` `/admin`, so the public site offers no install and visitors never see an admin app                                                                                                      |
| D3  | **Its name**                  | **"Taal Yatra admin"**, shown under the icon as **"TY Admin"** (home screens cut long names). Tell me if you'd rather have another                                                                                                                            |
| D4  | **Its icon**                  | **The logo on the dark background**, as 192, 512 and a maskable 512 px PNG. **I need the original logo file** (SVG, or a PNG at least 1024 px): the repository's is 156 px, which would look blurred. Until then, the 2.8.0 work can go on with a placeholder |
| D5  | **Camera**                    | **No change:** the photo upload already offers the camera on both phones. A separate "Take a photo" button would add nothing                                                                                                                                  |
| D6  | **Install help**              | **A page under Help, "Install on your phone"**, with the steps for each phone and, on Android, an Install button the browser offers. Shown to the owner and managers                                                                                          |

## Risks & open questions

- **No test can install an app.** Mitigation: e2e checks the manifest, the links and the iPhone tags, and Chrome's
  manifest checks run in the e2e browser; you check both phones after the deploy, from a short list in the operations
  record.
- **iPhone layout under the notch.** Full screen puts the page under the status bar. Mitigation: `viewport-fit=cover`
  with safe-area padding on the admin's top bar only, checked on the iPhone.
- **Sign-in on iPhone.** A home-screen app on iPhone keeps its own storage, apart from Safari's, so the first open asks
  to sign in once. Expected, and said on the Help page.
- **The public site's download.** Mitigation: the manifest link and iPhone tags are added only when the admin opens,
  from the admin's own lazy code.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22, with D1–D6 as recommended; the logo file to follow.
