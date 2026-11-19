// Draws every Mermaid diagram in the repository's Markdown with Mermaid itself, in headless
// Chromium, and fails when one doesn't render. A diagram can look fine as text and still break
// on GitHub (a `;` inside a message ends the line, for example), so this runs in `npm run verify`.
//
//   npm run check:diagrams
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const FENCE = '```';
const MERMAID_FENCE = '```mermaid';

/** @returns Every Markdown file git knows of, committed or new, never ignored ones. */
function markdownFiles() {
  const list = (args) =>
    execFileSync('git', ['ls-files', ...args, '*.md'], { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  return [...new Set([...list([]), ...list(['--others', '--exclude-standard'])])];
}

/** @returns Each diagram in a file, with the line its fence opens on. */
function diagramsIn(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const diagrams = [];
  let start = -1;
  lines.forEach((line, index) => {
    const text = line.trim();
    if (start < 0 && text.startsWith(MERMAID_FENCE)) {
      start = index;
    } else if (start >= 0 && text.startsWith(FENCE)) {
      diagrams.push({ file, line: start + 1, code: lines.slice(start + 1, index).join('\n') });
      start = -1;
    }
  });
  return diagrams;
}

const diagrams = markdownFiles().flatMap(diagramsIn);
const mermaidScript = join(
  dirname(createRequire(import.meta.url).resolve('mermaid/package.json')),
  'dist/mermaid.min.js',
);

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ path: mermaidScript });
  const failures = await page.evaluate(async (all) => {
    globalThis.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
    const found = [];
    for (const [index, diagram] of all.entries()) {
      try {
        await globalThis.mermaid.render(`diagram-${String(index)}`, diagram.code);
      } catch (error) {
        const message = String(error?.message ?? error)
          .split('\n')
          .slice(0, 3)
          .join(' | ');
        found.push(`${diagram.file}:${String(diagram.line)} ${message}`);
      }
    }
    return found;
  }, diagrams);
  for (const failure of failures) {
    console.error(failure);
  }
  console.log(`${String(diagrams.length)} diagrams checked, ${String(failures.length)} broken.`);
  process.exitCode = failures.length > 0 ? 1 : 0;
} finally {
  await browser.close();
}
