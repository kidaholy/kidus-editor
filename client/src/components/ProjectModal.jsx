import { useEffect, useRef } from 'react';
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

/**
 * TikTok embed using the official oEmbed blockquote + their JS SDK.
 * This is the only reliable way to embed TikTok (direct iframes are blocked).
 */
function TikTokEmbed({ videoUrl, embedUrl }) {
  const containerRef = useRef(null);

  // Extract video ID from the embed URL (https://www.tiktok.com/embed/v2/{id}) or original URL
  const idMatch = (embedUrl || videoUrl || '').match(/\/video\/(\d+)|\/embed\/v2\/(\d+)/);
  const videoId = idMatch ? (idMatch[1] || idMatch[2]) : null;

  // Extract username from original URL e.g. /@username/video/...
  const userMatch = (videoUrl || '').match(/tiktok\.com\/@([\w.-]+)/i);
  const username = userMatch ? userMatch[1] : 'tiktokuser';

  // Clean canonical URL for oEmbed blockquote
  const canonicalUrl = videoId
    ? `https://www.tiktok.com/@${username}/video/${videoId}`
    : (videoUrl || '').split('?')[0];

  useEffect(() => {
    if (!containerRef.current) return;

    // Remove any previously injected TikTok script to force re-render
    const existingScript = document.getElementById('tiktok-embed-sdk');
    if (existingScript) existingScript.remove();

    // Inject TikTok's official embed JS
    const script = document.createElement('script');
    script.id = 'tiktok-embed-sdk';
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const s = document.getElementById('tiktok-embed-sdk');
      if (s) s.remove();
    };
  }, [canonicalUrl]);

  if (!videoId && !canonicalUrl) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-slate-400">
        <p className="text-sm">Could not parse TikTok video ID.</p>
        <a href={videoUrl} target="_blank" rel="noreferrer" className="text-sm text-neon underline">
          Watch on TikTok ↗
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center overflow-auto bg-black"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* TikTok official oEmbed blockquote — their embed.js will transform this */}
      <blockquote
        className="tiktok-embed"
        cite={canonicalUrl}
        data-video-id={videoId}
        style={{ maxWidth: '325px', minWidth: '325px', margin: '0 auto' }}
      >
        <section>
          <a
            href={canonicalUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#69C9D0', fontFamily: 'sans-serif', fontSize: '14px' }}
          >
            Watch on TikTok ↗
          </a>
        </section>
      </blockquote>
    </div>
  );
}

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

  // 3. TikTok — use official oEmbed blockquote + embed.js (direct iframes are blocked by TikTok).
  if (platform === 'tiktok') {
    return <TikTokEmbed videoUrl={videoUrl} embedUrl={embedUrl} />;
  }

  // 4. Instagram, X, unknown — generic iframe.
  return (
    <iframe
      src={url}
      title={project.title}
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
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

            <div
              className="relative w-full bg-black"
              style={{ aspectRatio: project.platform === 'tiktok' ? '9/16' : '16/9', maxHeight: project.platform === 'tiktok' ? '70vh' : undefined }}
            >
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
