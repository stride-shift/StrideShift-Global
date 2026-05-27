import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Spectrum wave Three.js shader background — RGB-split sine waves.
 * Sized to fill its parent element.
 */
export function SpectrumShader({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color(0x03060d));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

    const uniforms = {
      resolution: { value: new THREE.Vector2(1, 1) },
      time: { value: 0.0 },
      xScale: { value: 1.0 },
      yScale: { value: 0.5 },
      distortion: { value: 0.045 },
    };

    const positions = new THREE.BufferAttribute(
      new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]),
      3
    );
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', positions);

    const material = new THREE.RawShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      vertexShader: `attribute vec3 position;void main(){gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        uniform float xScale;
        uniform float yScale;
        uniform float distortion;
        void main(){
          vec2 p=(gl_FragCoord.xy*2.0-resolution)/min(resolution.x,resolution.y);
          float d=length(p)*distortion;
          float rx=p.x*(1.0+d);
          float gx=p.x;
          float bx=p.x*(1.0-d);
          float r=0.045/abs(p.y+sin((rx+time)*xScale)*yScale);
          float g=0.045/abs(p.y+sin((gx+time)*xScale)*yScale);
          float b=0.045/abs(p.y+sin((bx+time)*xScale)*yScale);
          gl_FragColor=vec4(r*0.5,g*0.7,b*1.1,1.0);
        }`,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h, false);
      uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const animate = () => {
      uniforms.time.value += 0.01;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{ background: 'hsl(var(--stride-ink-deep))' }}
      aria-hidden="true"
    />
  );
}

export default SpectrumShader;
