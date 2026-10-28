import { motion } from 'framer-motion';
import {
  Clapperboard, Wand2, Terminal, Zap,
  TrendingUp, Youtube, Timer, Star,
} from 'lucide-react';

/* ─────────────────────────────────────
   Data
───────────────────────────────────── */
const TOOLS = [
  {
    name: 'Adobe Premiere Pro',
    tag: 'Expert · 96%',
    level: 96,
    icon: Clapperboard,
    accent: '#9333ea',
    desc: 'Primary editing suite. Assembly, colour, audio, motion captions and final export — end to end.',
  },
  {
    name: 'CapCut',
    tag: 'Expert · 94%',
    level: 94,
    icon: Timer,
    accent: '#22c55e',
    desc: 'Mobile + desktop. Fast-turnaround short-form cuts with auto-captions and viral sound design built in.',
  },
  {
    name: 'Adobe After Effects',
    tag: 'Advanced · 88%',
    level: 88,
    icon: Wand2,
    accent: '#06b6d4',
    desc: 'Motion graphics, kinetic typography, VFX comping, particle work and data-driven template systems.',
  },
];

const SCRIPTS = [
  {
    name: 'ExtendScript JSX — Premiere Pro',
    tag: 'Advanced · 82%',
    level: 82,
    icon: Terminal,
    accent: '#f59e0b',
    desc: 'Custom JSX scripts that automate lower-thirds, batch exports and timeline operations inside Premiere.',
  },
  {
    name: 'ExtendScript JSX — After Effects',
    tag: 'Advanced · 80%',
    level: 80,
    icon: Terminal,
    accent: '#f59e0b',
    desc: 'Script-driven comp creation, MG template injection and expression-linked control rigs inside AE.',
  },
  {
    name: 'AE Expressions',
    tag: 'Advanced · 85%',
    level: 85,
    icon: Zap,
    accent: '#818cf8',
    desc: 'Kinetic typography rigs, wiggle systems, value mapping and parametric motion without manual keyframes.',
  },
];

const FORMATS = [
  {
    icon: TrendingUp,
    title: 'Short-Form Social',
    platforms: 'TikTok · Reels · Shorts',
    accent: '#22c55e',
    bullets: [
      'Pattern-interrupt hooks in the first 3 frames',
      'Beat-matched jump cuts & speed ramps',
      'Caption pacing engineered for watch-time',
      'Trending sound design & SFX layering',
    ],
  },
  {
    icon: Youtube,
    title: 'Long-Form YouTube',
    platforms: 'YouTube · Documentary',
    accent: '#f87171',
    bullets: [
      'Structured narrative — open loop, escalation, payoff',
      'B-roll layering & dynamic audio ducking',
      'Lumetri colour grade + film grain finish',
      'Chapter markers & thumbnail-driven pacing',
    ],
  },
  {
    icon: Star,
    title: 'Motion Graphics',
    platforms: 'Kinetic Type · VFX · MG',
    accent: '#818cf8',
    bullets: [
      'Custom kinetic typography with AE expressions',
      'Reusable MG template systems (one-click update)',
      'Screen comps, particle work & clean-up VFX',
      'Data-driven titles via ExtendScript automation',
    ],
  },
];

/* ─────────────────────────────────────
   Tool card
───────────────────────────────────── */
function ToolCard({ tool, index }) {
  const Icon = tool.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="card group p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl"
          style={{ background: `${tool.accent}18`, color: tool.accent }}
        >
          <Icon size={20} strokeWidth={1.6} />
        </span>
        <span
          className="rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `${tool.accent}15`, color: tool.accent }}
        >
          {tool.tag}
        </span>
      </div>

      {/* Name */}
      <h3 className="mt-4 font-display text-base font-semibold text-ink sm:text-lg">{tool.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{tool.desc}</p>

      {/* Progress bar */}
      <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-800/80">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${tool.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.2 + index * 0.07, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${tool.accent}99, ${tool.accent})` }}
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   Format card
───────────────────────────────────── */
function FormatCard({ fmt, index }) {
  const Icon = fmt.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.09 }}
      className="card flex flex-col gap-4 p-6"
    >
      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 place-items-center rounded-xl"
          style={{ background: `${fmt.accent}18`, color: fmt.accent }}
        >
          <Icon size={20} strokeWidth={1.6} />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: fmt.accent }}>
            {fmt.platforms}
          </p>
          <h3 className="font-display text-base font-bold text-ink">{fmt.title}</h3>
        </div>
      </div>
      <ul className="space-y-2">
        {fmt.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-slate-400">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full" style={{ background: fmt.accent }} />
            {b}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   Section
───────────────────────────────────── */
export default function Skills() {
  return (
    <section id="skills" className="section border-t border-white/10">
      <div className="container-x space-y-20">

        {/* ── Section header ── */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-neon"
          >
            // Editing arsenal
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="section-title mt-3"
          >
            A lean three-tool stack,{' '}
            <span className="gradient-text">extended by script.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-4 text-lg leading-relaxed text-slate-400"
          >
            <span className="font-mono text-sm text-slate-300">Premiere Pro</span>,{' '}
            <span className="font-mono text-sm text-slate-300">CapCut</span> and{' '}
            <span className="font-mono text-sm text-slate-300">After Effects</span> — with
            custom <span className="font-mono text-sm text-slate-300">ExtendScript JSX</span>{' '}
            scripts and AE expressions built from scratch to automate kinetic typography and
            motion graphic systems. No bloat, no filler — every tool earns its place.
          </motion.p>
        </div>

        {/* ── Divider: Creative & Motion Design ── */}
        <div>
          <div className="mb-8 flex items-center gap-4">
            <span
              className="flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest"
              style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e', background: 'rgba(34,197,94,0.07)' }}
            >
              <Wand2 size={13} /> Creative &amp; Motion Design
            </span>
            <span className="h-px flex-1 bg-white/8" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t, i) => (
              <ToolCard key={t.name} tool={t} index={i} />
            ))}
          </div>
        </div>

        {/* ── Divider: Scripting & Automation ── */}
        <div>
          <div className="mb-8 flex items-center gap-4">
            <span
              className="flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest"
              style={{ borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b', background: 'rgba(245,158,11,0.07)' }}
            >
              <Terminal size={13} /> Scripting &amp; Automation
            </span>
            <span className="h-px flex-1 bg-white/8" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SCRIPTS.map((s, i) => (
              <ToolCard key={s.name} tool={s} index={i} />
            ))}
          </div>
        </div>

        {/* ── Content Formats ── */}
        <div>
          <div className="mb-8 flex items-center gap-4">
            <span
              className="flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest"
              style={{ borderColor: 'rgba(6,182,212,0.3)', color: '#06b6d4', background: 'rgba(6,182,212,0.07)' }}
            >
              <TrendingUp size={13} /> Content Formats &amp; Expertise
            </span>
            <span className="h-px flex-1 bg-white/8" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FORMATS.map((f, i) => (
              <FormatCard key={f.title} fmt={f} index={i} />
            ))}
          </div>
        </div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { num: '350', suf: '+',  label: 'Deliverables shipped' },
            { num: '12',  suf: 'M+', label: 'Views generated' },
            { num: '3',   suf: '+',  label: 'Years freelance' },
            { num: 'JSX', suf: '',   label: 'ExtendScript automation' },
          ].map(({ num, suf, label }) => (
            <div key={label} className="text-center">
              <p className="font-display text-3xl font-bold text-ink sm:text-4xl">
                {num}<span className="text-neon">{suf}</span>
              </p>
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-500">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
