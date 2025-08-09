import { ReactNode, useEffect, useRef, useState } from 'react';

type RevealProps = {
  children: ReactNode;
  from?: 'up' | 'down' | 'left' | 'right';
  delayMs?: number;
  className?: string;
};

export default function Reveal({ children, from = 'up', delayMs = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Fallback: ensure we become visible even if IO doesn't fire (e.g., certain browsers/devtools)
    const fallbackId = window.setTimeout(() => setVisible(true), 250);

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            window.clearTimeout(fallbackId);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.01 }
    );
    obs.observe(node);
    return () => {
      window.clearTimeout(fallbackId);
      obs.disconnect();
    };
  }, []);

  const translateClass = (() => {
    switch (from) {
      case 'down':
        return 'translate-y-[-16px]';
      case 'left':
        return 'translate-x-[16px]';
      case 'right':
        return '-translate-x-[16px]';
      default:
        return 'translate-y-[16px]';
    }
  })();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={
        `will-change-transform will-change-opacity transition-all duration-700 ease-out ` +
        (visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${translateClass}`) +
        (className ? ` ${className}` : '')
      }
    >
      {children}
    </div>
  );
}


