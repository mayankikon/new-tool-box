/**
 * Single SVG `d` for the file-cabinet table card outline stroke (y-down SVG coords).
 * Two open subpaths meet at (rBL, h): (1) bottom → right → right notch, (2) left notch → left → BL arc.
 * Stroke is centered on the former 1px border box (same geometry as CSS border-radius clip).
 */

export function snapToCssPixel(value: number, dpr: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (!Number.isFinite(dpr) || dpr <= 0) {
    return value;
  }
  return Math.round(value * dpr) / dpr;
}

/** Treat seam as “on the top edge” for TL/TR quarter circles. */
const SEAM_FLAT_EPS = 0.75;

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(3);
}

function pushL(parts: string[], x1: number, y1: number, x2: number, y2: number): void {
  if (x1 !== x2 || y1 !== y2) {
    parts.push(`L ${fmt(x2)},${fmt(y2)}`);
  }
}

/**
 * Left end X of horizontal notch at seamY (tab side → corner), when rTL > 0.
 */
export function xLeftStartForTopStroke(seamY: number, rTL: number): number {
  if (rTL <= 0) {
    return 0;
  }
  const y = Math.max(0, seamY);
  if (y <= 0) {
    return rTL;
  }
  if (y >= rTL) {
    return 0;
  }
  const inner = rTL * rTL - (rTL - y) * (rTL - y);
  return rTL - Math.sqrt(Math.max(0, inner));
}

export function xRightEndForTopStroke(seamY: number, w: number, rTR: number): number {
  if (rTR <= 0) {
    return w;
  }
  const y = Math.max(0, seamY);
  if (y <= 0) {
    return w - rTR;
  }
  if (y >= rTR) {
    return w;
  }
  const inner = rTR * rTR - (rTR - y) * (rTR - y);
  return w - rTR + Math.sqrt(Math.max(0, inner));
}

export interface ActiveTabStrokeParams {
  /** Active tab edges in chrome-root SVG space (origin = file-cabinet root top-left). */
  tabL: number;
  tabR: number;
  tabT: number;
  /** Tab bottom Y in root space (= card top + seam in card-local terms). */
  seamY: number;
  /** Inset (CSS px) for seam stubs; use `0` so the card gap meets tab verticals without a 1px nub. */
  join: number;
  /** Top corner radii on the folder tab (both corners; card may use square TL separately). */
  rTL: number;
  rTR: number;
  dpr: number;
}

/**
 * Open path: seam stub → left vertical + TL arc → top → TR arc → right vertical → seam stub.
 * Intentionally **no** stroke along the open bottom between the tab verticals (file-cabinet merge with card).
 */
export function buildActiveTabFolderStrokeD(p: ActiveTabStrokeParams): string {
  const { tabL: l0, tabR: r0, tabT: t0, dpr } = p;
  const join = snapToCssPixel(p.join, dpr);
  const s = snapToCssPixel(Math.max(0, p.seamY), dpr);
  const l = snapToCssPixel(l0, dpr);
  const r = snapToCssPixel(r0, dpr);
  const t = snapToCssPixel(t0, dpr);
  const rTL = snapToCssPixel(Math.max(0, p.rTL), dpr);
  const rTR = snapToCssPixel(Math.max(0, p.rTR), dpr);

  if (r <= l || s <= t) {
    return "";
  }

  const tLJoin = Math.min(l + join, r);
  const tRJoin = Math.max(l, r - join);

  const parts: string[] = [];

  parts.push(`M ${fmt(tLJoin)},${fmt(s)}`);
  pushL(parts, tLJoin, s, l, s);

  let xTop: number;
  if (rTL > 0) {
    pushL(parts, l, s, l, t + rTL);
    parts.push(`A ${fmt(rTL)} ${fmt(rTL)} 0 0 1 ${fmt(l + rTL)},${fmt(t)}`);
    xTop = l + rTL;
  } else {
    pushL(parts, l, s, l, t);
    xTop = l;
  }

  if (rTR > 0) {
    pushL(parts, xTop, t, r - rTR, t);
    parts.push(`A ${fmt(rTR)} ${fmt(rTR)} 0 0 1 ${fmt(r)},${fmt(t + rTR)}`);
    pushL(parts, r, t + rTR, r, s);
  } else {
    pushL(parts, xTop, t, r, t);
    pushL(parts, r, t, r, s);
  }

  pushL(parts, r, s, tRJoin, s);

  return parts.join(" ");
}

export interface OutlinePathParams {
  w: number;
  h: number;
  seamY: number;
  /**
   * When true, `seamY` is used as-is (after clamp to ≥0) without snapping. Use when the seam was
   * derived from a single root-space snap (`seamYRoot − cardTop`) so the stroked edge matches the
   * active tab outline after `translate(0, cardTop)`.
   */
  seamYSkipSnap?: boolean;
  tL: number;
  tR: number;
  join: number;
  rTL: number;
  rTR: number;
  rBL: number;
  rBR: number;
  activeIndex: number;
  dpr: number;
}

export interface FileCabinetCardOutlinePathOptions {
  /** Add to every Y in the path so the outline can live in chrome-root SVG space (Phase 3 single stroke). */
  originY?: number;
}

function pushLWithOriginY(
  parts: string[],
  originY: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  pushL(parts, x1, y1 + originY, x2, y2 + originY);
}

/**
 * Clockwise outline as two stroked subpaths with an intentional gap above the tab row.
 * Card-local space: `originY` omitted or 0. Root space: pass `originY: cardTop` and render without a `<g>` translate.
 */
export function buildFileCabinetCardOutlinePathD(
  p: OutlinePathParams,
  options?: FileCabinetCardOutlinePathOptions,
): string {
  const { w, h, activeIndex, dpr } = p;
  const originY = options?.originY ?? 0;
  const yf = (y: number) => fmt(y + originY);

  if (w <= 0 || h <= 0) {
    return "";
  }

  const seamY = p.seamYSkipSnap
    ? Math.max(0, p.seamY)
    : snapToCssPixel(Math.max(0, p.seamY), dpr);
  const join = snapToCssPixel(p.join, dpr);
  const tL = snapToCssPixel(p.tL, dpr);
  const tR = snapToCssPixel(p.tR, dpr);
  const rTL = snapToCssPixel(Math.max(0, p.rTL), dpr);
  const rTR = snapToCssPixel(Math.max(0, p.rTR), dpr);
  const rBL = snapToCssPixel(Math.max(0, p.rBL), dpr);
  const rBR = snapToCssPixel(Math.max(0, p.rBR), dpr);

  const xLS = snapToCssPixel(xLeftStartForTopStroke(seamY, rTL), dpr);
  const xRE = snapToCssPixel(xRightEndForTopStroke(seamY, w, rTR), dpr);
  const seamFlat = seamY < SEAM_FLAT_EPS;

  const tLJoin = Math.min(tL + join, w);
  const tRJoin = Math.max(0, tR - join);

  const sub1: string[] = [];
  const sub2: string[] = [];

  // --- Subpath 1: (rBL,h) → bottom → BR → right → top → right notch end (tRJoin, seamY) ---
  sub1.push(`M ${fmt(rBL)},${yf(h)}`);
  pushLWithOriginY(sub1, originY, rBL, h, w - rBR, h);
  // sweep 0: outer convex quarter (sweep 1 traced the complementary arc → concave corners).
  sub1.push(`A ${fmt(rBR)} ${fmt(rBR)} 0 0 0 ${fmt(w)},${yf(h - rBR)}`);

  if (seamFlat && rTR > 0) {
    pushLWithOriginY(sub1, originY, w, h - rBR, w, rTR);
    sub1.push(`A ${fmt(rTR)} ${fmt(rTR)} 0 0 0 ${fmt(w - rTR)},${yf(0)}`);
    // seamY≈0 ⇒ xRE === w−rTR; run along y=0 to the active tab’s outer join
    pushLWithOriginY(sub1, originY, w - rTR, 0, tRJoin, 0);
  } else if (seamFlat && rTR <= 0) {
    pushLWithOriginY(sub1, originY, w, h - rBR, w, 0);
    pushLWithOriginY(sub1, originY, w, 0, xRE, 0);
    pushLWithOriginY(sub1, originY, xRE, 0, tRJoin, 0);
  } else {
    pushLWithOriginY(sub1, originY, w, h - rBR, w, seamY);
    if (xRE > tRJoin) {
      pushLWithOriginY(sub1, originY, w, seamY, xRE, seamY);
      pushLWithOriginY(sub1, originY, xRE, seamY, tRJoin, seamY);
    } else {
      pushLWithOriginY(sub1, originY, w, seamY, tRJoin, seamY);
    }
  }

  // --- Subpath 2: (tLJoin, seamY) → left notch → left side → BL arc → (rBL, h) ---
  const ySeam = seamFlat ? 0 : seamY;

  if (activeIndex > 0) {
    if (seamFlat && rTL > 0) {
      sub2.push(`M ${fmt(tLJoin)},${yf(0)}`);
      if (tLJoin !== rTL) {
        pushLWithOriginY(sub2, originY, tLJoin, 0, rTL, 0);
      }
      sub2.push(`A ${fmt(rTL)} ${fmt(rTL)} 0 0 0 ${fmt(0)},${yf(rTL)}`);
      pushLWithOriginY(sub2, originY, 0, rTL, 0, h - rBL);
    } else if (seamFlat && rTL <= 0) {
      sub2.push(`M ${fmt(tLJoin)},${yf(0)}`);
      pushLWithOriginY(sub2, originY, tLJoin, 0, 0, 0);
      pushLWithOriginY(sub2, originY, 0, 0, 0, h - rBL);
    } else {
      sub2.push(`M ${fmt(tLJoin)},${yf(seamY)}`);
      const xAfterLeftNotch = tLJoin > xLS ? xLS : tLJoin;
      if (tLJoin > xLS) {
        pushLWithOriginY(sub2, originY, tLJoin, seamY, xLS, seamY);
      }
      pushLWithOriginY(sub2, originY, xAfterLeftNotch, seamY, 0, seamY);
      pushLWithOriginY(sub2, originY, 0, seamY, 0, h - rBL);
    }
  } else {
    sub2.push(`M ${fmt(0)},${yf(ySeam)}`);
    pushLWithOriginY(sub2, originY, 0, ySeam, 0, h - rBL);
  }

  sub2.push(`A ${fmt(rBL)} ${fmt(rBL)} 0 0 0 ${fmt(rBL)},${yf(h)}`);

  return `${sub1.join(" ")} ${sub2.join(" ")}`;
}
