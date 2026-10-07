import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Briefcase, Clapperboard, Film, Rocket, Wand2, Target } from 'lucide-react';

const MILESTONES = [
  {
    year: '2023',
    title: 'First cut, first addiction',
    icon: Clapperboard,
    text: 'Started cutting in CapCut and Premiere Pro — learning that a great edit is 80% story and 20% effects.',
  },
  {
    year: '2023 · Q4',
    title: 'Went professional',
    icon: Briefcase,
    text: 'First paid short-form client. Delivered vertical edits for TikTok, Reels and Shorts on a weekly cadence.',
  },
  {
    year: '2024',
    title: 'Retention era',
    icon: Target,
    text: 'Rebuilt my process around retention data: cold-open hooks, pattern interrupts, caption pacing, A/B thumbnails.',
  },
  {
    year: '2024 · H2',
    title: 'Motion graphics automation',
    icon: Wand2,
    text: 'Built reusable AE and CapCut template systems so titles, lower-thirds and call-outs render themselves.',
  },
  {
    year: '2025',
    title: 'VFX + long-form storytelling',
    icon: Film,
    text: 'Expanded into compositing, tracking, colour grading and long-form YouTube / documentary editing.',
  },
  {
    year: 'Now',
    title: 'Open for select projects',
    icon: Rocket,
    text: 'Taking on brands and creators who care about watch-time. Fast turnarounds, clear communication, no drama.',
  },
];

const SKILLS = [
  { name: 'Adobe Premiere Pro', level: 95 },
  { name: 'CapCut (mobile + desktop)', level: 92 },
  { name: 'Motion graphics / AE', level: 85 },
  { name: 'VFX & compositing', level: 80 },
  { name: 'Colour grading', level: 78 },
  { name: 'Sound design', level: 75 },
];

function Counter({ to, suffix = '', duration = 1600, decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

const STATS = [
  { value: 12, suffix: 'M+', label: 'Views generated', decimals: 0 },
  { value: 350, suffix: '+', label: 'Projects edited', decimals: 0 },
  { value: 42, prefix: '+', suffix: '%', label: 'Retention boost', decimals: 0 },
  { value: 48, suffix: 'h', label: 'Avg. turnaround', decimals: 0 },
];

export default function JourneyTimeline() {
  return (
    <section id="journey" className="section border-t border-white/10">
      <div className="container-x">
        <div className="mb-14 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon">// My journey</span>
          <h2 className="section-title mt-3">
            One year of edits, <span className="gradient-text">hundreds of hooks.</span>
          </h2>
          <p className="mt-4 text-slate-400">
            From CapCut experiments on a phone to full documentary timelines in Premiere Pro — here is how the craft
            compounds.
          </p>
        </div>

        {/* -------- Stats counters -------- */}
        <div className="mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card p-5 text-center sm:p-7"
            >
              <p className="font-display text-3xl font-bold text-ink sm:text-4xl">
                {s.prefix || ''}
                <Counter to={s.value} suffix={s.suffix} decimals={s.decimals} />
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-widest text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          {/* -------- Timeline -------- */}
          <div className="relative">
            <div className="absolute left-[18px] top-2 h-full w-px bg-gradient-to-b from-neon via-cyanx-500/50 to-transparent sm:left-[26px]" />

            <div className="space-y-8">
              {MILESTONES.map((m, i) => {
                const Icon = m.icon;
                return (
                  <motion.article
                    key={m.year}
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.55, delay: i * 0.05 }}
                    className="group relative flex gap-5 pl-0 sm:gap-7"
                  >
                    <div className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neon/40 bg-slate-950 text-neon shadow-glow transition group-hover:scale-110 group-hover:bg-neon group-hover:text-slate-950 sm:h-11 sm:w-11">
                      <Icon size={16} />
                    </div>

                    <div className="card flex-1 p-5 transition duration-300 group-hover:-translate-y-1 group-hover:border-neon/40">
                      <div className="mb-1.5 flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[11px] uppercase tracking-widest text-neon">{m.year}</span>
                        <span className="h-px flex-1 bg-white/10" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-ink">{m.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">{m.text}</p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          {/* -------- Skills & workflow -------- */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="card p-6"
            >
              <h3 className="font-display text-lg font-semibold text-ink">Software proficiency</h3>
              <div className="mt-5 space-y-4">
                {SKILLS.map((s, i) => (
                  <div key={s.name}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{s.name}</span>
                      <span className="font-mono text-neon">{s.level}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.1 + i * 0.08, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-neon-500 to-cyanx-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="font-display text-lg font-semibold text-ink">Workflow methodology</h3>
              <ol className="mt-5 space-y-3">
                {['Brief & goal alignment', 'Selects / assembly cut', 'Story & retention pass', 'Motion, VFX & sound polish', 'Review round + delivery'].map(
                  (step, i) => (
                    <li key={step} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5 font-mono text-[11px] text-neon">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {step}
                    </li>
                  )
                )}
              </ol>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
