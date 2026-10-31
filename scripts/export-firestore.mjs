// Saves the live site's content from Firestore to a dated JSON file, before a release or a seed
// with --overwrite (0008 D16).
//
//   npm run export:firestore -- <key.json>                    writes backups/firestore-<date>.json
//   npm run export:firestore -- <key.json> --out <file.json>  writes the given file
//
// It saves every document in the collections fake-db.json names, plus the editor's drafts and
// publish history, as stored (path → fields). Proposal requests hold visitors' personal details
// and are left out. The service-account key is read from disk and never printed.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { getFirestore } from 'firebase-admin/firestore';
import { connect } from './seed-firestore.mjs';

const DB_FILE = 'src/app/core/backends/fake/fake-db.json';
const EDITOR_COLLECTIONS = ['drafts', 'publishes'];

/** Firestore timestamps become ISO strings, so the backup is plain JSON. */
function plain(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, field) =>
      typeof field?.toDate === 'function' ? field.toDate().toISOString() : field,
    ),
  );
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { out: { type: 'string' } },
  });
  const project = connect({ emulator: false }, positionals[0] ?? process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const firestore = getFirestore();
  const collections = [...Object.keys(JSON.parse(readFileSync(DB_FILE, 'utf8'))), ...EDITOR_COLLECTIONS];
  const documents = {};
  for (const name of collections) {
    const snapshot = await firestore.collection(name).get();
    snapshot.docs.forEach((doc) => {
      documents[doc.ref.path] = plain(doc.data());
    });
  }
  const out = resolve(values.out ?? `backups/firestore-${new Date().toISOString().slice(0, 10)}.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify({ project, exportedAt: new Date().toISOString(), documents }, null, 2)}\n`);
  console.log(`Exported ${Object.keys(documents).length} documents from ${project} to ${out}.`);
}

main().catch((error) => {
  console.error(`Export failed: ${error.message}`);
  process.exitCode = 1;
});
