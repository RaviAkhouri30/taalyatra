// Copies src/app/core/backends/fake/fake-db.json into Firestore (ADR-0009).
//
//   npm run seed:firestore -- --emulator               local emulator, no credentials
//   npm run seed:firestore -- <key.json> --dry-run     show what would change in the project
//   npm run seed:firestore -- <key.json> --yes         write to the project
//
// fake-db.json is the source of truth: documents in home, videos, gallery and team that it no
// longer contains are deleted. The proposals collection is never touched. The service-account
// key is read from disk and never printed.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Keep in step with src/app/core/backends/firebase/firestore.constants.ts.
const LIST_FIELD = '_items';
const ORDER_FIELD = 'order';

const DB_FILE = 'src/app/core/backends/fake/fake-db.json';
const SECTIONS = 'home';
const LISTS = ['videos', 'gallery', 'team'];
const ID_DIGITS = 3;
const BATCH_LIMIT = 500;
const EMULATOR_PROJECT = 'demo-taal-yatra';
const EMULATOR_HOST = '127.0.0.1:8080';

/**
 * Maps fake-db.json onto Firestore documents: home/<section> (a list section wrapped as
 * { _items }) and <list>/<NNN> (numbered by position, with an `order` field).
 * @returns Map of document path to data.
 */
export function plan(db) {
  const unknown = Object.keys(db).filter((key) => key !== SECTIONS && !LISTS.includes(key));
  if (unknown.length > 0) {
    throw new Error(`fake-db.json has keys the seed does not map: ${unknown.join(', ')}`);
  }
  const writes = new Map();
  for (const [section, value] of Object.entries(db[SECTIONS])) {
    writes.set(`${SECTIONS}/${section}`, Array.isArray(value) ? { [LIST_FIELD]: value } : value);
  }
  for (const list of LISTS) {
    db[list].forEach((item, index) => {
      const id = String(index + 1).padStart(ID_DIGITS, '0');
      writes.set(`${list}/${id}`, { ...item, [ORDER_FIELD]: index });
    });
  }
  return writes;
}

/** @returns Paths in the managed collections that the plan no longer contains. */
async function stalePaths(firestore, writes) {
  const collections = await Promise.all(
    [SECTIONS, ...LISTS].map((name) => firestore.collection(name).listDocuments()),
  );
  return collections
    .flat()
    .map((reference) => reference.path)
    .filter((path) => !writes.has(path));
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
function connect({ emulator }, keyPath) {
  if (emulator) {
    process.env.FIRESTORE_EMULATOR_HOST ??= EMULATOR_HOST;
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

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      emulator: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      yes: { type: 'boolean', default: false },
    },
  });
  const project = connect(values, positionals[0] ?? process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const firestore = getFirestore();
  const writes = plan(JSON.parse(readFileSync(DB_FILE, 'utf8')));
  const deletes = await stalePaths(firestore, writes);

  console.log(`Project ${project}: ${writes.size} documents to write, ${deletes.length} to delete.`);
  deletes.forEach((path) => console.log(`  delete ${path}`));
  // A real project is written only with an explicit --yes; the emulator needs no confirmation.
  if (values['dry-run'] || (!values.emulator && !values.yes)) {
    console.log(values['dry-run'] ? 'Dry run: nothing written.' : 'Nothing written: add --yes.');
    return;
  }
  await commit(firestore, writes, deletes);
  console.log(`Seeded ${project}.`);
}

if (import.meta.url === `file://${resolve(process.argv[1] ?? '')}`) {
  main().catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  });
}
