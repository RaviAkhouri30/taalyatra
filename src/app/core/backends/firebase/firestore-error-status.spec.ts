import { HttpStatusCode } from '@angular/common/http';
import { toHttpStatus } from './firestore-error-status';

describe('toHttpStatus', () => {
  it.each([
    ['unauthenticated', HttpStatusCode.Unauthorized],
    ['permission-denied', HttpStatusCode.Forbidden],
    ['not-found', HttpStatusCode.NotFound],
    ['already-exists', HttpStatusCode.Conflict],
    ['invalid-argument', HttpStatusCode.BadRequest],
    ['failed-precondition', HttpStatusCode.BadRequest],
    ['resource-exhausted', HttpStatusCode.TooManyRequests],
    ['unavailable', HttpStatusCode.ServiceUnavailable],
    ['deadline-exceeded', HttpStatusCode.GatewayTimeout],
  ])('should report %s as %i', (code, status) => {
    expect(toHttpStatus({ code })).toBe(status);
  });

  it.each([
    ['an unknown code', { code: 'cancelled' }],
    ['a non-string code', { code: 7 }],
    ['an error without a code', new Error('boom')],
    ['a non-object', 'boom'],
    ['null', null],
  ])('should report 500 for %s', (_case, error) => {
    expect(toHttpStatus(error)).toBe(HttpStatusCode.InternalServerError);
  });
});
