/** Storage technology behind `IHttpBackend`, chosen per environment. */
export enum BackendType {
  /** Local JSON data (`fake-db.json`) — development, demos and e2e tests. */
  Fake = 'fake',
  /** A REST API reached through Angular's `HttpClient`. */
  Rest = 'rest',
}
