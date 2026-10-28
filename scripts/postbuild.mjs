// Post-processes the production build (0007). Runs after `npm run build` (npm "postbuild"):
//   1. fills %SITE_URL% in index.html (canonical and social tags read by link-preview scrapers);
//   2. adds <link rel="modulepreload"> for the Firestore chunk, so the SDK downloads in parallel
//      with main.js instead of after it (Angular already preloads the initial chunks this way);
//   3. writes robots.txt (admin disallowed) and sitemap.xml for the public pages.
// SITE_URL comes from the environment variable, else `siteUrl` in src/environments/environment.ts.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/taal-yatra/browser';
// Keep in step with the public routes in src/app/app.routes.ts (admin is never listed).
const PUBLIC_ROUTES = ['/', '/videos', '/team', '/shows', '/achievements'];
// A string only the Firestore SDK's chunk contains; finds it whatever its hashed file name.
const FIRESTORE_MARKER = 'firestore.googleapis.com';

function siteUrl() {
  const fromEnv = process.env.SITE_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  const environment = readFileSync('src/environments/environment.ts', 'utf8');
  const match = /siteUrl:\s*'([^']+)'/.exec(environment);
  if (!match) {
    throw new Error('siteUrl not found in src/environments/environment.ts');
  }
  return match[1];
}

function firestoreChunk() {
  const chunks = readdirSync(DIST).filter(
    (file) =>
      file.startsWith('chunk-') &&
      file.endsWith('.js') &&
      readFileSync(join(DIST, file), 'utf8').includes(FIRESTORE_MARKER),
  );
  if (chunks.length !== 1) {
    throw new Error(`Expected one Firestore chunk, found ${chunks.length}: ${chunks.join(', ')}`);
  }
  return chunks[0];
}

const url = siteUrl();
const indexPath = join(DIST, 'index.html');
const chunk = firestoreChunk();
let index = readFileSync(indexPath, 'utf8').replaceAll('%SITE_URL%', url);
if (!index.includes(`href="${chunk}"`)) {
  index = index.replace('</head>', `<link rel="modulepreload" href="${chunk}"></head>`);
}
writeFileSync(indexPath, index);

writeFileSync(
  join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${url}/sitemap.xml\n`,
);

const today = new Date().toISOString().slice(0, 10);
const entries = PUBLIC_ROUTES.map(
  (route) => `  <url><loc>${url}${route}</loc><lastmod>${today}</lastmod></url>`,
).join('\n');
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
);

console.log(`postbuild: site ${url}; modulepreload ${chunk}; robots.txt and sitemap.xml written.`);
