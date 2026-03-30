/**
 * One-off script to fetch a page and extract image URLs.
 * Uses web-scraping patterns: fetch with browser-like headers, parse img/source tags.
 * Run: node scripts/scrape-page-images.js <url>
 */

const url = process.argv[2] || 'https://halaskastudio.com/work/ethereal';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function main() {
  console.log('Fetching:', url);
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    console.error('HTTP', res.status, res.statusText);
    process.exit(1);
  }
  const html = await res.text();
  const base = new URL(url);

  const images = [];

  // <img src="..."> and srcset
  const imgRegex = /<img[^>]+>/gi;
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    const tag = m[0];
    const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    const srcsetMatch = tag.match(/\bsrcset\s*=\s*["']([^"']+)["']/i);
    if (srcMatch) images.push({ type: 'img', src: srcMatch[1] });
    if (srcsetMatch) {
      const entries = srcsetMatch[1].split(',').map((s) => s.trim().split(/\s+/)[0]);
      entries.forEach((src) => images.push({ type: 'img srcset', src }));
    }
  }

  // <source srcset="..."> (picture)
  const sourceRegex = /<source[^>]+>/gi;
  while ((m = sourceRegex.exec(html)) !== null) {
    const tag = m[0];
    const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    const srcsetMatch = tag.match(/\bsrcset\s*=\s*["']([^"']+)["']/i);
    if (srcMatch) images.push({ type: 'source', src: srcMatch[1] });
    if (srcsetMatch) {
      const entries = srcsetMatch[1].split(',').map((s) => s.trim().split(/\s+/)[0]);
      entries.forEach((src) => images.push({ type: 'source srcset', src }));
    }
  }

  // Resolve relative URLs
  const resolve = (src) => (src.startsWith('http') ? src : new URL(src, base).href);

  const unique = [...new Map(images.map((i) => [resolve(i.src), i])).values()];

  console.log('\nImages found:', unique.length);
  unique.forEach((img, i) => {
    console.log(`${i + 1}. [${img.type}] ${resolve(img.src)}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
