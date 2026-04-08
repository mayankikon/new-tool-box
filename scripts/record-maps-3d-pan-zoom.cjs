/**
 * Records WebM of Design System → Foundations → Maps in 3D with pan + zoom-out.
 *
 * Prereqs: `npm run dev` on :3000, and Playwright browser:
 *   npm install -D playwright && npx playwright install chromium
 *
 * Usage:
 *   node scripts/record-maps-3d-pan-zoom.cjs
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "videos");
const outFile = "design-system-foundations-maps-3d-pan-zoom.webm";

fs.mkdirSync(outDir, { recursive: true });

async function dragPan(page, canvasLocator, { dx, dy, steps = 35 }) {
  const box = await canvasLocator.boundingBox();
  if (!box) return;
  const x0 = box.x + box.width * 0.42;
  const y0 = box.y + box.height * 0.4;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  await page.mouse.move(x0 + dx, y0 + dy, { steps });
  await page.mouse.up();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--ignore-gpu-blocklist", "--use-gl=angle", "--use-angle=swiftshader"],
  });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    recordVideo: { dir: outDir, size: { width: 1400, height: 900 } },
  });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/design-system/foundations/maps", {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });

  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: /Photorealistic 3D/i }).click();

  await page.getByText("Loading photorealistic 3D map…").waitFor({ state: "hidden", timeout: 120000 }).catch(() => {});

  const region = page.getByRole("application", { name: "Google Photorealistic 3D map preview" });
  const canvas = region.locator("canvas").first();
  await canvas.waitFor({ state: "visible", timeout: 120000 });

  await page.getByRole("button", { name: "Zoom out" }).waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(4000);

  for (let i = 0; i < 3; i++) {
    await dragPan(page, canvas, { dx: 260, dy: 50 });
    await page.waitForTimeout(700);
    await dragPan(page, canvas, { dx: -220, dy: -60 });
    await page.waitForTimeout(700);
  }

  const zoomOut = page.getByRole("button", { name: "Zoom out" });
  for (let z = 0; z < 5; z++) {
    if (await zoomOut.isDisabled()) break;
    await zoomOut.click();
    await page.waitForTimeout(500);
  }

  for (let i = 0; i < 4; i++) {
    await dragPan(page, canvas, { dx: 300, dy: -40 });
    await page.waitForTimeout(600);
    await dragPan(page, canvas, { dx: -280, dy: 70 });
    await page.waitForTimeout(600);
  }

  await page.waitForTimeout(4000);
  await context.close();
  await browser.close();

  const files = fs.readdirSync(outDir).filter((f) => f.endsWith(".webm"));
  const newest = files
    .map((f) => ({ f, t: fs.statSync(path.join(outDir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0];
  if (newest) {
    const from = path.join(outDir, newest.f);
    const to = path.join(outDir, outFile);
    if (from !== to) {
      try {
        fs.unlinkSync(to);
      } catch {
        /* ignore */
      }
      fs.renameSync(from, to);
    }
  }

  console.log("Saved:", path.join(outDir, outFile));
})();
