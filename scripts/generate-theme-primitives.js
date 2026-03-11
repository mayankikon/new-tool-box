/**
 * Generates src/app/theme-primitives.css from Figma Themes.json.
 * Outputs semantic color tokens for light (Toolbox-Light) and dark (Toolbox-Dark) modes.
 * Run: npm run tokens:theme
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const themesPath = path.join(root, "Themes.json");
const outPath = path.join(root, "src", "app", "theme-primitives.css");

if (!fs.existsSync(themesPath)) {
  console.error("Themes.json not found at project root.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(themesPath, "utf8"));
const modes = data.modes || {};
const modeIds = Object.keys(modes);

// Use first mode as light, second as dark (assume Toolbox-Light, Toolbox-Dark order)
const lightMode = modeIds.find((id) => modes[id] && modes[id].toLowerCase().includes("light")) || modeIds[0];
const darkMode = modeIds.find((id) => modes[id] && modes[id].toLowerCase().includes("dark")) || modeIds[1];

function toRgba(v) {
  if (!v || typeof v !== "object") return "transparent";
  const r = Math.round((v.r ?? 0) * 255);
  const g = Math.round((v.g ?? 0) * 255);
  const b = Math.round((v.b ?? 0) * 255);
  const a = v.a !== undefined ? v.a : 1;
  if (a >= 0.999) return `rgb(${r} ${g} ${b})`;
  return `rgba(${r} ${g} ${b} / ${Number(a).toFixed(4)})`;
}

function varName(name) {
  return "--theme-" + name.replace(/\//g, "-");
}

const lines = [
  "/* Color theme primitives from Figma Themes.json - do not edit by hand */",
  "/* Regenerate with: npm run tokens:theme */",
  "/* Light theme: " + (modes[lightMode] || lightMode) + " */",
  "",
  ":root {",
];

data.variables.forEach((v) => {
  const resolved = v.resolvedValuesByMode?.[lightMode]?.resolvedValue;
  if (!resolved) return;
  const name = varName(v.name);
  lines.push(`  ${name}: ${toRgba(resolved)};`);
});

lines.push("}");
lines.push("");
lines.push("/* Dark theme: " + (modes[darkMode] || darkMode) + " */");
lines.push("");
lines.push(".dark {");
lines.push("");

data.variables.forEach((v) => {
  const resolved = v.resolvedValuesByMode?.[darkMode]?.resolvedValue;
  if (!resolved) return;
  const name = varName(v.name);
  lines.push(`  ${name}: ${toRgba(resolved)};`);
});

lines.push("}");
lines.push("");

fs.writeFileSync(outPath, lines.join("\n"));
console.log(
  "Wrote",
  data.variables.length,
  "theme tokens (light + dark) to src/app/theme-primitives.css"
);
