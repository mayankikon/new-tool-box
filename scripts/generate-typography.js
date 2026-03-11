/**
 * Generates src/app/typography-primitives.css from Figma Font Family.json and Font Size.json.
 * Run: npm run tokens:typography
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const fontFamilyPath = path.join(root, "Font Family.json");
const fontSizePath = path.join(root, "Font Size.json");
const outPath = path.join(root, "src", "app", "typography-primitives.css");

for (const p of [fontFamilyPath, fontSizePath]) {
  if (!fs.existsSync(p)) {
    console.error("Missing:", p);
    process.exit(1);
  }
}

const fontFamily = JSON.parse(fs.readFileSync(fontFamilyPath, "utf8"));
const fontSize = JSON.parse(fs.readFileSync(fontSizePath, "utf8"));

const modeFont = Object.keys(fontFamily.modes || {})[0] || "7017:0";
const modeDesktop = "18:0";
const modeMobile = "3978:0";

function getVal(v, mode) {
  return v.valuesByMode?.[mode] ?? v.resolvedValuesByMode?.[mode]?.resolvedValue;
}

const lines = [
  "/* Typography primitives from Figma Font Family.json + Font Size.json */",
  "/* Regenerate with: npm run tokens:typography */",
  "",
  ":root {",
];

// Font families (design token names; layout/globals wire to loaded fonts)
fontFamily.variables.forEach((v) => {
  const val = getVal(v, modeFont);
  if (val == null) return;
  const name = v.name.trim();
  const cssName = "--font-" + name;
  const family = String(val).trim();
  lines.push(`  ${cssName}: "${family}", ${name === "code" ? "monospace" : "sans-serif"};`);
});

// Font sizes (Desktop = default); exclude 7xl, 8xl, 9xl
const sizeExclude = new Set(["7xl", "8xl", "9xl"]);
const sizeVars = fontSize.variables.filter(
  (v) => v.name.startsWith("size/") && !sizeExclude.has(v.name.replace("size/", ""))
);
sizeVars.forEach((v) => {
  const d = getVal(v, modeDesktop);
  if (d == null) return;
  const token = v.name.replace("size/", "");
  const cssName = "--text-" + token;
  lines.push(`  ${cssName}: ${d}px;`);
});

// Font weights; exclude light, extrabold, black
const weightExclude = new Set(["light", "extrabold", "black"]);
const weightVars = fontSize.variables.filter(
  (v) => v.name.startsWith("weight/") && !weightExclude.has(v.name.replace("weight/", ""))
);
weightVars.forEach((v) => {
  const w = getVal(v, modeDesktop);
  if (w == null) return;
  const token = v.name.replace("weight/", "");
  lines.push(`  --font-weight-${token}: ${w};`);
});

// Line heights (keep only leading-5, leading-6, leading-7)
const leadingKeep = new Set(["leading-5", "leading-6", "leading-7"]);
const leadingVars = fontSize.variables.filter(
  (v) => v.name.startsWith("line-height/") && leadingKeep.has(v.name.replace("line-height/", ""))
);
leadingVars.forEach((v) => {
  const d = getVal(v, modeDesktop);
  if (d == null) return;
  const token = v.name.replace("line-height/", "");
  lines.push(`  --${token}: ${d}px;`);
});

// Letter spacing (Figma values as px)
const trackVars = fontSize.variables.filter((v) => v.name.startsWith("letter-spacing/"));
trackVars.forEach((v) => {
  const val = getVal(v, modeDesktop);
  if (val == null) return;
  const token = v.name.replace("letter-spacing/", "");
  const px = Number(val).toFixed(2);
  lines.push(`  --${token}: ${px}px;`);
});

lines.push("}");
lines.push("");

// Mobile overrides (only for tokens that differ between Desktop and Mobile)
const mobileOverrides = [];
sizeVars.forEach((v) => {
  const d = getVal(v, modeDesktop);
  const m = getVal(v, modeMobile);
  if (d != null && m != null && d !== m) {
    const token = v.name.replace("size/", "");
    if (sizeExclude.has(token)) return;
    mobileOverrides.push(`  --text-${token}: ${m}px;`);
  }
});
leadingVars.forEach((v) => {
  const d = getVal(v, modeDesktop);
  const m = getVal(v, modeMobile);
  if (d != null && m != null && d !== m) {
    const token = v.name.replace("line-height/", "");
    mobileOverrides.push(`  --${token}: ${m}px;`);
  }
});

if (mobileOverrides.length > 0) {
  lines.push("@media (max-width: 768px) {");
  lines.push("  :root {");
  lines.push(...mobileOverrides);
  lines.push("  }");
  lines.push("}");
  lines.push("");
}

fs.writeFileSync(outPath, lines.join("\n"));
console.log("Wrote typography primitives to src/app/typography-primitives.css");
