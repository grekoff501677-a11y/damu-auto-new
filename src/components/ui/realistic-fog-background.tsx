"use client"

import { useEffect, useRef } from "react"

/**
 * Realistic fog / mist background (WebGL fbm shader), adapted to live INSIDE a
 * container (not fixed fullscreen) and tuned to the Damu Auto palette
 * (deep oceanic navy + faint gold mist). Responsive via ResizeObserver and
 * pauses on prefers-reduced-motion.
 */
type RGB = [number, number, number]

type Props = {
  className?: string
  speed?: number
  /** 0..1 base navy */
  colorBase?: RGB
  /** 0..1 lighter mist */
  colorMist?: RGB
  /** 0..1 warm accent */
  colorAccent?: RGB
}

const VS = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const FS = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_base;
uniform vec3 u_mist;
uniform vec3 u_accent;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uvr = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv = uvr; uv.x *= aspect;

  vec2 q = vec2(fbm(uv + 0.07 * u_time), fbm(uv + vec2(1.0)));
  vec2 r = vec2(
    fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.12 * u_time),
    fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.10 * u_time)
  );
  float f = fbm(uv + r);

  // dense mist — less squaring keeps mid-tones, brighter contrast
  float d = clamp(pow(f, 1.1) * 1.7, 0.0, 1.0);
  vec3 color = mix(u_base, u_mist, d);
  color = mix(color, u_accent, clamp(dot(q, r) * 0.55, 0.0, 1.0));

  // ── light source breaking through the fog (upper-centre) ──
  vec2 lp = vec2(0.5 * aspect, 0.74);
  float ld = distance(uv, lp);
  float light = smoothstep(0.95, 0.0, ld);
  vec3 lightCol = vec3(0.62, 0.50, 0.30);          // warm gold beam
  color += light * (0.14 + 0.40 * f) * lightCol;   // volumetric: brighter where mist is thick

  // gentle center lift
  color += smoothstep(0.9, 0.1, length(uvr - 0.5)) * 0.03 * u_accent;

  color *= 1.12;
  gl_FragColor = vec4(color, 1.0);
}
`

// stable module-level defaults so the effect doesn't recreate the GL context each render
const DEFAULT_BASE: RGB = [0.024, 0.082, 0.130]   // #061521
const DEFAULT_MIST: RGB = [0.11, 0.22, 0.31]      // clearly lighter navy → visible swirls
const DEFAULT_ACCENT: RGB = [0.40, 0.31, 0.15]    // gold

export function FogBackground({
  className = "absolute inset-0",
  speed = 1,
  colorBase = DEFAULT_BASE,
  colorMist = DEFAULT_MIST,
  colorAccent = DEFAULT_ACCENT,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false })
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VS))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(program); gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, "u_time")
    const uRes = gl.getUniformLocation(program, "u_resolution")
    gl.uniform3fv(gl.getUniformLocation(program, "u_base"), colorBase)
    gl.uniform3fv(gl.getUniformLocation(program, "u_mist"), colorMist)
    gl.uniform3fv(gl.getUniformLocation(program, "u_accent"), colorAccent)

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const resize = () => {
      const w = Math.max(1, Math.round((parent?.clientWidth ?? 300) * dpr))
      const h = Math.max(1, Math.round((parent?.clientHeight ?? 200) * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    resize()
    const ro = parent ? new ResizeObserver(resize) : undefined
    if (parent) ro!.observe(parent)

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const draw = (t: number) => {
      gl.uniform1f(uTime, t * 0.001 * speed)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    if (reduce) {
      draw(0)
    } else {
      const loop = (t: number) => { draw(t); rafRef.current = requestAnimationFrame(loop) }
      rafRef.current = requestAnimationFrame(loop)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro?.disconnect()
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
    }
  }, [speed, colorBase, colorMist, colorAccent])

  return <canvas ref={canvasRef} className={className} style={{ display: "block", width: "100%", height: "100%" }} />
}

export default FogBackground
