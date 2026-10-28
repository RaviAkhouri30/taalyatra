// Template for public/runtime-config.js (git-ignored, CLAUDE.md §10). Copy it to
// runtime-config.js and fill in the values from Firebase console → Project settings → Your apps.
// Production gets its copy from CI (scripts/write-runtime-config.mjs + GitHub secrets).
globalThis.__FIREBASE_CONFIG__ = {
  apiKey: '<api key>',
  authDomain: 'taal-yatra.firebaseapp.com',
  projectId: 'taal-yatra',
  storageBucket: 'taal-yatra.firebasestorage.app',
  messagingSenderId: '<messaging sender id>',
  appId: '<app id>',
};
