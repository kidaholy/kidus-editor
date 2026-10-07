import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, AlertCircle, ArrowLeft, Clapperboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/admin/dashboard', { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-neon-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-cyanx-500/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <a href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-neon">
          <ArrowLeft size={15} /> Back to portfolio
        </a>

        <div className="card p-8">
          <div className="mb-7 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-neon-500 text-slate-950 shadow-glow">
              <Clapperboard size={20} strokeWidth={2.4} />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold text-ink">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">JWT-protected · bcrypt-hashed credentials</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="input"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@portfolio.dev"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-3 font-mono text-[11px] leading-relaxed text-slate-400">
            demo: admin@portfolio.dev / ChangeMe123!
            <br />
            (set ADMIN_EMAIL / ADMIN_PASSWORD in server/.env)
          </div>
        </div>
      </motion.div>
    </div>
  );
}
