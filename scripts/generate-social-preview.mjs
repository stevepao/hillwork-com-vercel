import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const projectRoot = process.cwd();
const portraitPath = path.join(projectRoot, 'src', 'assets', 'images', 'portrait_stephen_pao.webp');
const outputDir = path.join(projectRoot, 'public');
const outputPath = path.join(outputDir, 'social-preview.jpg');

const width = 1200;
const height = 630;
const portraitWidth = 430;
const portraitHeight = 570;

await mkdir(outputDir, {recursive: true});

const portrait = await sharp(portraitPath)
  .resize({
    width: portraitWidth,
    height: portraitHeight,
    fit: 'cover',
    position: 'top',
  })
  .jpeg({quality: 90})
  .toBuffer();

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#faf9f5"/>
      <stop offset="100%" stop-color="#eee9df"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#background)"/>
  <circle cx="1050" cy="90" r="240" fill="#e7f4fb" opacity="0.85"/>
  <circle cx="160" cy="560" r="190" fill="#f0ece4" opacity="0.95"/>
  <rect x="70" y="70" width="1060" height="490" rx="42" fill="#ffffff" stroke="#e7e1d8" stroke-width="2"/>
  <text x="120" y="148" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" letter-spacing="5" fill="#8b8175">HILLWORK</text>
  <circle cx="318" cy="139" r="8" fill="#0ea5e9"/>
  <text x="120" y="244" font-family="Arial, Helvetica, sans-serif" font-size="60" font-weight="800" fill="#1c1917">Stephen Pao</text>
  <text x="120" y="314" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="700" fill="#44403c">Board Advisor · CEO Advisor</text>
  <text x="120" y="374" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="500" fill="#78716c">Operating experience for founders,</text>
  <text x="120" y="418" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="500" fill="#78716c">CEOs, and early-stage teams.</text>
  <text x="120" y="500" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" letter-spacing="3" fill="#0f172a">HILLWORK.US</text>
  <rect x="710" y="30" width="430" height="570" rx="34" fill="#e7e1d8"/>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([
    {
      input: portrait,
      left: 710,
      top: 30,
    },
  ])
  .jpeg({
    quality: 88,
    mozjpeg: true,
  })
  .toFile(outputPath);

console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
