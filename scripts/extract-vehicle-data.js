/**
 * Parses evox.csv and generates src/lib/campaigns/vehicle-data.ts
 * with normalized make -> model -> imageUrl mappings.
 *
 * Run: node scripts/extract-vehicle-data.js
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const csvPath = path.join(root, "evox.csv");
const outPath = path.join(root, "src", "lib", "campaigns", "vehicle-data.ts");

if (!fs.existsSync(csvPath)) {
  console.error("evox.csv not found at project root.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// CSV helpers — handles quoted fields with commas/newlines
// ---------------------------------------------------------------------------

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

const MAKE_NORMALIZE_MAP = {
  bmw: "BMW",
  "bmw sav": "BMW",
  chevrolet: "Chevrolet",
  "chevrolet truck": "Chevrolet",
  celebrity: "Chevrolet",
  ford: "Ford",
  "ford truck": "Ford",
  honda: "Honda",
  "honda truck": "Honda",
  toyota: "Toyota",
  "toyota truck": "Toyota",
};

function normalizeMake(raw) {
  const key = raw.trim().toLowerCase();
  return MAKE_NORMALIZE_MAP[key] || null;
}

const BASE_MODEL_MAP = {
  "3 series": "3 Series",
  "3-series": "3 Series",
  "4 series": "4 Series",
  "4-series gran coupe": "4 Series",
  "5 series": "5 Series",
  "7 series": "7 Series",
  "7-series": "7 Series",
  m340i: "3 Series",
  ix: "iX",
  x1: "X1",
  x3: "X3",
  x5: "X5",
  x6: "X6",
  x7: "X7",

  silverado: "Silverado 1500",
  "silverado 1500": "Silverado 1500",
  "silverado 1500 ltd": "Silverado 1500",
  "silverado k1500": "Silverado 1500",
  "silverado 2500hd": "Silverado 2500HD",
  "silverado 2500": "Silverado 2500HD",
  "silverado 2500h": "Silverado 2500HD",
  "silverado 3500hd": "Silverado 3500HD",
  "silverado 3500 hd crew ca": "Silverado 3500HD",
  "silverado 3500hd cc": "Silverado 3500HD",
  "silverado 3500": "Silverado 3500HD",
  "silverado 3500 chassis cab": "Silverado 3500HD",
  colorado: "Colorado",
  corvette: "Corvette",
  "corvette stingray": "Corvette",
  equinox: "Equinox",
  "equinox activ": "Equinox",
  "equinox lt": "Equinox",
  "equinox ev": "Equinox EV",
  "equinox ev lt 2": "Equinox EV",
  suburban: "Suburban",
  tahoe: "Tahoe",
  trax: "Trax",

  "f-150": "F-150",
  "f-150 series": "F-150",
  "f-250": "F-250",
  "f-250sd": "F-250",
  "f-250 super duty": "F-250",
  "f-250 s-dty": "F-250",
  f250: "F-250",
  "s-dty f-250": "F-250",
  "super duty f-250 srw": "F-250",
  "super duty f-25": "F-250",
  "f-450sd": "F-450",
  "f-450 super duty": "F-450",
  "super duty f-45": "F-450",
  "super duty f-450 drw": "F-450",
  bronco: "Bronco",
  "bronco 2-door": "Bronco",
  "bronco 4-door": "Bronco",
  "bronco sport": "Bronco Sport",
  escape: "Escape",
  "escape s": "Escape",
  expedition: "Expedition",
  "expedition el": "Expedition",
  "expedition max": "Expedition Max",
  explorer: "Explorer",
  "mustang mach-e": "Mustang Mach-E",

  civic: "Civic",
  "civic hybrid": "Civic",
  "civic hatchback": "Civic",
  "civic hatchback hybrid": "Civic",
  "civic hatch hyb": "Civic",
  "civic fhev": "Civic",
  "civic si": "Civic",
  "civic type r": "Civic Type R",
  accord: "Accord",
  "accord hybrid": "Accord",
  "accord fhev": "Accord",
  "cr-v": "CR-V",
  "cr-v hybrid": "CR-V",
  "cr-v fhev": "CR-V",
  "cr v": "CR-V",
  "cr v ex l": "CR-V",
  "cr-v exl": "CR-V",
  crv: "CR-V",
  "hr-v": "HR-V",
  hrv: "HR-V",
  odyssey: "Odyssey",
  passport: "Passport",
  pilot: "Pilot",
  prologue: "Prologue",
  ridgeline: "Ridgeline",

  camry: "Camry",
  "camry hybrid": "Camry",
  "camry xse": "Camry",
  corolla: "Corolla",
  "corolla le": "Corolla",
  "corolla (2.0l)": "Corolla",
  rav4: "RAV4",
  "rav4 hybrid": "RAV4",
  "rav4 le": "RAV4",
  "rav4 plug-in hybrid": "RAV4",
  "rav4 prime": "RAV4",
  "4runner": "4Runner",
  highlander: "Highlander",
  "highlander hybrid (2.5l)": "Highlander",
  "highlander limited": "Highlander",
  tacoma: "Tacoma",
  "tacoma (2.4l)": "Tacoma",
  "tacoma (3.5l)": "Tacoma",
  "tacoma 2wd": "Tacoma",
  "tacoma 4wd": "Tacoma",
  "tacoma trd sport": "Tacoma",
  tundra: "Tundra",
  "tundra (3.4l)": "Tundra",
  "tundra 2wd": "Tundra",
  "tundra 4wd": "Tundra",
  "tundra hybrid": "Tundra",
  sequoia: "Sequoia",
  "crown signia": "Crown Signia",
  bz4x: "bZ4X",
  bz: "bZ4X",
};

function normalizeModel(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const key = trimmed.toLowerCase();
  if (BASE_MODEL_MAP[key]) return BASE_MODEL_MAP[key];

  // Drop suffixes that look like trim-level descriptions (long strings with spaces)
  // e.g. "CAMRY SEDAN 4D LE 2.4L I4" -> try to match prefix
  for (const [prefix, normalized] of Object.entries(BASE_MODEL_MAP)) {
    if (key.startsWith(prefix + " ")) return normalized;
  }

  // Title-case fallback for unknown models
  return trimmed
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ---------------------------------------------------------------------------
// Parse CSV and build map
// ---------------------------------------------------------------------------

console.log("Reading evox.csv...");
const raw = fs.readFileSync(csvPath, "utf8");
const lines = raw.split("\n");
const header = parseCsvLine(lines[0]);

const makeIdx = header.indexOf("make");
const modelIdx = header.indexOf("model");
const imageIdx = header.indexOf("image_side_640");

if (makeIdx === -1 || modelIdx === -1 || imageIdx === -1) {
  console.error("Required columns not found. Found:", header.slice(0, 10));
  process.exit(1);
}

console.log(
  `Columns: make=${makeIdx}, model=${modelIdx}, image_side_640=${imageIdx}`
);

// make -> model -> imageUrl
const vehicleMap = {};
let processedRows = 0;
let skippedRows = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const fields = parseCsvLine(line);
  const rawMake = fields[makeIdx] || "";
  const rawModel = fields[modelIdx] || "";
  const imageUrl = fields[imageIdx] || "";

  const make = normalizeMake(rawMake);
  if (!make) {
    skippedRows++;
    continue;
  }

  const model = normalizeModel(rawModel);
  if (!model) {
    skippedRows++;
    continue;
  }

  if (!vehicleMap[make]) vehicleMap[make] = {};

  if (
    !vehicleMap[make][model] &&
    imageUrl.startsWith("https://")
  ) {
    vehicleMap[make][model] = imageUrl;
    processedRows++;
  } else if (!vehicleMap[make][model]) {
    vehicleMap[make][model] = "";
    processedRows++;
  }
}

// ---------------------------------------------------------------------------
// Build sorted output
// ---------------------------------------------------------------------------

const sortedMakes = Object.keys(vehicleMap).sort();

const modelsMap = {};
for (const make of sortedMakes) {
  modelsMap[make] = Object.entries(vehicleMap[make])
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([model, imageUrl]) => ({ model, imageUrl }));
}

console.log(`\nExtracted:`);
for (const make of sortedMakes) {
  console.log(`  ${make}: ${modelsMap[make].length} models`);
}
console.log(`Total processed: ${processedRows}, skipped: ${skippedRows}`);

// ---------------------------------------------------------------------------
// Write TypeScript module
// ---------------------------------------------------------------------------

const makesLiteral = JSON.stringify(sortedMakes, null, 2);

const modelsEntries = sortedMakes
  .map((make) => {
    const items = modelsMap[make]
      .map(
        ({ model, imageUrl }) =>
          `    { model: ${JSON.stringify(model)}, imageUrl: ${JSON.stringify(imageUrl)} }`
      )
      .join(",\n");
    return `  ${JSON.stringify(make)}: [\n${items},\n  ]`;
  })
  .join(",\n");

const tsContent = `// Auto-generated by scripts/extract-vehicle-data.js — do not edit manually.

export interface VehicleModel {
  model: string;
  imageUrl: string;
}

export const VEHICLE_MAKES: string[] = ${makesLiteral};

export const VEHICLE_MODELS_BY_MAKE: Record<string, VehicleModel[]> = {
${modelsEntries},
};
`;

fs.writeFileSync(outPath, tsContent, "utf8");
console.log(`\nWrote ${outPath}`);
