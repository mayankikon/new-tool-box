/**
 * Splits `public/media/map-markers-source/Map Marker.svg` (Figma export) into standalone SVGs
 * under `public/media/map-markers/` with unique filter/clip IDs for safe inline use.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const srcPath = path.join(root, "public/media/map-markers-source/Map Marker.svg");
const outDir = path.join(root, "public/media/map-markers");

const raw = fs.readFileSync(srcPath, "utf8");
const noGuide = raw.replace(
  /<rect x="0\.5" y="0\.5"[^/]*\/>\s*/i,
  ""
);

const innerMatch = noGuide.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i);
if (!innerMatch) {
  console.error("Could not parse SVG");
  process.exit(1);
}
const inner = innerMatch[2];
const chunks = inner
  .split(/(?=<g filter="url\(#filter)/)
  .map((s) => s.trim())
  .filter(Boolean);

if (chunks.length !== 9) {
  console.error(`Expected 9 marker chunks, got ${chunks.length}`);
  process.exit(1);
}

const defsMatch = inner.match(/<defs>([\s\S]*)<\/defs>/i);
if (!defsMatch) {
  console.error("No defs");
  process.exit(1);
}
const defsBlock = defsMatch[1];

function extractFilterXml(filterIdBase) {
  const re = new RegExp(
    `<filter id="${filterIdBase}[^"]*"[^>]*>[\\s\\S]*?</filter>`,
    "i"
  );
  const m = defsBlock.match(re);
  return m ? m[0] : null;
}

function extractClipXml(clipIdBase) {
  const re = new RegExp(
    `<clipPath id="${clipIdBase}[^"]*"[^>]*>[\\s\\S]*?</clipPath>`,
    "i"
  );
  const m = defsBlock.match(re);
  return m ? m[0] : null;
}

/**
 * Each variant lives at a different Y in the master artboard. A single global viewBox
 * only showed the first row; the rest were clipped to empty.
 */
function viewBoxFromFilterXml(filterXml) {
  const open = filterXml.match(/<filter\b[^>]*>/i);
  if (!open) {
    return "0 0 48 48";
  }
  const tag = open[0];
  const num = (name) => {
    const m = tag.match(new RegExp(`${name}="([^"]+)"`, "i"));
    return m ? Number.parseFloat(m[1]) : NaN;
  };
  const x = num("x");
  const y = num("y");
  const width = num("width");
  const height = num("height");
  if ([x, y, width, height].some((n) => Number.isNaN(n))) {
    return "0 0 48 48";
  }
  const padX = 3;
  const padYTop = 3;
  const padYBottom = 8;
  return `${x - padX} ${y - padYTop} ${width + 2 * padX} ${height + padYTop + padYBottom}`;
}

const variants = [
  { file: "map-marker-number-default.svg", suffix: "mm_nd", filter: "filter0_di" },
  { file: "map-marker-number-active.svg", suffix: "mm_na", filter: "filter1_di" },
  { file: "map-marker-signal.svg", suffix: "mm_sig", filter: "filter2_di" },
  { file: "map-marker-signal-error.svg", suffix: "mm_sge", filter: "filter3_di" },
  { file: "map-marker-group.svg", suffix: "mm_grp", filter: "filter4_di" },
  { file: "map-marker-key.svg", suffix: "mm_key", filter: "filter5_di", clip: "clip0" },
  {
    file: "map-marker-vehicle-gold.svg",
    suffix: "mm_vg",
    filter: "filter6_d",
  },
  {
    file: "map-marker-vehicle-teal.svg",
    suffix: "mm_vt",
    filter: "filter7_d",
  },
  {
    file: "map-marker-vehicle-orange.svg",
    suffix: "mm_vo",
    filter: "filter8_d",
  },
];

fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < variants.length; i++) {
  const v = variants[i];
  const chunk = chunks[i];
  const filterXml = extractFilterXml(v.filter);
  if (!filterXml) {
    console.error(`Missing filter ${v.filter} for ${v.file}`);
    process.exit(1);
  }
  let clipXml = "";
  if (v.clip) {
    const c = extractClipXml(v.clip);
    if (!c) {
      console.error(`Missing clip ${v.clip}`);
      process.exit(1);
    }
    clipXml = c;
  }

  let body = chunk;
  let defsInner = filterXml + clipXml;

  const reId = /13830_98806/g;
  body = body.replace(reId, v.suffix);
  defsInner = defsInner.replace(reId, v.suffix);

  const viewBox = viewBoxFromFilterXml(filterXml);
  const out = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="48" height="48" fill="none">
${body}
<defs>
${defsInner}
</defs>
</svg>
`;

  fs.writeFileSync(path.join(outDir, v.file), out, "utf8");
  console.log("wrote", v.file);
}

console.log("Done. Output:", outDir);
