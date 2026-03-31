/**
 * Generates src/app/color-primitives.css from Figma Colors.json.
 * Run: npm run tokens:colors
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const colorsPath = path.join(root, "Colors.json");
const outPath = path.join(root, "src", "app", "color-primitives.css");

if (!fs.existsSync(colorsPath)) {
  console.error("Colors.json not found at project root.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(colorsPath, "utf8"));
const vars = data.variables;
const mode = Object.keys(data.modes || { "2:0": "Default" })[0] || "2:0";

function toRgba(v) {
  const r = Math.round((v.r ?? 0) * 255);
  const g = Math.round((v.g ?? 0) * 255);
  const b = Math.round((v.b ?? 0) * 255);
  const a = v.a !== undefined ? v.a : 1;
  if (a >= 0.999) return `rgb(${r} ${g} ${b})`;
  return `rgba(${r} ${g} ${b} / ${Number(a).toFixed(4)})`;
}

const solid = vars.filter(
  (v) => v.type === "COLOR" && !v.name.startsWith("transparent/")
);
const declarations = solid
  .map((v) => {
    const val =
      v.valuesByMode[mode] || v.resolvedValuesByMode?.[mode]?.resolvedValue;
    if (!val) return null;
    const name = "--" + v.name.replace(/\//g, "-");
    return `  ${name}: ${toRgba(val)};`;
  })
  .filter(Boolean);

const out = [
  "/* Color primitives from Figma Colors.json - do not edit by hand */",
  "/* Regenerate with: npm run tokens:colors */",
  "",
  ":root {",
  ...declarations,
  "}",
  "",
].join("\n");

fs.writeFileSync(outPath, out);
console.log(`Wrote ${solid.length} color primitives to src/app/color-primitives.css`);
