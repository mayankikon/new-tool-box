#!/usr/bin/env node
/**
 * Runs `next dev` with a sanitized NODE_OPTIONS and stale-lock cleanup.
 *
 * Default `npm run dev` passes `--webpack` because Turbopack can panic on this
 * repo (e.g. `/design-system`). Use `npm run dev:turbopack` to try Turbopack.
 *
 * - Strips broken `--localstorage-file` entries from NODE_OPTIONS (Node 25+).
 * - If `.next/dev/lock` exists but no process holds it (crashed dev), removes
 *   the lock so `next dev` can start. If something still holds the lock, exits
 *   with a clear message instead of a cryptic Next error.
 */
"use strict";

const { spawn, execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

function sanitizeEnv() {
  const env = { ...process.env };
  const raw = env.NODE_OPTIONS?.trim() ?? "";
  if (!raw) {
    return env;
  }
  const parts = raw.split(/\s+/).filter(Boolean);
  const filtered = parts.filter((p) => !p.startsWith("--localstorage-file"));
  if (filtered.length > 0) {
    env.NODE_OPTIONS = filtered.join(" ");
  } else {
    delete env.NODE_OPTIONS;
  }
  return env;
}

/**
 * @returns {boolean} false if a live dev server still holds the lock (caller should exit).
 */
function ensureDevLockIsFree() {
  const lockPath = path.join(process.cwd(), ".next", "dev", "lock");
  if (!fs.existsSync(lockPath)) {
    return true;
  }

  if (os.platform() === "win32") {
    console.warn(
      "[next-dev] .next/dev/lock exists. If `next dev` fails to start, delete it:\n" +
        "  del .next\\dev\\lock\n",
    );
    return true;
  }

  try {
    execFileSync("lsof", [lockPath], { stdio: "pipe" });
    console.error(
      "\n[next-dev] Another `next dev` is already running (lock: .next/dev/lock).\n" +
        "  Stop that process first, or use another clone/port.\n" +
        "  If it crashed, remove the lock:  rm -f .next/dev/lock\n",
    );
    return false;
  } catch {
    try {
      fs.unlinkSync(lockPath);
      console.warn(
        "[next-dev] Removed stale .next/dev/lock (previous dev exited without cleaning up).\n",
      );
    } catch (err) {
      console.warn(
        "[next-dev] Could not remove .next/dev/lock:",
        err instanceof Error ? err.message : err,
      );
    }
  }
  return true;
}

if (!ensureDevLockIsFree()) {
  process.exit(1);
}

const env = sanitizeEnv();
const nextBin = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

if (!fs.existsSync(nextBin)) {
  console.error(
    "[next-dev] Next.js CLI not found at:\n  " + nextBin + "\n  Run: npm install\n",
  );
  process.exit(1);
}

const forwardedArgs = process.argv.slice(2);

const child = spawn(process.execPath, [nextBin, "dev", ...forwardedArgs], {
  stdio: "inherit",
  env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code === null || code === undefined ? 1 : code);
});
