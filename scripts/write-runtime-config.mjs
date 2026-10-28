// Writes runtime-config.js (the Firebase web config) into the build output from environment
// variables, for CI (CLAUDE.md §10: never committed). Fails when a value is missing, so a deploy
// can't ship a site that can't reach its database.
//
//   node scripts/write-runtime-config.mjs dist/taal-yatra/browser/runtime-config.js
import { writeFileSync } from 'node:fs';

const VARIABLES = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
};

const [output] = process.argv.slice(2);
if (!output) {
  console.error('Usage: node scripts/write-runtime-config.mjs <output file>');
  process.exit(1);
}
const missing = Object.values(VARIABLES).filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
const config = Object.fromEntries(
  Object.entries(VARIABLES).map(([key, name]) => [key, process.env[name]]),
);
// JSON.stringify quotes and escapes every value, so no value can break out of the statement.
writeFileSync(output, `globalThis.__FIREBASE_CONFIG__ = ${JSON.stringify(config)};\n`);
console.log(`Wrote ${output} for project ${config.projectId}.`);
