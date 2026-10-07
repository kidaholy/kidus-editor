import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, RefreshCw, FileText, Briefcase, Wrench, Loader2 } from 'lucide-react';
import { api } from '../lib/api.js';

const EXPERIENCE = [
  {
    role: 'Freelance Video Editor',
    period: '2023 — Present',
    points: [
      '350+ delivered edits for creators, agencies and brands across short-form and long-form.',
      'Specialised in retention-driven short-form: hooks, pacing, captions, sound design.',
      'Long-form YouTube and documentary projects: assembly, B-roll, grade, mix, delivery.',
    ],
  },
  {
    role: 'Motion Graphics & VFX Editor',
    period: '2024 — Present',
    points: [
      'Automated title/lower-third template systems that cut per-video production time ~60%',
      'Tracking, clean-up, screen comps and particle work for branded content.',
    ],
  },
];

const TOOLKIT = [
  ['Adobe Premiere Pro', 'Expert'],
  ['CapCut', 'Expert'],
  ['After Effects / Motion', 'Advanced'],
  ['DaVinci Resolve', 'Intermediate'],
  ['Photoshop / Thumbnailing', 'Advanced'],
  ['Audition / Sound design', 'Intermediate'],
];

export default function CVSection() {
  const [cv, setCv] = useState(null);
  const [checked, setChecked] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);

  useEffect(() => {
    api('/cv')
      .then((data) => setCv(data.cv))
      .catch(() => setCv(null))
      .finally(() => setChecked(true));
  }, []);

  const hasCv = !!cv?.url;

  return (
    <section id="cv" className="section border-t border-white/10">
      <div className="container-x">
        <div className="mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon">// Curriculum vitae</span>
          <h2 className="section-title mt-3">
            The résumé, <span className="gradient-text">digitised.</span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
          {/* ---------- Digital CV layout ---------- */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="card p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-bold text-ink">Video Editor &amp; Motion Designer</p>
                  <p className="mt-1 text-sm text-slate-400">Short-form retention · Long-form storytelling · VFX</p>
                </div>
                <span className="chip !border-neon/40 !text-neon">1+ yr professional</span>
              </div>

              <div className="mt-7">
                <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  <Briefcase size={13} className="text-neon" /> Experience
                </h3>
                <div className="space-y-5">
                  {EXPERIENCE.map((job) => (
                    <div key={job.role} className="border-l-2 border-neon/40 pl-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-display font-semibold text-ink">{job.role}</p>
                        <span className="font-mono text-[11px] text-slate-500">{job.period}</span>
                      </div>
                      <ul className="mt-2 space-y-1.5 text-sm text-slate-400">
                        {job.points.map((p) => (
                          <li key={p} className="flex gap-2">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neon" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  <Wrench size={13} className="text-neon" /> Software skills
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TOOLKIT.map(([name, level]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm"
                    >
                      <span className="text-slate-300">{name}</span>
                      <span className="font-mono text-[11px] text-neon">{level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="/api/cv/download" className="btn-primary" download>
                <Download size={16} /> Download CV (PDF)
              </a>
              <a href="/api/cv/file" target="_blank" rel="noreferrer" className="btn-ghost">
                <ExternalLink size={16} /> Open in new tab
              </a>
            </div>
          </motion.div>

          {/* ---------- Interactive PDF viewer ---------- */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                <FileText size={13} className="text-neon" />
                {cv?.downloadName || 'CV.pdf'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewerKey((k) => k + 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:border-neon/50 hover:text-neon"
                  aria-label="Reload PDF preview"
                >
                  <RefreshCw size={14} />
                </button>
                <a
                  href="/api/cv/download"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:border-neon/50 hover:text-neon"
                  aria-label="Download CV"
                  download
                >
                  <Download size={14} />
                </a>
              </div>
            </div>

            <div className="relative min-h-[440px] flex-1 bg-slate-900/60">
              {!checked ? (
                <div className="absolute inset-0 grid place-items-center gap-3 text-slate-500">
                  <Loader2 className="animate-spin text-neon" />
                </div>
              ) : hasCv ? (
                <iframe
                  key={viewerKey}
                  src="/api/cv/file#toolbar=0&view=FitH"
                  title="CV preview"
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center p-8 text-center">
                  <div>
                    <FileText size={40} className="mx-auto text-slate-600" />
                    <p className="mt-4 font-display text-lg font-semibold text-slate-300">No CV uploaded yet</p>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      The admin can upload a PDF from <span className="text-neon">Dashboard → CV</span>; it appears
                      here instantly.
                    </p>
                    <a href="/admin" className="btn-ghost mt-6 !py-2.5">
                      Go to dashboard
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3.5 text-[11px] text-slate-500">
              <span>
                Updated: {cv?.updatedAt ? new Date(cv.updatedAt).toLocaleDateString() : '—'}
              </span>
              <span>{cv?.size ? `${(cv.size / 1024).toFixed(0)} KB · ` : ''}PDF · {cv?.storage || 'local'} storage</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
