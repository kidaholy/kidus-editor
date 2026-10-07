import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ArrowDown, Download, Crosshair, Send, Sparkles } from 'lucide-react';

const REEL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' } }),
};

function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Hero() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => setPlaying(false));
  }, []);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const scrub = (e) => {
    const el = videoRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * duration;
    setProgress(ratio * duration);
  };

  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-neon-500/10 blur-[120px]" />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* -------- Copy -------- */}
        <div>
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-6 flex flex-wrap gap-2">
            <span className="chip">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" /> Available for freelance
            </span>
            <span className="chip">Short-form · Long-form · VFX</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl xl:text-7xl"
          >
            I edit video
            <br />
            people actually
            <span className="gradient-text"> finish watching.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            Short-form edits for TikTok, Reels &amp; Shorts engineered for retention — plus long-form YouTube and
            documentary storytelling with motion graphics, VFX and sound design. 1+ year, 350+ cuts, one obsession:
            the next second.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a href="#work" className="btn-primary">
              <Crosshair size={16} /> View Work
            </a>
            <a href="#contact" className="btn-ghost">
              <Send size={16} /> Hire Me
            </a>
            <a href="/api/cv/download" className="btn-ghost" download>
              <Download size={16} /> Download CV
            </a>
          </motion.div>

          <motion.dl
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-8"
          >
            {[
              ['12M+', 'Views generated'],
              ['350+', 'Projects edited'],
              ['+42%', 'Avg. retention lift'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl font-bold text-ink sm:text-3xl">{value}</dt>
                <dd className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">{label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* -------- Showreel player with custom controls -------- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          className="relative"
        >
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon">● Showreel 2025</span>
              <span className="font-mono text-[11px] text-slate-500">4K · 60FPS</span>
            </div>

            <div className="group relative aspect-video bg-black">
              <video
                ref={videoRef}
                src={REEL}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              />

              {/* Custom controls */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-100 transition-opacity duration-300 sm:opacity-80 sm:group-hover:opacity-100">
                <div
                  onClick={scrub}
                  role="slider"
                  tabIndex={0}
                  aria-label="Seek"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={duration ? Math.round((progress / duration) * 100) : 0}
                  className="mb-3 h-1.5 w-full cursor-pointer rounded-full bg-white/20 transition hover:bg-white/30"
                >
                  <div
                    className="relative h-full rounded-full bg-neon"
                    style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                  >
                    <span className="absolute -right-1.5 -top-1 h-3.5 w-3.5 rounded-full bg-neon opacity-0 shadow-glow transition group-hover:opacity-100" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    aria-label={playing ? 'Pause' : 'Play'}
                    className="grid h-9 w-9 place-items-center rounded-full bg-neon-500 text-slate-950 transition hover:scale-105"
                  >
                    {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    aria-label={muted ? 'Unmute' : 'Mute'}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                  >
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>

                  <span className="font-mono text-[11px] text-slate-300">
                    {formatTime(progress)} / {formatTime(duration)}
                  </span>

                  <a
                    href="#work"
                    className="ml-auto hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/20 sm:inline-flex"
                  >
                    <Sparkles size={12} className="text-neon" /> Full portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-4 hidden animate-floaty rounded-2xl border border-neon/30 bg-slate-950/90 px-4 py-3 shadow-glow backdrop-blur sm:block">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Premiere Pro</p>
            <p className="font-display text-lg font-bold text-neon">CapCut · AE · VFX</p>
          </div>
        </motion.div>
      </div>

      <a
        href="#journey"
        className="mx-auto mt-16 flex w-fit flex-col items-center gap-2 text-slate-500 transition hover:text-neon"
        aria-label="Scroll to my journey"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown size={16} className="animate-bounce" />
      </a>
    </section>
  );
}
