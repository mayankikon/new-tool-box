/**
 * Generates src/app/layout-primitives.css from Figma design-tokens (radius, spacing, stroke).
 * Run: npm run tokens:layout
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const radiusPath = path.join(root, "design-tokens", "radius.json");
const spacingPath = path.join(root, "design-tokens", "spacing.json");
const strokePath = path.join(root, "design-tokens", "stroke.json");
const outPath = path.join(root, "src", "app", "layout-primitives.css");

for (const p of [radiusPath, spacingPath, strokePath]) {
  if (!fs.existsSync(p)) {
    console.error("Missing:", p);
    process.exit(1);
  }
}

const radius = JSON.parse(fs.readFileSync(radiusPath, "utf8"));
const spacing = JSON.parse(fs.readFileSync(spacingPath, "utf8"));
const stroke = JSON.parse(fs.readFileSync(strokePath, "utf8"));

const modeRadius = "12:0";
const modeSpacing = Object.keys(spacing.modes || {})[0] || "14:3";
const modeStroke = Object.keys(stroke.modes || {})[0] || "14:5";

function getVal(v, mode) {
  return v.valuesByMode?.[mode] ?? v.resolvedValuesByMode?.[mode]?.resolvedValue;
}

function cssName(prefix, name) {
  const slug = String(name).replace(/\//g, "-");
  return prefix ? `--${prefix}-${slug}` : `--${slug}`;
}

const lines = [
  "/* Layout primitives from Figma design-tokens (radius, spacing, stroke) */",
  "/* Regenerate with: npm run tokens:layout */",
  "",
  ":root {",
];

// Radius (Default mode)
radius.variables.forEach((v) => {
  const val = getVal(v, modeRadius);
  if (val == null) return;
  const name = cssName("radius", v.name);
  const px = Number(val);
  lines.push(`  ${name}: ${px}px;`);
});

// Spacing (use spacing-0 for "none" for Tailwind compatibility)
spacing.variables.forEach((v) => {
  const val = getVal(v, modeSpacing);
  if (val == null) return;
  const token = v.name === "none" ? "0" : v.name;
  const name = `--spacing-${token}`;
  const px = Number(val);
  lines.push(`  ${name}: ${px}px;`);
});

// Stroke (border width)
stroke.variables.forEach((v) => {
  const val = getVal(v, modeStroke);
  if (val == null) return;
  const name = v.name === "default" ? "--stroke-default" : cssName("stroke", v.name);
  const px = Number(val);
  lines.push(`  ${name}: ${px}px;`);
});

lines.push("}");
lines.push("");

fs.writeFileSync(outPath, lines.join("\n"));
console.log("Wrote layout primitives (radius, spacing, stroke) to src/app/layout-primitives.css");
