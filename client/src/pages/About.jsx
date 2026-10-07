import { motion } from 'framer-motion';
import { Clapperboard, Eye, Sparkles, Target, Film, Wand2 } from 'lucide-react';

const HERO_POINTS = [
  {
    icon: Clapperboard,
    title: 'Where every cut earns its place',
    text: 'I do not stack clips for the sake of it. Every shot is chosen for one reason: to hold attention, sharpen the message and make the viewer want to watch the next one.',
  },
  {
    icon: Eye,
    title: 'Retention-first short-form',
    text: 'Cold opens, pattern interrupts, caption pacing and sound design tuned to the algorithm. Vertical edits for TikTok, Reels and Shorts that drive watch-time, not just views.',
  },
  {
    icon: Sparkles,
    title: 'Long-form storytelling',
    text: 'Assembled narratives for YouTube and documentaries: clean structure, tight B-roll, colour that serves the scene and mixes that sit cleanly under the dialogue.',
  },
  {
    icon: Target,
    title: 'VFX & motion graphics',
    text: 'Lower thirds, call-outs, keys, transitions and screen comps that are built once and reused. WYSIWYG templates so each episode ships with the same polish.',
  },
  {
    icon: Film,
    title: 'Deliverables that ship cleanly',
    text: 'Correct specs for each platform, captioned exports, colourful checklists for shared review and deliverables organised so editors, owners and platforms never miss a beat.',
  },
];

const PROCESS = [
  { title: 'Brief & goal alignment', text: 'Budget, platform, tone, call-to-action and what a finished watch-time looks like.' },
  { title: 'Select / assembly cut', text: 'Structure the story before we spend a frame on polish.' },
  { title: 'Retention pass', text: 'Hooks, pacing, captions and sound design worked into the timeline.' },
  { title: 'Motion, VFX & sound polish', text: 'Motion graphics, compositing, grade and mix pushed to broadcast standards.' },
  { title: 'Review round + delivery', text: 'Loop back with you until it is right, then ship spec-correct exports.' },
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
              I make footage <span className="gradient-text">impossible to look away from.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              I am a freelance video editor and visual storyteller specialising in short-form social content, long-form
              YouTube storytelling and event / brand promos. I work with creators, agencies and brands who care about
              watch-time and take real pride in the work they ship.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              My process is simple: start from the goal, not the footage. Every cut is chosen for the next second, every
              punch-in and colour grade serves a story, and nothing gets marked final until it holds a live audience.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#work" className="btn-primary">
                <Film size={16} /> View my work
              </a>
              <a href="#contact" className="btn-ghost">
                <Wand2 size={16} /> Start a project
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
                  <p className="font-display text-lg font-bold">{p.icon}</p>
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
