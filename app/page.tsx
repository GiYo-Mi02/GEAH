"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, defaultPlayerState } from '@/lib/gameState';
import { setPlayerName, hasSavedSession, clearSession } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

// Deterministic array for particles to avoid Math.random during render
const PARTICLES = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  x: (i * 137.5) % 100, // Golden angle approximation for pseudo-random distribution
  y: (i * 93.1) % 100,
  scale: 0.5 + ((i * 11) % 50) / 100,
  duration: 10 + ((i * 17) % 10),
  delay: (i * 3) % 5,
}));

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Story', href: '#story' },
  { label: 'Team', href: '#team' },
  { label: 'Footer', href: '#footer' },
];

const TEAM = [
  {
    name: 'Gonzales Gio Joshua C.',
    role: 'Lead Developer / AI Engineer',
    photo: '/gonzales.jpg',
    quote: 'Architecting the intelligence behind every choice.',
  },
  {
    name: 'Tapada, John Kurt',
    role: 'Character Designer',
    photo: '/tapada.jpg',
    quote: 'Bringing faces and silhouettes to the abyss.',
  },
  {
    name: 'Torio Polaries Elis',
    role: 'UI/UX Designer',
    photo: '/torio.jpg',
    quote: 'Crafting the journey so every moment feels cinematic.',
  },
  {
    name: 'Villareal John Dave',
    role: 'Quality Assurance',
    photo: '/villareal.jpg',
    quote: 'Guarding the experience with relentless testing.',
  },
  {
    name: 'Cruz Kevin Ceasar',
    role: 'Backend Developer',
    photo: '/cruz.jpg',
    quote: 'Powering the systems that never break immersion.',
  },
  {
    name: 'Senados, Resty Emmanuel',
    role: 'System Designer',
    photo: '/senados.jpg',
    quote: 'Designing the rules that shape every outcome.',
  },
  {
    name: 'Delegencia Julian',
    role: 'Frontend Developer',
    photo: '/delegencia.jpg',
    quote: 'Turning vision into an interface you can feel.',
  },
];

export default function LandingPage() {
  const [name, setName] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const { dispatch } = useGame();
  const router = useRouter();
  const [lead, ...restTeam] = TEAM;
  const isMobile = useIsMobile();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [dismissedMobileModal, setDismissedMobileModal] = useState(false);

  // Mouse parallax tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 400 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const bgX = useTransform(smoothX, [-0.5, 0.5], ['-1%', '1%']);
  const bgY = useTransform(smoothY, [-0.5, 0.5], ['-1%', '1%']);

  // Check if Puter.js is loaded and if there's a saved session
  const checkPuterAndSession = useCallback(async () => {
    if (typeof window !== 'undefined' && window.puter) {
      setPuterReady(true);
      try {
        const saved = await hasSavedSession();
        setHasSaved(saved);
      } catch {
        // Puter.kv not available yet — that's fine
      }
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Check for saved session after Puter.js loads
    // Puter.js may take a moment to initialize
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.puter) {
        checkPuterAndSession();
        clearInterval(checkInterval);
      }
    }, 200);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(checkInterval);
    };
  }, [mouseX, mouseY, checkPuterAndSession]);

  useEffect(() => {
    if (isMobile && !dismissedMobileModal) {
      setShowMobileModal(true);
    } else {
      setShowMobileModal(false);
    }
  }, [isMobile, dismissedMobileModal]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    
    const playerName = name.trim() || 'Wanderer';

    // Clear any existing saved session for a fresh start
    if (puterReady) {
      await clearSession();
    }

    // Persist player name for the API layer
    setPlayerName(playerName);

    // Initialize player state
    dispatch({
      type: 'SET_PLAYER',
      payload: {
        ...defaultPlayerState,
        name: playerName,
      }
    });

    // Start transition
    setTimeout(() => {
      router.push('/game');
    }, 1500);
  };

  const handleContinue = async () => {
    setIsStarting(true);

    // Load saved session — game/page.tsx will pick it up from puter.kv via fetchScene('start')
    setTimeout(() => {
      router.push('/game');
    }, 1500);
  };

  return (
    <main className="relative min-h-screen bg-[var(--color-brand-bg)] text-[#e0d8d0] font-sans">
      {showMobileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-warning-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-black/70 p-8 text-center shadow-2xl"
          >
            <div className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-brand-accent)] font-bold">
              Recommended Device
            </div>
            <h2 id="mobile-warning-title" className="mt-4 font-serif text-2xl text-white/90">
              Best viewed on a laptop
            </h2>
            <p className="mt-4 text-sm text-white/65 leading-relaxed">
              You are using a small screen. For the full cinematic experience, we recommend viewing this site on a laptop or desktop.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="cinematic"
                onClick={() => {
                  setShowMobileModal(false);
                  setDismissedMobileModal(true);
                }}
              >
                Continue anyway
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      <section id="home" className="relative min-h-screen overflow-hidden">
        <motion.div
          className="absolute inset-[-5%] w-[110%] h-[110%] z-0 pointer-events-none"
          style={{ x: bgX, y: bgY }}
        >
          <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1033/1920/1080')] bg-cover bg-center opacity-20 mix-blend-overlay" />
          <div className="absolute w-full h-[60%] bottom-0 bg-gradient-to-t from-[#0a0502] via-[#0a0502]/80 to-transparent" />
          <div className="atmosphere transition-opacity duration-1000 opacity-60" />

          <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-1 h-1 rounded-full bg-orange-500/50"
                initial={{
                  x: `${p.x}vw`,
                  y: `${p.y}vh`,
                  scale: p.scale,
                }}
                animate={{
                  y: '-10vh',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'linear',
                }}
              />
            ))}
          </div>
        </motion.div>

        <header className="relative z-20 w-full">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm" />
              <div>
                <div className="text-xs uppercase tracking-[0.4em] text-[var(--color-brand-accent)] font-bold">
                  Project GEAH
                </div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-white/50">
                  Shadows of the Abyss
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-[0.35em] text-white/60">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <Button asChild variant="outline" size="sm" className="border-white/20 text-white/80 hover:text-white">
              <a href="#start">Play</a>
            </Button>
          </div>

          <div className="mx-auto mt-4 flex w-full max-w-6xl flex-wrap gap-3 px-6 text-[10px] uppercase tracking-[0.3em] text-white/50 md:hidden">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 pb-16 pt-20">
          <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              className="flex flex-col justify-center"
            >
              <div className="text-[10px] uppercase tracking-[0.5em] text-[var(--color-brand-accent)] font-bold">
                Interactive Dark Fantasy
              </div>
              <h1 className="mt-4 font-serif text-5xl md:text-7xl font-light tracking-tight drop-shadow-2xl text-[#e0d8d0]">
                Shadows of the <span className="italic text-white/60">Abyss</span>
              </h1>
              <p className="mt-6 text-base md:text-lg text-white/70 leading-relaxed max-w-xl">
                A branching narrative experience where every decision shapes morality, reputation, and the fate of a world on the edge of collapse.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 text-xs uppercase tracking-[0.35em] text-white/50">
                <div className="glass-panel rounded-2xl px-5 py-4">
                  Choice driven
                </div>
                <div className="glass-panel rounded-2xl px-5 py-4">
                  AI assisted epilogues
                </div>
                <div className="glass-panel rounded-2xl px-5 py-4">
                  Cinematic UI
                </div>
                <div className="glass-panel rounded-2xl px-5 py-4">
                  Player stats
                </div>
              </div>
            </motion.div>

            <motion.div
              id="start"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: isStarting ? 0 : 1, scale: isStarting ? 1.02 : 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="relative z-10 flex flex-col items-center justify-center p-8 w-full text-center glass-panel rounded-3xl"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--color-brand-accent)] mb-6 font-bold">
                Act 0 - Genesis
              </span>

              <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
                Begin the descent
              </h2>

              <div className="font-serif text-sm italic text-white/30 tracking-widest mt-2 mb-6">
                &quot;The darkness is not an end, but a beginning.&quot;
              </div>

              <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--color-brand-accent)] to-transparent my-4 opacity-50" />

              <form onSubmit={handleStart} className="flex flex-col w-full max-w-sm gap-6 mt-4">
                <input
                  type="text"
                  placeholder="Enter your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isStarting}
                  className="w-full bg-black/40 border-b border-white/20 text-center font-serif text-xl p-3 text-[#e0d8d0] placeholder:text-white/20 focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors disabled:opacity-50 tracking-wider"
                />

                <div className="relative mt-4 group">
                  <div className="absolute inset-0 bg-orange-600 rounded-md blur-md opacity-20 group-hover:opacity-40 animate-pulse transition-opacity duration-1000" />
                  <Button
                    type="submit"
                    variant="cinematic"
                    size="lg"
                    className="w-full relative"
                    disabled={isStarting}
                  >
                    {isStarting ? 'Entering the dark...' : 'Begin Journey'}
                  </Button>
                </div>

                {hasSaved && !isStarting && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <button
                      type="button"
                      onClick={handleContinue}
                      className="w-full text-center text-sm font-mono tracking-widest uppercase text-[var(--color-brand-accent)]/60 hover:text-[var(--color-brand-accent)] transition-colors duration-300 py-2"
                    >
                      Continue saved journey
                    </button>
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="about" className="relative py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 left-1/2 h-64 w-[600px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,78,0,0.18),transparent_70%)] opacity-60" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.5em] text-[var(--color-brand-accent)] font-bold">
                About
              </div>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl font-light tracking-tight">
                What is this website all about
              </h2>
            </div>
            <p className="max-w-md text-sm text-white/60 leading-relaxed">
              Project GEAH is a narrative playground built to immerse players in a cinematic dark fantasy world where every choice leaves a mark.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="glass-panel rounded-2xl p-8">
              <h3 className="font-serif text-2xl font-light">Immersive storytelling</h3>
              <p className="mt-4 text-sm text-white/70 leading-relaxed">
                We designed the experience to feel like a living novel, blending dialogue, atmosphere, and interactive consequences in every scene.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-8">
              <h3 className="font-serif text-2xl font-light">Player shaped outcomes</h3>
              <p className="mt-4 text-sm text-white/70 leading-relaxed">
                The UI surfaces morality, reputation, and health so players always understand the weight of their actions and the cost of survival.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="story" className="relative py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(255,78,0,0.12),transparent_60%)]" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.5em] text-[var(--color-brand-accent)] font-bold">
                Story
              </div>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl font-light tracking-tight">
                Story used and what we made
              </h2>
            </div>
            <p className="max-w-md text-sm text-white/60 leading-relaxed">
              We centered the experience around a single world and expanded it into an interactive system with UI, audio, and branching logic.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-8">
              <h3 className="font-serif text-2xl font-light">Story used</h3>
              <p className="mt-4 text-sm text-white/70 leading-relaxed">
                Shadows of the Abyss is a dark fantasy tale about a wanderer pulled into a cursed frontier where ancient powers demand a price for every answer.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-8">
              <h3 className="font-serif text-2xl font-light">What we made</h3>
              <p className="mt-4 text-sm text-white/70 leading-relaxed">
                We built an AI assisted story engine, a cinematic UI, and dynamic endings that reflect each player journey and the paths they chose.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="relative py-24">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.5em] text-[var(--color-brand-accent)] font-bold">
                Credits
              </div>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl font-light tracking-tight">
                Who developed it
              </h2>
            </div>
            <p className="max-w-md text-sm text-white/60 leading-relaxed">
              A cross functional team built the world, story systems, and immersive presentation.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <div className="rounded-3xl p-[1px] bg-gradient-to-b from-[var(--color-brand-accent)]/80 via-white/10 to-transparent w-full max-w-md">
              <div className="glass-panel rounded-3xl p-10 text-center border border-white/20 shadow-[0_0_30px_rgba(255,78,0,0.2)]">
                <div className="mx-auto mb-5 h-28 w-28 rounded-full overflow-hidden border border-[var(--color-brand-accent)]/60 shadow-[0_0_18px_rgba(255,78,0,0.4)]">
                <img
                  src={lead.photo}
                  alt={lead.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
                <div className="font-serif text-2xl text-white/95">{lead.name}</div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.4em] text-[var(--color-brand-accent)] font-bold">
                  {lead.role}
                </div>
                <p className="mt-4 text-sm text-white/65 italic">&quot;{lead.quote}&quot;</p>
                <div className="mt-4 text-[10px] uppercase tracking-[0.35em] text-white/50">
                  Lead of Project GEAH
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restTeam.map((member) => (
              <div key={member.name} className="glass-panel rounded-2xl p-7 text-center">
                <div className="mx-auto mb-4 h-24 w-24 rounded-full overflow-hidden border border-white/20">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="font-serif text-xl text-white/90">{member.name}</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.4em] text-[var(--color-brand-accent)] font-bold">
                  {member.role}
                </div>
                <p className="mt-3 text-sm text-white/60 italic">&quot;{member.quote}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="footer" className="relative border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-[var(--color-brand-accent)] font-bold">
              Project GEAH
            </div>
            <p className="mt-3 text-sm text-white/50">
              Shadows of the Abyss - an interactive story experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.35em] text-white/50">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
