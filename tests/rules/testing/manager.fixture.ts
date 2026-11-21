import { readFileSync } from 'node:fs';
import { type RulesTestEnvironment, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { type Firestore, doc, setDoc } from 'firebase/firestore';
import fakeDb from '../../../src/app/core/backends/fake/fake-db.json';

/** What the emulator rejects a write or read with when the rules don't allow it. */
export const DENIED = { code: 'permission-denied' };

/** The production owner's UID; `firestore.rules` checks it and the emulator build uses it too. */
export const OWNER_UID = '5zsz2DlUaja2Ss7wbFTrpiMMROk2';

/** A manager who may publish Hero, Videos and Business details, sees no Team, and uploads. */
export const MANAGER_UID = 'manager-uid';

/** A manager with every page needing approval (the default) and uploads off. */
export const NO_UPLOADS_UID = 'manager-without-uploads';

export const SAVED_AT = '2026-11-19T10:00:00.000Z';

/** The emails the clients sign in with: the rules check signatures against them (0022, 0024). */
export const OWNER_EMAIL = 'owner@taalyatra.in';
export const MANAGER_EMAIL = 'content-manager@taalyatra.in';

export type Fields = Record<string, unknown>;

export const home = fakeDb.home as unknown as Record<string, Fields>;
export const siteConfig = fakeDb.site.config as unknown as Fields;

/** A role record as Team access stores it. */
export function managerRole(change: Fields = {}): Fields {
  return {
    email: MANAGER_EMAIL,
    pages: { hero: 'publish', videos: 'publish', business: 'publish', team: 'hidden' },
    uploads: true,
    addedAt: SAVED_AT,
    ...change,
  };
}

/** One signed-in client per kind of person. */
export interface IClients {
  readonly owner: Firestore;
  readonly manager: Firestore;
  readonly noUploads: Firestore;
  /** Signed in, but never added on Team access. */
  readonly member: Firestore;
}

/** @returns An emulator environment with the current `firestore.rules`. */
export function rulesEnvironment(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: 'demo-taal-yatra',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
}

/**
 * Clears the emulator, then stores the live content and both managers' roles.
 * @param env The emulator environment.
 * @returns A client for each kind of person.
 */
export async function seedManagers(env: RulesTestEnvironment): Promise<IClients> {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      ...Object.entries(home).map(([section, body]) =>
        setDoc(doc(db, `home/${section}`), Array.isArray(body) ? { _items: body } : body),
      ),
      setDoc(doc(db, 'site/config'), siteConfig),
      setDoc(doc(db, `roles/${MANAGER_UID}`), managerRole()),
      setDoc(doc(db, `roles/${NO_UPLOADS_UID}`), managerRole({ pages: {}, uploads: false })),
    ]);
  });
  const client = (uid: string, email = `${uid}@taalyatra.in`): Firestore =>
    env.authenticatedContext(uid, { email }).firestore() as unknown as Firestore;
  return {
    owner: client(OWNER_UID, OWNER_EMAIL),
    manager: client(MANAGER_UID, MANAGER_EMAIL),
    noUploads: client(NO_UPLOADS_UID),
    member: client('someone-else'),
  };
}

/** @returns A draft as the editor saves it for the manager. */
export function managerDraft(path: string, change: Fields = {}): Fields {
  return {
    path,
    content: { title: 'Changed' },
    savedAt: SAVED_AT,
    savedBy: MANAGER_UID,
    ...change,
  };
}

/** @returns A request for approval as the manager sends it. */
export function approvalRequest(change: Fields = {}): Fields {
  return {
    by: MANAGER_UID,
    email: MANAGER_EMAIL,
    paths: ['home/offer'],
    note: 'New festival dates',
    sentAt: SAVED_AT,
    status: 'waiting',
    ...change,
  };
}
