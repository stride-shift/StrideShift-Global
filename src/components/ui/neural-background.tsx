import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface NeuralBackgroundProps {
  className?: string;
  /** Override particle colour. Defaults: blue in light mode, gold in dark mode. */
  color?: string;
  /** Override the trail fade colour ('white' or 'black' alpha). Auto by theme. */
  trailColor?: 'auto' | 'white' | 'black';
  /** 0–1, lower = longer trails. */
  trailOpacity?: number;
  /** Number of particles in the field. */
  particleCount?: number;
  /** Animation speed multiplier. */
  speed?: number;
}

/**
 * Neural field — a flow-noise particle background that reacts to the cursor.
 * Light mode: blue dots on white, white trail fade.
 * Dark mode:  gold dots on black, black trail fade.
 *
 * The container is `relative` and fills its parent. Drop it absolutely inside
 * a `position: relative` parent and overlay content with `relative z-10`.
 */
export function NeuralBackground({
  className,
  color,
  trailColor = 'auto',
  trailOpacity,
  particleCount = 600,
  speed = 1,
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const resolvedColor = color ?? (isDark ? '#FFD700' : '#2563eb');
  const resolvedTrailRgb =
    trailColor === 'white'
      ? '255, 255, 255'
      : trailColor === 'black'
      ? '0, 0, 0'
      : isDark
      ? '0, 0, 0'
      : '255, 255, 255';
  const resolvedTrailOpacity = trailOpacity ?? (isDark ? 0.1 : 0.08);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles: Particle[] = [];
    let animationFrameId = 0;
    const mouse = { x: -1000, y: -1000 };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      age: number;
      life: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
      }

      update() {
        const angle =
          (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;

        this.vx += Math.cos(angle) * 0.2 * speed;
        this.vy += Math.sin(angle) * 0.2 * speed;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 150;

        if (distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          this.vx -= dx * force * 0.05;
          this.vy -= dy * force * 0.05;
        }

        this.x += this.vx;
        this.y += this.vy;

        this.vx *= 0.95;
        this.vy *= 0.95;

        this.age++;

        if (this.age > this.life) {
          this.reset();
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = resolvedColor;
        const alpha = 1 - Math.abs(this.age / this.life - 0.5) * 2;
        context.globalAlpha = alpha;
        context.fillRect(this.x, this.y, 1.5, 1.5);
      }
    }

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.fillStyle = `rgba(${resolvedTrailRgb}, ${resolvedTrailOpacity})`;
      ctx.fillRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    // ResizeObserver so the canvas tracks its parent (not just window resize).
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    init();
    animate();

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      ro.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedColor, resolvedTrailRgb, resolvedTrailOpacity, particleCount, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden',
        isDark ? 'bg-black' : 'bg-white',
        className
      )}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

export default NeuralBackground;
