import { useEffect, useRef } from 'react';

/**
 * Subtle animated visual for the hero section.
 * Glowing gradient orb with rotating rings, matching the app's glass/neo look.
 */
export default function HeroVisual() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;

    type Orbit = {
      radiusRatio: number; // relative to min(width,height)
      eccentricity: number; // 0..0.9
      rotationSpeed: number; // radians per second (orbit plane rotation)
      electronSpeed: number; // radians per second (particle speed)
      thickness: number;
      tint: string; // stroke color base
      phase: number; // initial electron phase
    };

    const orbits: Orbit[] = [
      { radiusRatio: 0.26, eccentricity: 0.28, rotationSpeed: 0.12, electronSpeed: 0.9, thickness: 1.8, tint: 'rgba(140,240,255,', phase: 0.2 },
      { radiusRatio: 0.36, eccentricity: 0.38, rotationSpeed: -0.08, electronSpeed: 0.7, thickness: 2.2, tint: 'rgba(106,227,255,', phase: 1.6 },
      { radiusRatio: 0.46, eccentricity: 0.55, rotationSpeed: 0.06, electronSpeed: 0.55, thickness: 2.8, tint: 'rgba(120,230,255,', phase: 2.9 },
    ];

    function resize() {
      const { width, height } = canvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(ts: number) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const t = ts * 0.001; // seconds

      // Fully clear so background shows through (fix black box)
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.58; // scale up for larger visual

      // Nucleus glow
      const nucleusGrad = ctx.createRadialGradient(cx, cy, baseR * 0.08, cx, cy, baseR * 0.78);
      nucleusGrad.addColorStop(0, 'rgba(106,227,255,0.30)');
      nucleusGrad.addColorStop(1, 'rgba(106,227,255,0.01)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = nucleusGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.fill();

      // Soft nucleus core
      ctx.shadowBlur = 16;
      ctx.shadowColor = 'rgba(106,227,255,0.30)';
      ctx.fillStyle = 'rgba(106,227,255,0.04)';
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw orbits and electrons
      for (let i = 0; i < orbits.length; i++) {
        const o = orbits[i];
        const ringR = baseR * o.radiusRatio;
        const rx = ringR;
        const ry = ringR * (1 - o.eccentricity);

        // rotating plane angle
        const plane = t * o.rotationSpeed + i * 0.6;

        // ring stroke
        ctx.save();
        ctx.strokeStyle = `${o.tint}${0.12 - i * 0.02})`;
        ctx.lineWidth = o.thickness;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, plane, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // electron position on rotated ellipse
        const theta = t * o.electronSpeed + o.phase;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const cosP = Math.cos(plane);
        const sinP = Math.sin(plane);
        const localX = rx * cosT;
        const localY = ry * sinT;
        const ex = cx + localX * cosP - localY * sinP;
        const ey = cy + localX * sinP + localY * cosP;

        // trail
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const trailSteps = 8;
        for (let j = trailSteps; j >= 1; j--) {
          const back = theta - j * 0.04;
          const bx = rx * Math.cos(back);
          const by = ry * Math.sin(back);
          const px = cx + bx * cosP - by * sinP;
          const py = cy + bx * sinP + by * cosP;
          const alpha = 0.016 * (j / trailSteps);
          ctx.fillStyle = `${o.tint}${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // electron glow
        const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 10);
        grad.addColorStop(0, 'rgba(255,255,255,0.75)');
        grad.addColorStop(1, `${o.tint}0.0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Dusty particles around
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i < 14; i++) {
        const a = t * 0.2 + i * 0.35;
        const r = baseR * (0.95 + 0.08 * Math.sin(t * 0.7 + i));
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.66;
        ctx.beginPath();
        ctx.arc(x, y, 1.0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    }

    function loop(ts: number) {
      draw(ts);
      raf = requestAnimationFrame(loop);
    }

    resize();
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[420px] md:min-h-[520px]">
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}


