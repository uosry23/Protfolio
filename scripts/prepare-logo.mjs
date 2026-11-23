/**
 * Processes the source logo into the assets the site ships with:
 *  - public/brand/ya-logo.png  → trimmed, web-optimised emblem
 *  - app/icon.png              → favicon
 *
 * Usage: node scripts/prepare-logo.mjs "<path to source png>"
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const source = process.argv[2];
if (!source) {
  console.error('\n✖ Usage: node scripts/prepare-logo.mjs "<path to logo png>"\n');
  process.exit(1);
}

const brandDir = path.join(root, 'public', 'brand');
await fs.mkdir(brandDir, { recursive: true });

/** Trim the transparent margins so the emblem fills its box. */
const trimmed = sharp(source).trim({ threshold: 8 });

const emblem = await trimmed
  .clone()
  .resize({ width: 720, withoutEnlargement: true })
  .png({ compressionLevel: 9, quality: 92 })
  .toBuffer();

await fs.writeFile(path.join(brandDir, 'ya-logo.png'), emblem);
console.log(`✓ public/brand/ya-logo.png  (${Math.round(emblem.length / 1024)} KB)`);

/* Favicon — same artwork on a dark plate so it reads on any browser chrome. */
const favicon = await sharp({
  create: { width: 256, height: 256, channels: 4, background: { r: 5, g: 10, b: 31, alpha: 1 } },
})
  .composite([
    { input: await trimmed.clone().resize({ width: 216, withoutEnlargement: true }).png().toBuffer() },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

await fs.writeFile(path.join(root, 'app', 'icon.png'), favicon);
console.log(`✓ app/icon.png  (${Math.round(favicon.length / 1024)} KB)`);

console.log('\n✔ Logo assets ready.\n');
