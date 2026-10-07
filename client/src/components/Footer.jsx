import { Clapperboard, ArrowUp, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <div className="container-x flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2.5 font-display font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon-500 text-slate-950">
            <Clapperboard size={18} strokeWidth={2.4} />
          </span>
          CUT<span className="text-neon">/</span>ROOM
        </div>

        <p className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} — Video editing portfolio built with the MERN stack. All clips are demo rights
          holders’ content.
        </p>

        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 transition hover:border-neon/50 hover:text-neon"
          >
            <Lock size={11} /> Admin
          </a>
          <a
            href="#top"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:border-neon/50 hover:text-neon"
            aria-label="Back to top"
          >
            <ArrowUp size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
