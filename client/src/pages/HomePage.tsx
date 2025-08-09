import HeroVisual from '../ui/graphics/HeroVisual';
import Reveal from '../ui/animate/Reveal';

export default function HomePage() {
  return (
    <section className="grid md:grid-cols-2 gap-10 items-center mt-8 md:mt-12">
      <div className="space-y-5">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Claim Your Future, One Airdrop at a Time
          </h1>
        </Reveal>
        <Reveal delayMs={80}>
          <p className="text-white/70 max-w-prose">
            Stay ahead of the game with a sleek, next-gen dashboard designed for true crypto hunters.
            Track every airdrop, faucet, and whitelist in style — complete daily tasks, never miss a claim, and jump to official links instantly.
          </p>
        </Reveal>
        <Reveal delayMs={140}>
          <div className="flex gap-3">
            <a href="/airdrops" className="btn btn-primary">Explore Airdrops</a>
            <a href="/faucets" className="btn">Browse Faucets</a>
          </div>
        </Reveal>
      </div>
      <Reveal from="right" delayMs={120} className="p-0 overflow-hidden ml-auto pr-2">
        <HeroVisual />
      </Reveal>
    </section>
  );
}


