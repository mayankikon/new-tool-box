"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import {
  TELEMETRY_LED_OFF_RGB,
  TELEMETRY_LED_TONE_ACTIVE_FALLBACK,
  TELEMETRY_LED_TONE_RGB,
  type TelemetryDeckLedTone,
} from "@/components/ui/telemetry-led-tones";

const VERT_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/**
 * VFD-style capsule: vintage vacuum fluorescent display green glow with scanlines,
 * horizontal bloom anisotropy, and layered light spill.
 */
const FRAG_SRC = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_lit;
uniform vec3 u_color_on;
uniform vec3 u_color_off;

float capsuleDist(vec2 p, float halfLen, float rad) {
  p.x = abs(p.x);
  float dx = max(p.x - halfLen, 0.0);
  return length(vec2(dx, p.y)) - rad;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 r = max(u_resolution, vec2(1.0));
  vec2 p = fc - 0.5 * r;
  float halfLen = max(r.x * 0.5 - r.y * 0.5, 0.0);
  float rad = r.y * 0.5;
  float d = capsuleDist(p, halfLen, rad * 0.92);
  float capS = min(r.x, r.y);

  float pulse = 1.0;
  if (u_lit > 0.5) {
    pulse = 0.94 + 0.06 * sin(u_time * 5.5);
  }

  vec3 onCol = u_color_on * pulse;
  vec3 offCol = u_color_off;

  // VFD: scanline texture (subtle horizontal lines)
  float scanY = mod(fc.y, 3.0);
  float scanline = scanY < 1.5 ? 0.94 : 1.0;
  float scanlineFine = mod(fc.y * 0.7, 1.0) < 0.5 ? 0.98 : 1.0;
  scanline = scanline * scanlineFine;
  
  // Horizontal-stretched bloom (anisotropic) - mimics VFD phosphor glow
  vec2 glowDir = vec2(1.0, 0.25);
  float dHoriz = dot(normalize(glowDir), vec2(p.x * 0.8, p.y * 0.5));
  float glowHoriz = u_lit * (0.042 * capS / 48.0) / (abs(dHoriz) + 0.008 * capS / 48.0);
  float glowVert = u_lit * (0.024 * capS / 48.0) / (abs(d) + 0.006 * capS / 48.0);
  float glow = (glowHoriz * 1.85 + glowVert * 0.55) * 2.45;
  
  // Brighter white-green core (VFD phosphor center)
  float coreFill = smoothstep(0.005 * capS / 64.0, -0.009 * capS / 64.0, d);
  float fill = coreFill * scanline;

  // Layered light glow: tight bloom + wide airy halo
  float breathe = 0.86 + 0.14 * sin(u_time * 2.8);
  float glowWide = u_lit * (0.022 * capS / 48.0) / (abs(d) + 0.034 * capS / 48.0);
  float glowAiry = u_lit * (0.011 * capS / 48.0) / (abs(d) + 0.055 * capS / 48.0);
  
  vec3 vfdCore = vec3(0.95, 1.0, 0.92);
  vec3 mintHalo = vec3(0.38, 0.96, 0.74);
  vec3 mintOuter = vec3(0.18, 0.48, 0.32);
  
  vec3 col = mix(offCol, vfdCore, fill * u_lit * 0.88);
  col += mix(offCol, onCol, fill * u_lit * 0.12);
  col += glow * onCol * 0.92;
  col += glowWide * breathe * mintHalo * 0.62;
  col += glowAiry * mintOuter * 0.45;

  float yn = fc.y / r.y;
  float spec = exp(-pow((yn - 0.62) * 9.0, 2.0)) * fill * u_lit;
  col += vec3(spec * 0.62);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export interface DashboardLedCapsuleWebglProps {
  lit: boolean;
  /** Preset tone or explicit linear RGB 0–1 */
  tone?: TelemetryDeckLedTone;
  rgb?: [number, number, number];
  className?: string;
  /** Visually hidden label for a11y when used alone */
  label?: string;
}

/**
 * Horizontal dashboard-style LED capsule drawn with a tiny WebGL pass.
 * Falls back to an empty box if WebGL is unavailable (parent should handle fallback).
 */
export function DashboardLedCapsuleWebgl({
  lit,
  tone = "primary",
  rgb,
  className,
  label,
}: DashboardLedCapsuleWebglProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const glRef = React.useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    loc: {
      position: number;
      resolution: WebGLUniformLocation | null;
      time: WebGLUniformLocation | null;
      lit: WebGLUniformLocation | null;
      colorOn: WebGLUniformLocation | null;
      colorOff: WebGLUniformLocation | null;
    };
    buffer: WebGLBuffer;
  } | null>(null);
  const rafRef = React.useRef<number>(0);
  const reduceMotionRef = React.useRef(false);
  const [mounted, setMounted] = React.useState(false);
  const [webglReady, setWebglReady] = React.useState(false);

  const onRgb = rgb ?? TELEMETRY_LED_TONE_RGB[tone];

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
    const handleMq = () => {
      reduceMotionRef.current = mq.matches;
    };
    mq.addEventListener("change", handleMq);
    return () => mq.removeEventListener("change", handleMq);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) {
      setWebglReady(false);
      return;
    }

    const program = createProgram(gl);
    if (!program) {
      setWebglReady(false);
      return;
    }

    const positionLoc = gl.getAttribLocation(program, "a_position");
    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      setWebglReady(false);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    glRef.current = {
      gl,
      program,
      buffer,
      loc: {
        position: positionLoc,
        resolution: gl.getUniformLocation(program, "u_resolution"),
        time: gl.getUniformLocation(program, "u_time"),
        lit: gl.getUniformLocation(program, "u_lit"),
        colorOn: gl.getUniformLocation(program, "u_color_on"),
        colorOff: gl.getUniformLocation(program, "u_color_off"),
      },
    };
    setWebglReady(true);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      glRef.current = null;
      setWebglReady(false);
    };
  }, [mounted]);

  const drawFrame = React.useCallback(() => {
    const pack = glRef.current;
    const canvas = canvasRef.current;
    if (!pack || !canvas) return;

    const { gl, program, loc, buffer } = pack;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    gl.viewport(0, 0, w, h);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc.position);
    gl.vertexAttribPointer(loc.position, 2, gl.FLOAT, false, 0, 0);

    const t = reduceMotionRef.current ? 0 : performance.now() / 1000;
    if (loc.resolution) gl.uniform2f(loc.resolution, w, h);
    if (loc.time) gl.uniform1f(loc.time, t);
    if (loc.lit) gl.uniform1f(loc.lit, lit ? 1 : 0);
    if (loc.colorOn) gl.uniform3f(loc.colorOn, onRgb[0], onRgb[1], onRgb[2]);
    if (loc.colorOff) {
      gl.uniform3f(
        loc.colorOff,
        TELEMETRY_LED_OFF_RGB[0],
        TELEMETRY_LED_OFF_RGB[1],
        TELEMETRY_LED_OFF_RGB[2],
      );
    }

    gl.clearColor(0.06, 0.07, 0.09, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, [lit, onRgb]);

  React.useEffect(() => {
    if (!webglReady) return;
    drawFrame();
  }, [drawFrame, webglReady]);

  React.useEffect(() => {
    if (!webglReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      drawFrame();
    });
    ro.observe(canvas);

    const tick = () => {
      if (lit && !reduceMotionRef.current) {
        drawFrame();
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    if (lit && !reduceMotionRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame, lit, webglReady]);

  const ledOffShell =
    "border border-border/80 bg-muted-foreground/25 dark:border-border dark:bg-muted-foreground/20";

  if (!mounted) {
    return (
      <span className={cn("relative inline-flex h-full w-full", className)}>
        {label ? <span className="sr-only">{label}</span> : null}
        <span
          aria-hidden
          className={cn(
            "block h-full w-full rounded-full motion-reduce:transition-none",
            ledOffShell,
          )}
        />
      </span>
    );
  }

  if (!webglReady) {
    return (
      <span className={cn("relative inline-flex h-full w-full", className)}>
        {label ? <span className="sr-only">{label}</span> : null}
        <span
          aria-hidden
          className={cn(
            "block h-full w-full rounded-full transition-[background-color,box-shadow,border-color] duration-100 motion-reduce:transition-none",
            ledOffShell,
            lit && TELEMETRY_LED_TONE_ACTIVE_FALLBACK[tone],
          )}
        />
      </span>
    );
  }

  return (
    <span className={cn("relative inline-flex h-full w-full", className)}>
      {label ? <span className="sr-only">{label}</span> : null}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="block h-full w-full rounded-full"
      />
    </span>
  );
}
