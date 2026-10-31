// Copies src/app/core/backends/fake/fake-db.json into Firestore (ADR-0009).
//
//   npm run seed:firestore -- --emulator                      local emulator, no credentials
//   npm run seed:firestore -- <key.json> --dry-run            show what would change
//   npm run seed:firestore -- <key.json> --yes                create missing documents only
//   npm run seed:firestore -- <key.json> --overwrite --yes    replace everything from the file
//
// Each top-level object in fake-db.json (home, site) becomes a collection of documents, each
// top-level list (videos, gallery, team) a collection of numbered items.
//
// Since the content editor (0008 D16), Firestore is the source of truth for the live site: the
// owner's edits live there. So by default only documents that don't exist yet are created, and
// nothing is deleted. --overwrite replaces every document from the file and deletes those the
// file no longer contains, after listing them. The emulator is always reset in full (it holds
// test data only). Collections the file doesn't name (proposals, drafts, publishes) are never
// touched. The service-account key is read from disk and never printed.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Keep in step with src/app/core/backends/firebase/firestore.constants.ts.
const LIST_FIELD = '_items';
const ORDER_FIELD = 'order';

const DB_FILE = 'src/app/core/backends/fake/fake-db.json';
const ID_DIGITS = 3;
const BATCH_LIMIT = 500;
const EMULATOR_PROJECT = 'demo-taal-yatra';
const EMULATOR_HOST = '127.0.0.1:8080';
const AUTH_EMULATOR_HOST = '127.0.0.1:9099';

// Emulator-only accounts for the Firebase smoke suite; none of these exist in the real project.
// The admin uses the production admin UID (environment.ts, firestore.rules), so local runs
// exercise the real admin rule (0008 D13). A UID is an identifier, not a secret.
export const EMULATOR_USERS = [
  { uid: '5zsz2DlUaja2Ss7wbFTrpiMMROk2', email: 'admin@taalyatra.test', password: 'emulator-admin-password' },
  { uid: 'emulator-visitor-uid', email: 'visitor@taalyatra.test', password: 'emulator-visitor-password' },
];

/**
 * Maps fake-db.json onto Firestore documents: <object>/<key> for each top-level object (a list
 * value wrapped as { _items }) and <list>/<NNN> for each top-level list (numbered by position,
 * with an `order` field).
 * @returns Map of document path to data.
 */
export function plan(db) {
  const writes = new Map();
  for (const [name, value] of Object.entries(db)) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const id = String(index + 1).padStart(ID_DIGITS, '0');
        writes.set(`${name}/${id}`, { ...item, [ORDER_FIELD]: index });
      });
    } else if (typeof value === 'object' && value !== null) {
      for (const [key, data] of Object.entries(value)) {
        writes.set(`${name}/${key}`, Array.isArray(data) ? { [LIST_FIELD]: data } : data);
      }
    } else {
      throw new Error(`fake-db.json key "${name}" is neither an object nor a list`);
    }
  }
  return writes;
}

/** @returns Every stored document path in the collections the file names. */
async function existingPaths(firestore, db) {
  const collections = await Promise.all(
    Object.keys(db).map((name) => firestore.collection(name).listDocuments()),
  );
  return new Set(collections.flat().map((reference) => reference.path));
}

/**
 * @param writes Every document the file describes, by path.
 * @param existing Every stored document path in the file's collections.
 * @param overwrite Whether to replace stored documents and delete those the file dropped.
 * @returns What to write and what to delete.
 */
export function changes(writes, existing, overwrite) {
  if (overwrite) {
    return { writes, deletes: [...existing].filter((path) => !writes.has(path)) };
  }
  return { writes: new Map([...writes].filter(([path]) => !existing.has(path))), deletes: [] };
}

async function commit(firestore, writes, deletes) {
  const operations = [
    ...[...writes].map(([path, data]) => (batch) => batch.set(firestore.doc(path), data)),
    ...deletes.map((path) => (batch) => batch.delete(firestore.doc(path))),
  ];
  for (let start = 0; start < operations.length; start += BATCH_LIMIT) {
    const batch = firestore.batch();
    operations.slice(start, start + BATCH_LIMIT).forEach((operation) => operation(batch));
    await batch.commit();
  }
}

/** @returns The project id the app was initialised for. */
export function connect({ emulator }, keyPath) {
  if (emulator) {
    process.env.FIRESTORE_EMULATOR_HOST ??= EMULATOR_HOST;
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= AUTH_EMULATOR_HOST;
    initializeApp({ projectId: EMULATOR_PROJECT });
    return EMULATOR_PROJECT;
  }
  if (!keyPath) {
    throw new Error('Pass the service-account key path, or set GOOGLE_APPLICATION_CREDENTIALS.');
  }
  const key = JSON.parse(readFileSync(resolve(keyPath), 'utf8'));
  initializeApp({ credential: cert(key), projectId: key.project_id });
  return key.project_id;
}

/** Creates the emulator's test accounts; re-running is safe (existing accounts are kept). */
async function createEmulatorUsers() {
  const auth = getAuth();
  for (const user of EMULATOR_USERS) {
    try {
      await auth.createUser(user);
    } catch (error) {
      if (error.code !== 'auth/uid-already-exists') {
        throw error;
      }
    }
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      emulator: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      yes: { type: 'boolean', default: false },
      overwrite: { type: 'boolean', default: false },
    },
  });
  const project = connect(values, positionals[0] ?? process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const firestore = getFirestore();
  const db = JSON.parse(readFileSync(DB_FILE, 'utf8'));
  const existing = await existingPaths(firestore, db);
  const overwrite = values.overwrite || values.emulator;
  const { writes, deletes } = changes(plan(db), existing, overwrite);

  console.log(`Project ${project}: ${writes.size} documents to write, ${deletes.length} to delete.`);
  if (overwrite) {
    [...writes.keys()]
      .filter((path) => existing.has(path))
      .forEach((path) => console.log(`  replace ${path}`));
  } else {
    console.log('  Existing documents are kept (add --overwrite to replace them).');
  }
  [...writes.keys()]
    .filter((path) => !existing.has(path))
    .forEach((path) => console.log(`  create ${path}`));
  deletes.forEach((path) => console.log(`  delete ${path}`));
  // A real project is written only with an explicit --yes; the emulator needs no confirmation.
  if (values['dry-run'] || (!values.emulator && !values.yes)) {
    console.log(values['dry-run'] ? 'Dry run: nothing written.' : 'Nothing written: add --yes.');
    return;
  }
  await commit(firestore, writes, deletes);
  if (values.emulator) {
    await createEmulatorUsers();
  }
  console.log(`Seeded ${project}.`);
}

if (import.meta.url === `file://${resolve(process.argv[1] ?? '')}`) {
  main().catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  });
}
