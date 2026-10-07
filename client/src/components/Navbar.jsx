import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Clapperboard, Lock } from 'lucide-react';

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#journey', label: 'Journey' },
  { href: '#cv', label: 'CV' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/10 bg-slate-950/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between sm:h-20">
        <a href="#top" className="group flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon-500 text-slate-950 shadow-glow transition group-hover:rotate-12">
            <Clapperboard size={18} strokeWidth={2.4} />
          </span>
          <span>
            CUT<span className="text-neon">/</span>ROOM
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm font-medium text-slate-300 transition hover:text-neon after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-neon after:transition-all hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" className="btn-primary !px-5 !py-2.5">
            Hire Me
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-neon"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/admin"
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 hover:bg-white/5"
              >
                <Lock size={14} /> Admin
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
