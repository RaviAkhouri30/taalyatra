/** The admin's web app manifest (0026 V10), in `public/`. */
export const ADMIN_MANIFEST_HREF = '/admin.webmanifest';

/** The app's icon on iPhone, in place of the site's while the admin is open. */
export const ADMIN_TOUCH_ICON_HREF = '/icons/admin-180.png';

/** The name under the icon (D3). */
export const ADMIN_APP_SHORT_NAME = 'TY Admin';

/** Marks the tags the admin added, so it removes only its own. */
export const ADMIN_APP_ATTRIBUTE = 'data-admin-app';

/** Lets `env(safe-area-inset-*)` apply on iPhone, under the status bar and the notch. */
export const VIEWPORT_FIT_COVER = 'viewport-fit=cover';

/** The iPhone tags, as name and content. */
export const ADMIN_APP_META: readonly { readonly name: string; readonly content: string }[] = [
  { name: 'apple-mobile-web-app-capable', content: 'yes' },
  { name: 'mobile-web-app-capable', content: 'yes' },
  { name: 'apple-mobile-web-app-title', content: ADMIN_APP_SHORT_NAME },
  // See-through, with the page padded below it (the safe areas).
  { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
];
