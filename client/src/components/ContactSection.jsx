import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, CheckCircle2, AlertCircle, Loader2, Youtube, Linkedin, Twitter, Instagram } from 'lucide-react';
import { api } from '../lib/api.js';

const SOCIALS = [
  { label: 'YouTube', href: 'https://youtube.com/@kidus_edits', icon: Youtube },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/kidus-subagya', icon: Linkedin },
  { label: 'X (Twitter)', href: 'https://x.com/kidus_subagya', icon: Twitter },
  { label: 'TikTok', href: 'https://tiktok.com/@kidus_edits', icon: Instagram },
];

const BUDGETS = ['< $500', '$500 — $1k', '$1k — $3k', '$3k+', 'Retainer'];

const FIELD_CLASS = (ok, bad) =>
  `input ${bad ? '!border-red-500/60 focus:!border-red-400' : ok ? '!border-neon/50' : ''}`;

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', budget: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: 'idle', text: '' });
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const invalid = {
    name: touched && !form.name.trim(),
    email: touched && !/^\S+@\S+\.\S+$/.test(form.email),
    message: touched && form.message.trim().length < 10,
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 10) {
      setStatus({ type: 'error', text: 'Please fill in your name, a valid email and a message (10+ characters).' });
      return;
    }

    setSending(true);
    setStatus({ type: 'idle', text: '' });
    try {
      const data = await api('/contact', { method: 'POST', body: form });
      setStatus({ type: 'success', text: data.message });
      setForm({ name: '', email: '', budget: '', subject: '', message: '' });
      setTouched(false);
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section border-t border-white/10">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* ---------- Pitch + socials ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon">// Contact & booking</span>
            <h2 className="section-title mt-3">
              Got footage?
              <br />
              <span className="gradient-text">Let’s make it finish.</span>
            </h2>
            <p className="mt-4 max-w-md text-slate-400">
              Tell me about the project — platform, format, deadline. I reply to every serious enquiry within 24
              hours, and first drafts usually land within 48.
            </p>

            <div className="mt-8 space-y-3 text-sm">
              <a href="mailto:hello@kidus.subagya.com" className="flex items-center gap-3 text-slate-300 transition hover:text-neon">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <Mail size={16} className="text-neon" />
                </span>
                hello@kidus.subagya.com
              </a>
              <p className="flex items-center gap-3 text-slate-300">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <MapPin size={16} className="text-cyan-400" />
                </span>
                Addis Ababa, Ethiopia · Remote across EU / US time zones
              </p>
            </div>

            <div className="mt-8">
              <p className="label">Find me on</p>
              <div className="flex flex-wrap gap-2.5">
                {SOCIALS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-neon/50 hover:text-neon"
                  >
                    <Icon size={15} className="transition group-hover:scale-110" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ---------- Form ---------- */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card p-6 sm:p-8"
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="name">Your name *</label>
                <input
                  id="name"
                  className={FIELD_CLASS(!invalid.name, invalid.name)}
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Alex Creator"
                />
              </div>
              <div>
                <label className="label" htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  className={FIELD_CLASS(!invalid.email, invalid.email)}
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@brand.com"
                />
              </div>
              <div>
                <label className="label" htmlFor="budget">Budget</label>
                <select id="budget" className="input" value={form.budget} onChange={set('budget')}>
                  <option value="">Select a range…</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  className="input"
                  value={form.subject}
                  onChange={set('subject')}
                  placeholder="10 Shorts / month"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="label" htmlFor="message">Project details *</label>
              <textarea
                id="message"
                rows={5}
                className={`${FIELD_CLASS(!invalid.message, invalid.message)} resize-y`}
                value={form.message}
                onChange={set('message')}
                placeholder="Platform, format, deadline, references…"
              />
            </div>

            {status.text && (
              <div
                className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                  status.type === 'success'
                    ? 'border-neon/40 bg-neon-500/10 text-neon-300'
                    : 'border-red-500/40 bg-red-500/10 text-red-300'
                }`}
                role="status"
              >
                {status.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                <span>{status.text}</span>
              </div>
            )}

            <button type="submit" disabled={sending} className="btn-primary mt-6 w-full sm:w-auto">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sending ? 'Sending…' : 'Send message'}
            </button>

            <p className="mt-4 text-xs text-slate-500">
              Delivered straight to my inbox via the API — no middlemen, no spam.
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
