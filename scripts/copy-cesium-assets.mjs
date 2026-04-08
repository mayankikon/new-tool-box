#!/usr/bin/env node
/**
 * Copies Cesium static assets (Workers, Assets, ThirdParty, Widgets) into public/cesium
 * so `CESIUM_BASE_URL = "/cesium/"` resolves at runtime. Run after `npm install`.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcDir = path.join(root, "node_modules", "cesium", "Build", "Cesium");
const destDir = path.join(root, "public", "cesium");

const DIRS = ["Assets", "ThirdParty", "Workers", "Widgets"];

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyDirRecursive(from, to) {
  await fs.mkdir(to, { recursive: true });
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(from, entry.name);
    const destPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  if (!(await pathExists(srcDir))) {
    console.warn(`[copy-cesium-assets] Skip: missing ${srcDir} (run npm install).`);
    process.exit(0);
  }

  await fs.mkdir(destDir, { recursive: true });

  for (const name of DIRS) {
    const src = path.join(srcDir, name);
    if (await pathExists(src)) {
      await copyDirRecursive(src, path.join(destDir, name));
    }
  }

  console.log(`[copy-cesium-assets] Copied Cesium ${DIRS.join(", ")} → ${destDir}`);
}

await main();
