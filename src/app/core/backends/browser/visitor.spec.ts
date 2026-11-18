import { deviceFor, mayReport } from './visitor';

describe('visitor', () => {
  const view = (path = '/', navigator: object = {}) =>
    ({
      location: { pathname: path },
      navigator: { userAgent: 'Mozilla/5.0', ...navigator },
    }) as unknown as Window;

  it.each(['/', '/shows', '/videos', '/team', '/achievements'])(
    'should report a visit to %s',
    (path) => {
      expect(mayReport(view(path))).toBe(true);
    },
  );

  it.each([
    ['a page not counted', view('/admin')],
    ['do not track', view('/', { doNotTrack: '1' })],
    ['Global Privacy Control', view('/', { globalPrivacyControl: true })],
    ['a browser driven by a script', view('/', { webdriver: true })],
    ['a search robot', view('/', { userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)' })],
  ])('should not report %s', (_case, window) => {
    expect(mayReport(window)).toBe(false);
  });

  it.each([
    [620, 'phone'],
    [621, 'tablet'],
    [1001, 'desktop'],
  ])('should call a %i px wide screen a %s', (width, device) => {
    expect(deviceFor(width)).toBe(device);
  });
});
