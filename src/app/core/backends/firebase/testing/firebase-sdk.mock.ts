/**
 * Stand-ins for `firebase/app` and `firebase/firestore/lite`, shared by every spec that mocks the
 * SDK. One definition matters: the coverage run shares modules between spec files, so two
 * different mocks of the same package would clash.
 */
export const firebaseAppMock = {
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
};

export const firestoreLiteMock = {
  getFirestore: vi.fn(() => ({ type: 'firestore' })),
  connectFirestoreEmulator: vi.fn(),
  doc: vi.fn((_db: unknown, path: string) => ({ path })),
  collection: vi.fn((_db: unknown, path: string) => ({ path })),
  query: vi.fn((reference: unknown, ...constraints: unknown[]) => ({ reference, constraints })),
  orderBy: vi.fn((field: string) => ({ orderBy: field })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
};

export const firebaseAuthMock = {
  getAuth: vi.fn(() => ({ type: 'auth' })),
  connectAuthEmulator: vi.fn(),
  onAuthStateChanged: vi.fn(() => () => undefined),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
};
