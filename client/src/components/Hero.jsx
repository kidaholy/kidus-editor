import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, MessageCircle, Play, Clapperboard, Film, Zap } from 'lucide-react';

/* ─────────────────────────────────────
   Ambient background orb
───────────────────────────────────── */
function Orb({ color, size = 400, x, y, delay = 0 }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full blur-[100px]"
      style={{ width: size, height: size, left: x, top: y, background: color }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 10 + delay * 2, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/* ─────────────────────────────────────
   Floating spark particles
───────────────────────────────────── */
const SPARKS = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: `${3 + Math.random() * 94}%`,
  top: `${3 + Math.random() * 94}%`,
  size: 1.2 + Math.random() * 2.2,
  dur: 3.5 + Math.random() * 4,
  delay: Math.random() * 5,
  color: i % 3 === 0 ? 'rgba(34,197,94,0.7)' : i % 3 === 1 ? 'rgba(6,182,212,0.6)' : 'rgba(99,102,241,0.5)',
}));

function Sparks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {SPARKS.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, background: s.color }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────
   Cinematic headline word ticker
───────────────────────────────────── */
const SPECIALTIES = [
  'Hook Engineering',
  'Motion Graphics',
  'Kinetic Typography',
  'Retention Editing',
  'AE Expressions',
];

function SpecialtyTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SPECIALTIES.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative block" style={{ minHeight: '1.2em' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          className="gradient-text block"
          initial={{ y: 30, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -30, opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {SPECIALTIES[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─────────────────────────────────────
   Platform chip
───────────────────────────────────── */
function PlatformChip({ label, color }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider"
      style={{ borderColor: `${color}30`, color, background: `${color}10` }}
    >
      <span className="h-1 w-1 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ─────────────────────────────────────
   Glassmorphism photo frame
───────────────────────────────────── */
function PhotoFrame({ src }) {
  return (
    <div className="relative mx-auto w-fit">
      {/* Pulse rings */}
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="animate-pulse-ring absolute inset-0 rounded-full border"
          style={{
            borderColor: 'rgba(99,102,241,0.25)',
            animationDelay: `${n * 0.65}s`,
          }}
        />
      ))}

      {/* Spinning conic border */}
      <div
        className="animate-spin-slow absolute -inset-[3px] rounded-full"
        style={{
          background:
            'conic-gradient(from 0deg, #22c55e 0%, #06b6d4 25%, #6366f1 50%, #7c3aed 75%, #22c55e 100%)',
          filter: 'blur(1.5px)',
        }}
      />

      {/* Frame shell */}
      <div className="relative rounded-full border border-white/10 bg-slate-950 p-[3px]">
        <div className="relative h-60 w-60 overflow-hidden rounded-full sm:h-72 sm:w-72 lg:h-80 lg:w-80">
          {src ? (
            <img src={src} alt="Kidus" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-2"
              style={{
                background:
                  'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #0f2318 100%)',
              }}
            >
              {/* Clapperboard icon as stylish placeholder */}
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-full opacity-30 blur-xl"
                  style={{ background: 'radial-gradient(#22c55e, #6366f1)' }}
                />
                <Clapperboard size={56} className="relative text-neon" strokeWidth={1.2} />
              </div>
              <span
                className="font-display text-3xl font-bold"
                style={{
                  background: 'linear-gradient(120deg, #22c55e, #06b6d4, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ቅዱስ
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500">
                Kidus · Editor
              </span>
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: 'inset 0 0 50px rgba(0,0,0,0.55)' }}
          />
        </div>
      </div>

      {/* Floating: Available badge */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <span className="flex items-center gap-1.5 rounded-full border border-neon/35 bg-slate-950/95 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-neon shadow-glow backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
          Available for Editing Projects
        </span>
      </motion.div>

      {/* Floating: Premiere badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="absolute -right-6 top-8 hidden sm:block"
      >
        <span className="flex items-center gap-1.5 rounded-xl border border-violet-glow/30 bg-slate-950/90 px-3 py-2 font-mono text-[11px] font-semibold text-electric-400 shadow-glow-electric backdrop-blur-md">
          <Film size={12} /> Premiere Pro
        </span>
      </motion.div>

      {/* Floating: AE Expressions badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2.4 }}
        className="absolute -left-6 top-12 hidden sm:block"
      >
        <span className="flex items-center gap-1.5 rounded-xl border border-cyanx/30 bg-slate-950/90 px-3 py-2 font-mono text-[11px] font-semibold text-cyanx-400 shadow-glow-cyan backdrop-blur-md">
          <Zap size={12} /> AE Expressions
        </span>
      </motion.div>

      {/* Floating: JSX badge */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute -right-2 bottom-16 hidden lg:block"
      >
        <span className="flex items-center gap-1.5 rounded-xl border border-neon/25 bg-slate-950/90 px-3 py-2 font-mono text-[11px] font-semibold text-neon/80 backdrop-blur-md">
          <span className="font-bold text-neon">{'{ }'}</span> ExtendScript
        </span>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────
   Stat pill
───────────────────────────────────── */
function Stat({ value, suffix = '', label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <p className="font-display text-2xl font-bold text-ink sm:text-3xl">
        {value}
        <span className="text-neon">{suffix}</span>
      </p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   Main Hero
───────────────────────────────────── */
const ease = [0.25, 0.46, 0.45, 0.94];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
});

/*
 * ── TO ADD YOUR PHOTO ──────────────────────────────────────────
 * 1. Place your image in:  client/public/kidus.jpg  (or .png / .webp)
 * 2. Change the constant below:
 *      const PHOTO = '/kidus.jpg';
 * ──────────────────────────────────────────────────────────────
 */
const PHOTO = '';

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen overflow-hidden pb-24 pt-28 sm:pt-32 lg:pt-36"
    >
      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <Orb color="rgba(99,102,241,0.18)"  size={520} x="-8%"  y="-10%" delay={0}   />
        <Orb color="rgba(124,58,237,0.14)"  size={440} x="60%"  y="-5%"  delay={2.5} />
        <Orb color="rgba(34,197,94,0.10)"   size={380} x="10%"  y="60%"  delay={4}   />
        <Orb color="rgba(6,182,212,0.09)"   size={300} x="75%"  y="65%"  delay={1.8} />
      </div>
      <Sparks />

      <div className="container-x relative">
        {/* ── Main asymmetric grid ── */}
        <div className="grid items-center gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 xl:gap-24">

          {/* ── LEFT: Copy ── */}
          <div className="order-2 lg:order-1">

            {/* Label row */}
            <motion.div {...fadeUp(0.04)} className="mb-5 flex flex-wrap items-center gap-2">
              <span className="chip !border-neon/30 !text-neon">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
                ቅዱስ · Kidus
              </span>
              <span className="chip">Addis Ababa · Remote worldwide</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.12)}
              className="font-display font-bold leading-[1.08] tracking-tight text-ink"
              style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)' }}
            >
              Professional Video Editor
              <br />
              <span className="text-slate-400">&amp; Motion Graphics </span>
              <SpecialtyTicker />
            </motion.h1>

            {/* Sub-copy */}
            <motion.p {...fadeUp(0.22)} className="mt-6 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
              I craft{' '}
              <span className="font-semibold text-slate-200">high-retention short-form content</span>{' '}
              for TikTok, Reels &amp; Shorts and{' '}
              <span className="font-semibold text-slate-200">cinematic long-form YouTube</span>{' '}
              storytelling — powered by{' '}
              <span className="font-mono text-sm text-slate-300">Premiere Pro</span>,{' '}
              <span className="font-mono text-sm text-slate-300">CapCut</span> and{' '}
              <span className="font-mono text-sm text-slate-300">After Effects</span>{' '}
              with custom ExtendScript JSX automations I wrote myself.
            </motion.p>

            {/* Platform chips */}
            <motion.div {...fadeUp(0.28)} className="mt-5 flex flex-wrap gap-2">
              <PlatformChip label="TikTok" color="#22c55e" />
              <PlatformChip label="Reels" color="#818cf8" />
              <PlatformChip label="Shorts" color="#06b6d4" />
              <PlatformChip label="YouTube" color="#f87171" />
            </motion.div>

            {/* CTAs */}
            <motion.div {...fadeUp(0.34)} className="mt-9 flex flex-wrap gap-3">
              <a
                href="#work"
                className="btn-primary gap-2.5 !px-8 !py-3.5 !text-base font-bold tracking-wide shadow-glow"
              >
                <Play size={16} fill="currentColor" />
                Watch My Work
              </a>
              <a
                href="https://t.me/Kidajos"
                target="_blank"
                rel="noreferrer"
                className="btn gap-2.5 !border-electric-400/40 !bg-electric-500/10 !px-8 !py-3.5 !text-base !text-electric-300 shadow-glow-electric hover:!border-electric-400/80 hover:!bg-electric-500/20"
              >
                <MessageCircle size={16} />
                @Kidajos on Telegram
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              {...fadeUp(0.42)}
              className="mt-12 grid grid-cols-4 gap-4 border-t border-white/10 pt-8 sm:gap-8"
            >
              <Stat value="350" suffix="+" label="Edits shipped" />
              <Stat value="12"  suffix="M+" label="Views" />
              <Stat value="3"   suffix="+"  label="Years freelance" />
              <Stat value="JSX" label="AE scripted" />
            </motion.div>
          </div>

          {/* ── RIGHT: Photo ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.18, ease }}
            className="order-1 flex justify-center lg:order-2"
          >
            {/* Glass card surrounding the photo */}
            <div className="relative w-fit">
              {/* Outer atmospheric bleed */}
              <div
                className="absolute -inset-8 rounded-full opacity-25 blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, #6366f1 0%, #7c3aed 35%, #22c55e 70%, transparent 100%)',
                }}
              />

              {/* Glassmorphism card */}
              <div
                className="relative rounded-[2.5rem] border border-white/10 p-5 shadow-card backdrop-blur-xl sm:p-7"
                style={{ background: 'rgba(15,23,42,0.6)' }}
              >
                <PhotoFrame src={PHOTO} />

                {/* Tool pill strip inside glass card */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['Premiere Pro', 'CapCut', 'After Effects', 'ExtendScript JSX'].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 font-mono text-[10px] font-semibold text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Cinematic view count live badge */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-neon/15 bg-neon/5 py-2.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-neon" />
                  <span className="font-mono text-[11px] text-neon">
                    12M+ views generated across platforms
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Scroll cue ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="mt-16 flex flex-col items-center"
        >
          <a
            href="#journey"
            className="flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500 transition hover:text-neon"
          >
            Scroll
            <ArrowDown size={14} className="animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
