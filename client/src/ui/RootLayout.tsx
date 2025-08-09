import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Reveal from '../ui/animate/Reveal';
import DotWaveBackground from './backgrounds/DotWaveBackground';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/airdrops', label: 'Airdrop List' },
  { to: '/faucets', label: 'Faucet List' },
  { to: '/waitlists', label: 'Waitlist' },
];

export default function RootLayout() {
  const location = useLocation();
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <DotWaveBackground />
      <header className="app-container pt-6 md:pt-8">
        <div className="flex items-center justify-between gap-4">
          <Reveal from="left">
            <Link to="/" className="flex items-center gap-3">
              {imgOk ? (
                <img src={'/logo.png?v=' + Date.now()} onError={() => setImgOk(false)} alt="Airdrop List logo" className="w-12 h-12 rounded-full object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-500 to-indigo-500 grid place-items-center font-bold">A</div>
              )}
              <span className="text-2xl font-semibold tracking-wide">Airdrop List</span>
            </Link>
          </Reveal>
          <Reveal from="right" delayMs={90}>
            <nav className="ios-nav">
              {navItems.map(n => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) => `ios-tab${isActive ? ' is-active' : ''}`}
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </Reveal>
        </div>
      </header>
      <main className="app-container py-10 md:py-14">
        <Outlet />
      </main>
    </div>
  );
}


