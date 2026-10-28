import { FirestorePath } from './firestore-path';
import { FirestorePathKind } from './firestore-path-kind.enum';

describe('FirestorePath', () => {
  it('should point at a document when the path has two segments', () => {
    const path = FirestorePath.parse('home/hero');

    expect(path?.kind).toBe(FirestorePathKind.Document);
    expect(path?.path).toBe('home/hero');
  });

  it('should name the collection a document belongs to', () => {
    expect(FirestorePath.parse('home/hero')?.parent).toBe('home');
  });

  it('should point at a collection when the path has one segment', () => {
    expect(FirestorePath.parse('videos')?.kind).toBe(FirestorePathKind.Collection);
  });

  it('should drop leading, trailing and doubled slashes', () => {
    expect(FirestorePath.parse('/home//drumCircle/')?.path).toBe('home/drumCircle');
  });

  it.each(['', '/', 'home/..', 'home/a.b', 'home/hero?x=1', 'home/he ro'])(
    'should reject %j when it is empty or has an unsafe segment',
    (path) => {
      expect(FirestorePath.parse(path)).toBeNull();
    },
  );
});
