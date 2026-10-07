import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Inbox,
  LogOut,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Star,
  GripVertical,
  Upload,
  Loader2,
  Sparkles,
  CheckCircle2,
  Mail,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Clapperboard,
} from 'lucide-react';
import { api, apiUpload } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = [
  ['short-form', 'Short-form (TikTok/Reels)'],
  ['long-form', 'Long-form (YouTube)'],
  ['vfx-motion', 'VFX / Motion Graphics'],
];
const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'vimeo', 'twitter', 'direct', 'other'];

/* ------------------------------------------------------------------ *
 *  Project form (create / edit) with link auto-parsing
 * ------------------------------------------------------------------ */
function ProjectForm({ initial, onSaved, onClose }) {
  const [form, setForm] = useState(() => ({
    title: '',
    category: 'short-form',
    platform: 'other',
    videoUrl: '',
    embedUrl: '',
    embedCode: '',
    thumbnail: '',
    description: '',
    duration: '',
    tags: '',
    featured: false,
    published: true,
    order: '',
    ...(initial || {}),
  }));
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const fileRef = useRef(null);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const parse = async () => {
    if (!form.videoUrl.trim()) return setNotice({ type: 'error', text: 'Paste a video link first.' });
    setParsing(true);
    setNotice(null);
    try {
      const data = await api('/projects/parse-link', { method: 'POST', body: { url: form.videoUrl } });
      const link = data.link;
      setForm((f) => ({
        ...f,
        platform: link.platform || f.platform,
        embedUrl: link.embedUrl || f.embedUrl,
        embedCode: link.embedCode || f.embedCode,
        thumbnail: f.thumbnail || link.thumbnail || '',
        title: f.title || link.title || '',
      }));
      setNotice({
        type: link.warning ? 'warn' : 'success',
        text: link.warning || `Detected ${link.platform}${link.author ? ` · ${link.author}` : ''}. Embed + thumbnail ready.`,
      });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setParsing(false);
    }
  };

  const uploadThumbnail = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const data = await apiUpload('/projects/thumbnail', fd);
      setForm((f) => ({ ...f, thumbnail: data.url }));
      setNotice({ type: 'success', text: 'Thumbnail uploaded.' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const payload = { ...form };
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;
      if (initial?._id) await api(`/projects/${initial._id}`, { method: 'PUT', body: payload });
      else await api('/projects', { method: 'POST', body: payload });
      onSaved();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md sm:p-8"
      onClick={onClose}
    >
      <motion.form
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="card my-auto w-full max-w-3xl p-6 sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink">
            {initial?._id ? 'Edit project' : 'Add new project'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-500 transition hover:text-neon">
            ✕
          </button>
        </div>

        {/* Link + auto-parse */}
        <div>
          <label className="label" htmlFor="videoUrl">Video link / embed source *</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="videoUrl"
              className="input"
              required
              value={form.videoUrl}
              onChange={set('videoUrl')}
              placeholder="https://youtube.com/watch?v=… / tiktok / vimeo / instagram / .mp4"
            />
            <button type="button" onClick={parse} disabled={parsing} className="btn-ghost shrink-0 !py-2.5">
              {parsing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} className="text-neon" />}
              Auto-detect
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Auto-parsing extracts the platform, embed player and thumbnail (via oEmbed).
          </p>
        </div>

        {notice && (
          <div
            className={`mt-3 rounded-xl border px-4 py-2.5 text-sm ${
              notice.type === 'success'
                ? 'border-neon/40 bg-neon-500/10 text-neon-300'
                : notice.type === 'warn'
                  ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-200'
                  : 'border-red-500/40 bg-red-500/10 text-red-300'
            }`}
          >
            {notice.text}
          </div>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="title">Title *</label>
            <input id="title" className="input" required value={form.title} onChange={set('title')} placeholder="Viral hook edit #12" />
          </div>

          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="input" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="platform">Platform</label>
            <select id="platform" className="input" value={form.platform} onChange={set('platform')}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="embedUrl">Embed URL</label>
            <input id="embedUrl" className="input font-mono !text-xs" value={form.embedUrl} onChange={set('embedUrl')} placeholder="https://…/embed/…" />
          </div>

          <div>
            <label className="label" htmlFor="duration">Duration</label>
            <input id="duration" className="input" value={form.duration} onChange={set('duration')} placeholder="0:45" />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="embedCode">Custom embed code (overrides URL)</label>
            <textarea
              id="embedCode"
              rows={2}
              className="input font-mono !text-xs"
              value={form.embedCode}
              onChange={set('embedCode')}
              placeholder="<iframe …></iframe>"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="thumbnail">Thumbnail (URL or upload)</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="thumbnail"
                className="input"
                value={form.thumbnail}
                onChange={set('thumbnail')}
                placeholder="https://i.ytimg.com/vi/…/hqdefault.jpg"
              />
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost shrink-0 !py-2.5">
                <Upload size={15} /> Upload
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadThumbnail(e.target.files[0])}
              />
            </div>
            {form.thumbnail && (
              <img src={form.thumbnail} alt="thumbnail preview" className="mt-3 h-28 rounded-xl border border-white/10 object-cover" />
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" rows={3} className="input resize-y" value={form.description} onChange={set('description')} placeholder="What makes this edit work?" />
          </div>

          <div>
            <label className="label" htmlFor="tags">Tags (comma separated)</label>
            <input id="tags" className="input" value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags} onChange={set('tags')} placeholder="hook, captions, beat-sync" />
          </div>

          <div>
            <label className="label" htmlFor="order">Order tag</label>
            <input id="order" type="number" className="input" value={form.order} onChange={set('order')} placeholder="1" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={!!form.featured} onChange={set('featured')} className="h-4 w-4 accent-green-500" />
            Featured project
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={!!form.published} onChange={set('published')} className="h-4 w-4 accent-green-500" />
            Published
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {initial?._id ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 *  Draggable project row
 * ------------------------------------------------------------------ */
function ProjectRow({ project, onEdit, onDelete, onToggleFeatured, onTogglePublished }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={project}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3"
    >
      <button
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab touch-none text-slate-600 transition hover:text-neon active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-800">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-600"><FileText size={16} /></div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{project.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="uppercase tracking-wider text-neon">{project.category}</span>
          <span>·</span>
          <span className="uppercase">{project.platform}</span>
          {project.duration && (<><span>·</span><span>{project.duration}</span></>)}
          {!project.published && <span className="text-yellow-400">· draft</span>}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggleFeatured(project)}
          title={project.featured ? 'Unfeature' : 'Feature'}
          className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
            project.featured ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300' : 'border-white/10 text-slate-500 hover:text-yellow-300'
          }`}
        >
          <Star size={14} fill={project.featured ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => onTogglePublished(project)}
          title={project.published ? 'Unpublish' : 'Publish'}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-500 transition hover:text-neon"
        >
          {project.published ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={() => onEdit(project)}
          title="Edit"
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-500 transition hover:border-neon/50 hover:text-neon"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(project)}
          title="Delete"
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-500 transition hover:border-red-500/50 hover:text-red-400"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </Reorder.Item>
  );
}

/* ------------------------------------------------------------------ *
 *  Views
 * ------------------------------------------------------------------ */
function OverviewView({ stats, onRefresh }) {
  if (!stats) {
    return (
      <div className="flex items-center gap-3 py-20 text-slate-500">
        <Loader2 className="animate-spin text-neon" /> Loading stats…
      </div>
    );
  }

  const cards = [
    { label: 'Total projects', value: stats.projects.total, icon: FolderKanban, accent: 'text-neon' },
    { label: 'Short-form', value: stats.projects.shortForm, icon: Sparkles, accent: 'text-cyanx-400' },
    { label: 'Long-form', value: stats.projects.longForm, icon: Eye, accent: 'text-sky-400' },
    { label: 'VFX / Motion', value: stats.projects.vfx, icon: LayoutDashboard, accent: 'text-purple-400' },
    { label: 'Featured', value: stats.projects.featured, icon: Star, accent: 'text-yellow-300' },
    { label: 'Unread messages', value: stats.messages.unread, icon: Inbox, accent: 'text-orange-400' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-400">Live overview of the portfolio database.</p>
        <button onClick={onRefresh} className="btn-ghost !px-4 !py-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-500">{label}</span>
              <Icon size={16} className={accent} />
            </div>
            <p className="mt-3 font-display text-4xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5 text-sm text-slate-400">
          Email delivery:{' '}
          <span className={stats.mail === 'configured' ? 'text-neon' : 'text-yellow-300'}>
            {stats.mail === 'configured' ? 'Nodemailer SMTP configured' : 'disabled (messages are stored only)'}
          </span>
        </div>
        <div className="card p-5 text-sm text-slate-400">
          Media storage: <span className="text-neon">{stats.storage === 'cloudinary' ? 'Cloudinary' : 'Local /uploads'}</span>
        </div>
      </div>
    </div>
  );
}

function ProjectsView() {
  const [projects, setProjects] = useState(null);
  const [editing, setEditing] = useState(null); // null | {} | project
  const [dirtyOrder, setDirtyOrder] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = useCallback(() => {
    api('/projects/admin/all')
      .then((d) => setProjects(d.projects || []))
      .catch(() => setProjects([]));
  }, []);

  useEffect(load, [load]);

  const handleReorder = (next) => {
    setProjects(next);
    setDirtyOrder(true);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      await api('/projects/reorder', { method: 'PATCH', body: { ids: projects.map((p) => p._id) } });
      setDirtyOrder(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingOrder(false);
    }
  };

  const toggle = (project, field) =>
    api(`/projects/${project._id}`, { method: 'PUT', body: { [field]: !project[field] } })
      .then(load)
      .catch((err) => alert(err.message));

  const remove = async (project) => {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      await api(`/projects/${project._id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!projects) {
    return (
      <div className="flex items-center gap-3 py-20 text-slate-500">
        <Loader2 className="animate-spin text-neon" /> Loading projects…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing({})} className="btn-primary !px-5 !py-2.5">
            <Plus size={16} /> Add project
          </button>
          {dirtyOrder && (
            <button onClick={saveOrder} disabled={savingOrder} className="btn-ghost !px-4 !py-2.5">
              {savingOrder ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save order
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">{projects.length} projects · drag ⠿ to re-order</p>
      </div>

      <Reorder.Group axis="y" values={projects} onReorder={handleReorder} className="space-y-3">
        {projects.map((p) => (
          <ProjectRow
            key={p._id}
            project={p}
            onEdit={setEditing}
            onDelete={remove}
            onToggleFeatured={(proj) => toggle(proj, 'featured')}
            onTogglePublished={(proj) => toggle(proj, 'published')}
          />
        ))}
      </Reorder.Group>

      {projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-slate-500">
          No projects yet — add your first video.
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <ProjectForm
            initial={editing._id ? editing : null}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CvView() {
  const [cv, setCv] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  const load = useCallback(() => {
    api('/cv').then((d) => setCv(d.cv)).catch(() => setCv(null));
  }, []);
  useEffect(load, [load]);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('cv', file);
      const data = await apiUpload('/cv', fd);
      setMsg(data.message);
      load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete the current CV file?')) return;
    setBusy(true);
    try {
      await api('/cv', { method: 'DELETE' });
      load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-ink">CV / Resume file</h3>
        <p className="mt-1 text-sm text-slate-400">
          Upload a PDF — served from <span className="font-mono text-neon">/api/cv/file</span> and downloadable by
          visitors. Cloudinary is used automatically when configured.
        </p>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="truncate text-slate-300">{cv?.downloadName || 'No CV uploaded'}</span>
            {cv && <span className="font-mono text-[11px] text-slate-500">{cv.size < 10240 ? `${(cv.size / 1024).toFixed(1)} KB` : `${(cv.size / 1024 / 1024).toFixed(1)} MB`}</span>}
          </div>

          <button onClick={() => fileRef.current?.click()} disabled={busy} className="btn-primary w-full">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {cv ? 'Replace CV (PDF)' : 'Upload CV (PDF)'}
          </button>
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />

          <div className="flex gap-3">
            <a href="/api/cv/download" className="btn-ghost flex-1 !justify-center" download>
              <Download size={15} /> Download
            </a>
            <a href="/api/cv/file" target="_blank" rel="noreferrer" className="btn-ghost flex-1 !justify-center">
              <ExternalLink size={15} /> Open
            </a>
            {cv && (
              <button onClick={remove} disabled={busy} className="btn-ghost !border-red-500/40 !text-red-300">
                <Trash2 size={15} />
              </button>
            )}
          </div>

          {msg && <p className="text-neon-300">{msg}</p>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-white/10 px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-400">
          Live preview
        </div>
        <div className="relative h-[520px] bg-slate-900">
          {cv ? (
            <iframe src="/api/cv/file" title="CV preview" className="absolute inset-0 h-full w-full border-0" />
          ) : (
            <div className="grid h-full place-items-center text-sm text-slate-500">Upload a PDF to preview it here.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessagesView({ onRead }) {
  const [messages, setMessages] = useState(null);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => {
    api('/contact').then((d) => setMessages(d.messages || [])).catch(() => setMessages([]));
  }, []);
  useEffect(load, [load]);

  const open = async (m) => {
    setOpenId(m._id === openId ? null : m._id);
    if (!m.read) {
      try {
        await api(`/contact/${m._id}`, { method: 'PATCH', body: { read: true } });
        load();
        onRead?.();
      } catch {
        /* ignore */
      }
    }
  };

  const remove = async (m) => {
    if (!window.confirm('Delete this message?')) return;
    await api(`/contact/${m._id}`, { method: 'DELETE' });
    load();
  };

  if (!messages) {
    return (
      <div className="flex items-center gap-3 py-20 text-slate-500">
        <Loader2 className="animate-spin text-neon" /> Loading inbox…
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-slate-500">
        No messages yet. The contact form on the homepage lands here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m._id} className="card overflow-hidden">
          <button onClick={() => open(m)} className="flex w-full items-center gap-3 p-4 text-left">
            <span className={`h-2 w-2 shrink-0 rounded-full ${m.read ? 'bg-slate-600' : 'bg-neon shadow-glow'}`} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-ink">
                {m.subject || 'Project enquiry'} <span className="text-slate-500">— {m.name}</span>
              </span>
              <span className="block text-xs text-slate-500">
                {m.email} · {new Date(m.createdAt).toLocaleString()} {m.budget ? `· ${m.budget}` : ''}
              </span>
            </span>
            <Inbox size={15} className="shrink-0 text-slate-600" />
          </button>

          <AnimatePresence>
            {openId === m._id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div className="border-t border-white/10 px-4 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{m.message}</p>
                  <div className="mt-4 flex gap-3">
                    <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'your enquiry')}`} className="btn-ghost !px-4 !py-2">
                      <Mail size={14} /> Reply
                    </a>
                    <button onClick={() => remove(m)} className="btn-ghost !border-red-500/40 !px-4 !py-2 !text-red-300">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Dashboard shell
 * ------------------------------------------------------------------ */
const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'cv', label: 'CV File', icon: FileText },
  { id: 'messages', label: 'Messages', icon: Inbox },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('overview');
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(() => {
    api('/stats').then((d) => setStats(d.stats)).catch(() => setStats(null));
  }, []);
  useEffect(loadStats, [loadStats]);

  const signOut = () => {
    logout();
    navigate('/admin', { replace: true });
  };

  const unread = stats?.messages?.unread ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 lg:flex">
      {/* Sidebar */}
      <aside className="border-b border-white/10 bg-slate-900/40 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2.5 px-5 py-5 font-display font-bold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon-500 text-slate-950">
            <Clapperboard size={17} strokeWidth={2.4} />
          </span>
          CUT<span className="text-neon">/</span>ROOM
          <span className="ml-auto rounded-md border border-neon/40 px-1.5 py-0.5 font-mono text-[9px] uppercase text-neon">
            admin
          </span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                view === id ? 'bg-neon-500 text-slate-950 shadow-glow' : 'text-slate-400 hover:bg-white/5 hover:text-ink'
              }`}
            >
              <Icon size={16} />
              {label}
              {id === 'messages' && unread > 0 && (
                <span className={`ml-auto rounded-full px-1.5 text-[10px] font-bold ${view === id ? 'bg-slate-950 text-neon' : 'bg-neon text-slate-950'}`}>
                  {unread}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto hidden flex-col gap-2 border-t border-white/10 p-4 lg:flex">
          <a href="/" className="btn-ghost !justify-start !px-3.5 !py-2.5 text-slate-300">
            <ExternalLink size={14} /> View site
          </a>
          <button onClick={signOut} className="btn-ghost !justify-start !px-3.5 !py-2.5 !text-red-300 hover:!border-red-400/50">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-8">
          <div>
            <h1 className="font-display text-lg font-bold text-ink">{TABS.find((t) => t.id === view)?.label}</h1>
            <p className="text-xs text-slate-500">Signed in as {user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="btn-ghost !px-4 !py-2 lg:hidden">
              <ExternalLink size={14} /> Site
            </a>
            <button onClick={signOut} className="btn-ghost !px-4 !py-2 lg:hidden">
              <LogOut size={14} /> Out
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-8">
          {/* Tab panels render instantly - no exit-animation dependency */}
          <div key={view}>
            {view === 'overview' && <OverviewView stats={stats} onRefresh={loadStats} />}
            {view === 'projects' && <ProjectsView />}
            {view === 'cv' && <CvView />}
            {view === 'messages' && <MessagesView onRead={loadStats} />}
          </div>
        </div>
      </main>
    </div>
  );
}
