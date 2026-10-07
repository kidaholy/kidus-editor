import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { X, ExternalLink, Clock, Star, Tag } from 'lucide-react';

const PLATFORM_LABEL = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  vimeo: 'Vimeo',
  twitter: 'X / Twitter',
  direct: 'Direct file',
  other: 'Web',
};

const CATEGORY_LABEL = {
  'short-form': 'Short-form',
  'long-form': 'Long-form',
  'vfx-motion': 'VFX / Motion Graphics',
};

/** Decides how a project should be played. */
function Player({ project, open }) {
  const { embedCode, embedUrl, platform, videoUrl, thumbnail } = project;

  // 1. Custom embed code pasted by the admin wins.
  if (embedCode && embedCode.trim()) {
    return (
      <div
        className="absolute inset-0 [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full"
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    );
  }

  const url = embedUrl || videoUrl;

  // 2. React Player handles YouTube / Vimeo / direct files.
  if (['youtube', 'vimeo', 'direct'].includes(platform) || /\.(mp4|webm|mov)(\?.*)?$/i.test(url)) {
    return (
      <ReactPlayer
        url={url}
        playing={open}
        controls
        light={platform === 'direct' ? false : thumbnail || false}
        width="100%"
        height="100%"
        config={{ youtube: { playerVars: { rel: 0, modestbranding: 1 } }, file: { attributes: { controlsList: 'nodownload' } } }}
        style={{ position: 'absolute', inset: 0 }}
      />
    );
  }

  // 3. Everything else (TikTok, Instagram, X, unknown) uses its platform iframe.
  return (
    <iframe
      src={url}
      title={project.title}
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      allowFullScreen
      className="absolute inset-0 h-full w-full rounded-b-2xl border-0 bg-black"
    />
  );
}

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (project) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-4xl overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="chip !border-neon/40 !text-neon">{PLATFORM_LABEL[project.platform] || project.platform}</span>
                  <span className="chip">{CATEGORY_LABEL[project.category] || project.category}</span>
                  {project.featured && (
                    <span className="chip !border-yellow-400/40 !text-yellow-300">
                      <Star size={11} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>
                <h3 className="truncate font-display text-lg font-semibold text-ink sm:text-xl">{project.title}</h3>
              </div>

              <button
                onClick={onClose}
                aria-label="Close player"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-neon/50 hover:text-neon"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <Player project={project} open />
            </div>

            <div className="grid gap-6 px-5 py-5 sm:grid-cols-[1.6fr_1fr]">
              <div>
                <p className="text-sm leading-relaxed text-slate-400">
                  {project.description || 'No description provided yet.'}
                </p>
                {project.tags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((t) => (
                      <span key={t} className="chip !text-[10px]">
                        <Tag size={10} /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                {project.duration && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} className="text-neon" /> {project.duration}
                  </div>
                )}
                <a
                  href={project.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost w-full !justify-center"
                >
                  <ExternalLink size={14} /> Watch full video
                </a>
                <a href="#contact" onClick={onClose} className="btn-primary w-full !justify-center">
                  Book this style
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { PLATFORM_LABEL, CATEGORY_LABEL };
