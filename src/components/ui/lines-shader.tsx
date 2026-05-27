import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Radial line-field Three.js shader background. Sized to fill its parent.
 * Adapted from a community shader-lines demo.
 */
export function LinesShader({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const camera = new THREE.Camera();
    camera.position.z = 1;
    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `void main(){gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}
        void main(void){
          vec2 uv=(gl_FragCoord.xy*2.0-resolution.xy)/min(resolution.x,resolution.y);
          float t=time*0.05+random(vec2(uv.x))*0.35;
          float lineWidth=0.0016;
          vec3 color=vec3(0.0);
          for(int j=0;j<3;j++){
            for(int i=0;i<5;i++){
              color[j]+=lineWidth*float(i*i)/abs(fract(t-0.012*float(j)+float(i)*0.012)*3.0-length(uv)+mod(uv.x+uv.y,0.25));
            }
          }
          gl_FragColor=vec4(color[2]*0.55,color[1]*0.75,color[0]*1.2,1.0);
        }`,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

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
      uniforms.time.value += 0.05;
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

export default LinesShader;
