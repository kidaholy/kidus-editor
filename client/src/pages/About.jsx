import { motion } from 'framer-motion';
import { Code2, Eye, Sparkles, Terminal, Film, Send } from 'lucide-react';

const HERO_POINTS = [
  {
    icon: Eye,
    title: 'High-retention short-form',
    text: 'Pattern-interrupt hooks, caption pacing and sound design engineered for TikTok, Reels and Shorts. Every second is earned — nothing is filler.',
  },
  {
    icon: Film,
    title: 'Dynamic long-form YouTube content',
    text: 'Structured narratives with tight assembly, purposeful B-roll, colour that serves the scene and a mix that keeps viewers watching to the end.',
  },
  {
    icon: Sparkles,
    title: 'Kinetic typography & motion graphics',
    text: 'Custom After Effects expressions and ExtendScript JSX automations that drive kinetic type and reusable motion graphic systems — built once, deployed everywhere.',
  },
  {
    icon: Terminal,
    title: 'ExtendScript & AE automation',
    text: 'Custom JSX scripts that automate repetitive production tasks inside Premiere Pro and After Effects — cutting per-video turnaround by a meaningful margin.',
  },
  {
    icon: Code2,
    title: 'Full-stack web development',
    text: 'Beyond the timeline: full-stack web builds using modern JavaScript frameworks, REST APIs and database-backed deployments — this site is one of them.',
  },
];

const PROCESS = [
  { title: 'Brief & goal alignment', text: 'Platform, tone, call-to-action and what a strong watch-time curve looks like for this piece.' },
  { title: 'Select / assembly cut', text: 'Structure the story before spending a frame on polish. Narrative first, always.' },
  { title: 'Retention pass', text: 'Hook engineering, pacing, caption timing and sound design locked into the timeline.' },
  { title: 'Motion, expressions & polish', text: 'After Effects expressions, kinetic typography and motion graphics pushed to a broadcast-ready finish.' },
  { title: 'Review round + delivery', text: 'One clean revision loop, then spec-correct exports ready for every platform.' },
];

export default function About() {
  return (
    <section id="about" className="section border-t border-white/10 bg-slate-950/40">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Copy */}
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon">// About</span>
            <h2 className="section-title mt-3">
              I make footage{' '}
              <span className="gradient-text">impossible to look away from.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              I am <strong className="font-semibold text-slate-200">ቅዱስ (Kidus)</strong> — a full-stack web developer
              and professional video editor and motion designer. I work at the intersection of code and
              craft: building scalable web applications by day and engineering retention-first video content by design.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              My editing stack is{' '}
              <span className="font-mono text-sm text-slate-300">Adobe Premiere Pro</span>,{' '}
              <span className="font-mono text-sm text-slate-300">CapCut</span> and{' '}
              <span className="font-mono text-sm text-slate-300">Adobe After Effects</span> — with custom
              ExtendScript JSX scripts and AE expressions I have written myself to drive kinetic typography and
              reusable motion graphic systems. No fluff, no filler: every tool in the chain earns its place.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#work" className="btn-primary">
                <Film size={16} /> View my work
              </a>
              <a href="#contact" className="btn-ghost">
                <Send size={16} /> Start a project
              </a>
            </div>
          </div>

          {/* Specs panel */}
          <div className="grid gap-4">
            {HERO_POINTS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 + i * 0.08 }}
                className="card p-6"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon-500/10 text-neon">
                  {(() => {
                    const Icon = p.icon;
                    return <Icon size={20} />;
                  })()}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Process steps */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
          {PROCESS.map((step, i) => (
            <div key={step.title} className="card p-5 text-center">
              <span className="font-mono text-2xl font-bold text-slate-600">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-3 text-sm font-semibold text-ink">{step.title}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
