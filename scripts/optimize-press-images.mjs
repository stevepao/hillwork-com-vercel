import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const projectRoot = process.cwd();
const sourceJsonPath = path.join(projectRoot, 'assets', 'pao-articles-press.json');
const outputDir = path.join(projectRoot, 'public', 'press');
const publicPathPrefix = '/press';
const maxWidth = 320;
const maxHeight = 160;
const fallbackImageUrls = new Map([
  [
    'https://www.eweek.com/astrostatic/35942529/_image/?href=%2F_astro%2Feweek.DRufo8xM.png&w=300&h=80&f=webp',
    'https://cdn.worldvectorlogo.com/logos/eweek.svg',
  ],
]);

const articles = JSON.parse(await readFile(sourceJsonPath, 'utf8'));

if (!Array.isArray(articles)) {
  throw new Error(`${sourceJsonPath} must contain an array of articles`);
}

await mkdir(outputDir, {recursive: true});

const imagePathByUrl = new Map();
const usedFilenames = new Set();

for (const article of articles) {
  if (!isArticle(article)) {
    throw new Error('Every article entry must be an object with image and publication fields');
  }

  if (!isRemoteUrl(article.image)) {
    continue;
  }

  if (!imagePathByUrl.has(article.image)) {
    const filename = uniqueFilename(slugify(article.publication), usedFilenames);
    const outputPath = path.join(outputDir, filename);
    const imageBuffer = await downloadImage(article.image);

    await sharp(imageBuffer, {animated: false, density: 144})
      .rotate()
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
        effort: 6,
      })
      .toFile(outputPath);

    imagePathByUrl.set(article.image, `${publicPathPrefix}/${filename}`);
    console.log(`Optimized ${article.publication} -> ${publicPathPrefix}/${filename}`);
  }

  article.image = imagePathByUrl.get(article.image);
}

await writeFile(sourceJsonPath, `${JSON.stringify(articles, null, 2)}\n`);
console.log(`Updated ${path.relative(projectRoot, sourceJsonPath)}`);

function isArticle(value) {
  return typeof value === 'object'
    && value !== null
    && typeof value.image === 'string'
    && typeof value.publication === 'string';
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value);
}

function slugify(value) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'press-image';
}

function uniqueFilename(baseSlug, used) {
  let filename = `${baseSlug}.webp`;
  let index = 2;

  while (used.has(filename)) {
    filename = `${baseSlug}-${index}.webp`;
    index += 1;
  }

  used.add(filename);
  return filename;
}

async function downloadImage(url) {
  const urls = [url];
  const fallbackUrl = fallbackImageUrls.get(url);

  if (fallbackUrl !== undefined) {
    urls.push(fallbackUrl);
  }

  const errors = [];

  for (const candidateUrl of urls) {
    try {
      return await fetchImage(candidateUrl);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(errors.join('; '));
}

async function fetchImage(url) {
  const urlOrigin = new URL(url).origin;
  const response = await fetch(url, {
    headers: {
      Accept: 'image/avif,image/webp,image/svg+xml,image/png,image/jpeg,image/*,*/*;q=0.8',
      Referer: `${urlOrigin}/`,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
