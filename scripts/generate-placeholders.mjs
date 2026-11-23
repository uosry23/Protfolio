import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const content = JSON.parse(await fs.readFile(path.join(root, 'content/site.json'), 'utf8'));

const projectsDir = path.join(root, 'public', 'projects');
const imagesDir = path.join(root, 'public', 'images');

await fs.mkdir(projectsDir, { recursive: true });
await fs.mkdir(imagesDir, { recursive: true });

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      default:
        return '&quot;';
    }
  });
}

function gridSvg({ width, height, accent, monogram, label }) {
  const lines = [];
  for (let x = -height; x < width + height; x += 48) {
    lines.push(`<line x1="${x}" y1="0" x2="${x + height}" y2="${height}" stroke="rgba(232,241,255,0.05)" stroke-width="1"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#020512" />
      <stop offset="1" stop-color="#050a1f" />
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.35" r="0.75">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.42" />
      <stop offset="1" stop-color="${accent}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7AD9FF" />
      <stop offset="1" stop-color="#10BDF5" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  ${lines.join('\n  ')}
  <rect width="${width}" height="${height}" fill="url(#glow)" />
  <text x="50%" y="48%" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-size="${height * 0.34}" fill="url(#mark)" opacity="0.22">${escapeXml(monogram)}</text>
  <text x="50%" y="82%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(width * 0.045)}" letter-spacing="${Math.round(width * 0.012)}" fill="rgba(232,241,255,0.55)">${escapeXml(label.toUpperCase())}</text>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="rgba(232,241,255,0.14)" stroke-width="2" rx="18" />
</svg>`;
}

async function writeWebp(file, svg) {
  await sharp(Buffer.from(svg)).webp({ quality: 84 }).toFile(file);
  console.log(`✓ ${path.relative(root, file)}`);
}

/* Project covers */
for (const project of content.projects) {
  const monogram = project.title.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'YA';
  const svg = gridSvg({
    width: 1200,
    height: 1667,
    accent: project.accent,
    monogram,
    label: project.title,
  });
  await writeWebp(path.join(projectsDir, `${project.slug}.webp`), svg);
}

/* About portrait placeholder */
await writeWebp(
  path.join(imagesDir, 'about.webp'),
  gridSvg({
    width: 1200,
    height: 1500,
    accent: '#10bdf5',
    monogram: 'YA',
    label: 'Yousry Ahmed',
  }),
);

/* Fallback used when a project has no image yet */
await writeWebp(
  path.join(projectsDir, 'placeholder.webp'),
  gridSvg({ width: 1200, height: 1667, accent: '#10bdf5', monogram: 'YA', label: 'Project' }),
);

console.log('\nAll placeholder images generated.');
