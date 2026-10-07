import { motion } from 'framer-motion';
import { Play, Film, Wand2, Palette, Volume2 } from 'lucide-react';

const SKILL_CATEGORIES = [
  {
    icon: Play,
    title: 'Editing',
    skills: [
      { name: 'Adobe Premiere Pro', level: 95, tag: 'Professional' },
      { name: 'CapCut (mobile + desktop)', level: 92, tag: 'Professional' },
      { name: 'DaVinci Resolve', level: 82, tag: 'Advanced' },
      { name: 'Final Cut Pro', level: 70, tag: 'Intermediate' },
    ],
  },
  {
    icon: Wand2,
    title: 'Motion & VFX',
    skills: [
      { name: 'After Effects / Motion Graphics', level: 85, tag: 'Advanced' },
      { name: 'VFX & compositing', level: 80, tag: 'Advanced' },
      { name: 'Title / lower-third template systems', level: 88, tag: 'Advanced' },
      { name: 'Screen comps & particle work', level: 76, tag: 'Intermediate' },
    ],
  },
  {
    icon: Palette,
    title: 'Design & grade',
    skills: [
      { name: 'Colour grading', level: 78, tag: 'Advanced' },
      { name: 'Photoshop / thumbnailing', level: 80, tag: 'Advanced' },
      { name: 'Typography & motion design', level: 84, tag: 'Advanced' },
      { name: 'Brand consistency & asset handling', level: 90, tag: 'Professional' },
    ],
  },
  {
    icon: Volume2,
    title: 'Sound & delivery',
    skills: [
      { name: 'Sound design', level: 75, tag: 'Advanced' },
      { name: 'Audition / sound mixing', level: 78, tag: 'Advanced' },
      { name: 'Platform-ready exports (1080x1920 / 1080x1080 / 1920x1080)', level: 96, tag: 'Professional' },
      { name: 'Caption & subtitle timing', level: 88, tag: 'Advanced' },
    ],
  },
];

const QUANTIFIABLES = [
  { value: '1+', suffix: '+ yr', label: 'Professional freelance' },
  { value: '350+', suffix: '+', label: 'Deliverables shipped' },
  { value: '12', suffix: 'M+', label: 'Views generated' },
  { value: '+42', suffix: '%', label: 'Avg. retention lift' },
];

function CategoryCard({ category, index }) {
  const Icon = category.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="card p-6"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon-500/10 text-neon">
          <Icon size={18} />
        </span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-neon">{category.title}</p>
          <h3 className="font-display text-lg font-semibold text-ink">Skills</h3>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {category.skills.map((s) => (
          <div key={s.name}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-300">{s.name}</span>
              <span className="font-mono text-[11px] text-neon">{s.level}% · {s.tag}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${s.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.1 + index * 0.05, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-neon-500 to-cyanx-500"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="section border-t border-white/10 bg-slate-950/40">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon">// Skills & craft</span>
            <h2 className="section-title mt-3">
              Tools I reach for, <span className="gradient-text">the ones that earn the next second.</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              I combine the speed of a mobile editor with the reach of a desktop pipeline. Premieres, captions and
              sound design are my daily bread; After Effects templates, tracking and colour sit alongside the rhythm
              editing that keeps retention high.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="card p-5">
                <p className="font-display text-3xl font-bold text-ink">+<span className="text-neon">42%</span></p>
                <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">Average retention lift</p>
                <p className="mt-2 text-sm text-slate-400">Measured across recurring short-form clients and re-engaging long-form.</p>
              </div>
              <div className="card p-5">
                <p className="font-display text-3xl font-bold text-ink">12<span className="text-neon">M+</span></p>
                <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">Views generated</p>
                <p className="mt-2 text-sm text-slate-400">Across TikTok, Reels, Shorts and YouTube long-form deliverables.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {SKILL_CATEGORIES.map((c, i) => (
              <CategoryCard key={c.title} category={c} index={i} />
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {QUANTIFIABLES.map((s) => (
            <div key={s.label} className="card p-6 text-center">
              <p className="font-display text-3xl font-bold text-ink sm:text-4xl">
                {s.value}
                <span className="text-neon">{s.suffix}</span>
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
