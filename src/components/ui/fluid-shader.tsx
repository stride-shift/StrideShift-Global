import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FluidShaderProps {
  className?: string;
  /** Palette — RGB triplets in 0–1 space, three brand colors. */
  colorA?: [number, number, number];
  colorB?: [number, number, number];
  colorC?: [number, number, number];
  /** Background color (ink). */
  bg?: [number, number, number];
  /** Animation speed multiplier. */
  speed?: number;
}

/**
 * WebGL2 fluid / aurora shader. A flowing field of FBM noise warped over
 * itself, painted with a 3-color palette plus a deep background. Cursor
 * influences the flow vector for subtle interactivity.
 *
 * Defaults to the StrideShift "Angle" palette: sky blue, sage green, gold,
 * over deep ink. All inputs are normalized RGB so dark-mode swaps are easy.
 */
const FluidShader = ({
  className,
  colorA = [0.36, 0.58, 0.74], // sky
  colorB = [0.49, 0.66, 0.49], // sage
  colorC = [0.86, 0.74, 0.43], // gold
  bg = [0.04, 0.06, 0.1],      // ink
  speed = 0.5,
}: FluidShaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const vertSrc = `#version 300 es
      in vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fragSrc = `#version 300 es
      precision highp float;

      uniform vec2  u_res;
      uniform float u_time;
      uniform vec2  u_mouse;
      uniform vec3  u_colorA;
      uniform vec3  u_colorB;
      uniform vec3  u_colorC;
      uniform vec3  u_bg;

      out vec4 outColor;

      // ---------- value noise (cheap, smooth) ----------
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // ---------- fractional brownian motion ----------
      float fbm(vec2 p) {
        float v = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 5; i++) {
          v += amp * noise(p);
          p *= 2.02;
          amp *= 0.5;
        }
        return v;
      }

      // ---------- domain-warped flow field ----------
      float flow(vec2 uv, float t) {
        vec2 q = vec2(fbm(uv + vec2(0.0, t * 0.18)),
                      fbm(uv + vec2(5.2, 1.3) + t * 0.22));
        vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7, 9.2) - t * 0.14),
                      fbm(uv + 4.0 * q + vec2(8.3, 2.8) + t * 0.18));
        return fbm(uv + 4.0 * r);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p  = (uv * 2.0 - 1.0);
        p.x *= u_res.x / u_res.y;

        float t = u_time * 0.18;

        // mouse pulls the field
        vec2 m = (u_mouse * 2.0 - 1.0);
        m.x *= u_res.x / u_res.y;
        vec2 toMouse = m - p;
        float md = length(toMouse);
        vec2 warp = toMouse * exp(-md * 1.8) * 0.45;

        float f = flow(p * 1.05 + warp, t);

        // 3-color gradient based on flow value
        vec3 col = mix(u_bg, u_colorA, smoothstep(0.30, 0.55, f));
        col      = mix(col,  u_colorB, smoothstep(0.50, 0.72, f));
        col      = mix(col,  u_colorC, smoothstep(0.74, 0.92, f) * 0.85);

        // vignette toward edges
        float vig = smoothstep(1.35, 0.25, length(p));
        col *= mix(0.55, 1.05, vig);

        // mouse hot-spot glow
        float glow = exp(-md * 2.6) * 0.35;
        col += u_colorC * glow * 0.6;

        // slight film grain — keeps it from looking plastic
        float g = (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.04;
        col += g;

        outColor = vec4(col, 1.0);
      }
    `;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn('Shader compile failed:', gl.getShaderInfoLog(sh));
      }
      return sh;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_res');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uA = gl.getUniformLocation(program, 'u_colorA');
    const uB = gl.getUniformLocation(program, 'u_colorB');
    const uC = gl.getUniformLocation(program, 'u_colorC');
    const uBg = gl.getUniformLocation(program, 'u_bg');

    gl.uniform3f(uA, ...colorA);
    gl.uniform3f(uB, ...colorB);
    gl.uniform3f(uC, ...colorC);
    gl.uniform3f(uBg, ...bg);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseRef.current.x = (e.clientX - rect.left) / rect.width;
      // GL y is bottom-up
      targetMouseRef.current.y = 1 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', resize);
    resize();

    const start = performance.now();
    const render = (now: number) => {
      // ease mouse for smooth tracking
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.08;

      gl.uniform1f(uTime, ((now - start) / 1000) * speed);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
    };
  }, [colorA, colorB, colorC, bg, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('block w-full h-full', className)}
      aria-hidden="true"
    />
  );
};

export default FluidShader;
