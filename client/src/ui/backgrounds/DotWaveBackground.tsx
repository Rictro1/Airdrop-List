import { useEffect, useRef } from 'react';

export default function DotWaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animationFrame = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const spacing = 30;
      const amplitude = 10;
      const speed = 0.0016;
      const radius = 1.6;
      for (let x = -spacing; x < innerWidth + spacing; x += spacing) {
        for (let y = -spacing; y < innerHeight + spacing; y += spacing) {
          const offset = (x + y) * 0.02;
          const dy = Math.sin(t * speed + offset) * amplitude;
          const dx = Math.cos(t * speed + offset) * amplitude * 0.4;
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fill();
        }
      }
    }

    function loop(ts: number) {
      draw(ts);
      animationFrame = requestAnimationFrame(loop);
    }

    resize();
    animationFrame = requestAnimationFrame(loop);
    addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      removeEventListener('resize', resize);
    };
  }, []);

  return <canvas id="bg-canvas" ref={canvasRef} className="fixed inset-0 -z-50 pointer-events-none" />;
}


