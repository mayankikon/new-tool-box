# Telemetry LED capsule (VFD-style WebGL)

## Purpose

Vintage vacuum fluorescent display (VFD) green glow effect for `telemetry-deck-tabs` (`capsuleImpl="vfd"`). Mimics 1980s/1990s car dashboard displays: mint green phosphor, scanlines, horizontal bloom anisotropy, and layered light spill.

## Implementation

- **Component**: `src/components/ui/dashboard-led-capsule-webgl.tsx`
- **Tones / fallbacks**: `src/components/ui/telemetry-led-tones.ts`
- **Integration**: `src/components/ui/telemetry-deck-tabs.tsx` (`capsuleImpl="vfd"`, per-tab `ledTone`)

## VFD shader (Shadertoy-style)

The fragment pass uses:

1. **Capsule SDF** — distance to a line segment with circular caps (2D capsule aligned to the bar width).
2. **Scanline texture** — horizontal line pattern overlay (coarse + fine) for VFD hardware feel.
3. **Anisotropic bloom** — horizontal-stretched glow (`glowHoriz` + `glowVert`) mimicking phosphor light spread.
4. **Layered light spill** — tight bloom + wide airy halo + breathing animation (`sin(time)`).
5. **White-green core** — bright center (0.95, 1.0, 0.92) with mint-tinted outer layers.
6. **Pulse** — subtle `sin(time)` on emissive intensity when `lit` (disabled when `prefers-reduced-motion: reduce`).

Uniforms map Shadertoy-style inputs to WebGL:

| Shadertoy | WebGL uniform |
|-----------|----------------|
| `iResolution.xy` | `u_resolution` |
| `iTime` | `u_time` |

Quad uses `attribute vec2 a_position` and `gl_FragCoord` (no `mainImage` entrypoint).

## Fallback

If WebGL context or program creation fails, the component renders the same **CSS capsule** classes as the default telemetry strip (tone-aware, with enhanced outer glow shadows for VFD tone).
