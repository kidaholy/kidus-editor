import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Film, Loader2, AlertTriangle, Youtube, Instagram, ChevronRight } from 'lucide-react';
import { api } from '../lib/api.js';
import ProjectModal from './ProjectModal.jsx';

const TABS = [
  { id: 'short-form', label: 'Short-form social edits' },
  { id: 'long-form', label: 'Long-form YouTube storytelling' },
  { id: 'events-brand', label: 'Event & brand promos' },
  { id: 'all', label: 'All' },
];

const CATEGORY_LABEL = {
  'short-form': 'Short-form social',
  'long-form': 'Long-form YouTube',
  'events-brand': 'Event & brand',
};

function PlatformBadge({ platform }) {
  const map = {
    youtube: { icon: Youtube, label: 'YouTube', className: 'border-red-500/40 text-red-400' },
    tiktok: { icon: Play, label: 'TikTok', className: 'border-white/30 text-white' },
    instagram: { icon: Instagram, label: 'Instagram', className: 'border-pink-500/40 text-pink-400' },
    vimeo: { icon: Film, label: 'Vimeo', className: 'border-cyan-400/40 text-cyan-300' },
    direct: { icon: Film, label: 'Custom', className: 'border-neon/40 text-neon' },
    twitter: { icon: Play, label: 'X', className: 'border-sky-400/40 text-sky-300' },
    other: { icon: Film, label: 'Web', className: 'border-white/20 text-slate-300' },
  };
  const conf = map[platform] || map.other;
  const Icon = conf.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${conf.className}`}>
      <Icon size={11} /> {conf.label}
    </span>
  );
}

function Card({ project, onOpen, index }) {
  const videoRef = useRef(null);
  const isDirect = project.platform === 'direct' || /\.(mp4|webm|mov)(\?.*)?$/i.test(project.embedUrl || project.videoUrl || '');

  const startPreview = () => {
    if (isDirect && videoRef.current) videoRef.current.play().catch(() => {});
  };
  const stopPreview = () => {
    if (isDirect && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onClick={() => onOpen(project)}
      className="group card cursor-pointer overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:border-neon/40 hover:shadow-glow"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        {isDirect ? (
          <video
            ref={videoRef}
            src={project.embedUrl || project.videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-600">
            <Film size={34} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 transition group-hover:opacity-95" />

        {/* Play affordance */}
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid h-14 w-14 scale-75 place-items-center rounded-full border border-white/20 bg-slate-950/70 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <Play size={22} fill="currentColor" className="ml-0.5 text-neon" />
          </span>
        </div>

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <PlatformBadge platform={project.platform} />
          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/40 bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-yellow-300">
              <Star size={10} fill="currentColor" /> Featured
            </span>
          )}
        </div>

        {project.duration && (
          <span className="absolute bottom-3 right-3 rounded-md bg-slate-950/90 px-2 py-1 font-mono text-[11px] text-slate-200">
            {project.duration}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
            {CATEGORY_LABEL[project.category] || project.category}
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <h3 className="font-display text-base font-semibold leading-snug text-ink transition group-hover:text-neon sm:text-lg">
          {project.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{project.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Watch full video</span>
          <span className="font-mono text-[11px] text-slate-600 transition group-hover:translate-x-1 group-hover:text-neon">
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function PortfolioGrid() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [active, setActive] = useState(null);

  useEffect(() => {
    let alive = true;
    api('/projects')
      .then((data) => alive && setProjects(data.projects || []))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(
    () => (tab === 'all' ? projects : projects.filter((p) => p.category === tab)),
    [projects, tab]
  );

  return (
    <section id="work" className="section border-t border-white/10">
      <div className="container-x">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon">// Selected work</span>
            <h2 className="section-title mt-3">
              Edits that earn <span className="gradient-text">the next second.</span>
            </h2>
            <p className="mt-4 text-slate-400">
              Every project below is loaded live from the database by the admin dashboard — filters, thumbnails and
              embeds included.
            </p>
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-wrap lg:px-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  tab === t.id
                    ? 'border-neon bg-neon text-slate-950 shadow-glow'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-neon/50 hover:text-neon'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-24 text-slate-400">
            <Loader2 className="animate-spin text-neon" /> Loading projects…
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-10 text-sm text-red-300">
            <AlertTriangle size={18} /> {error} — is the API running on port 5000?
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 py-20 text-center text-slate-500">
            No projects in this category yet. Add one from the <span className="text-neon">admin dashboard</span>.
          </div>
        )}

        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {visible.map((p, i) => (
              <Card key={p._id} project={p} index={i} onOpen={setActive} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}
