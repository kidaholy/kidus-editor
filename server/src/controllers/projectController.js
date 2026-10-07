import Project, { CATEGORIES, PLATFORMS } from '../models/Project.js';
import { resolveVideoLink, parseVideoUrl, buildEmbedHtml } from '../utils/embedParser.js';
import { asyncHandler } from '../middleware/auth.js';

const SORT = { order: 1, createdAt: -1 };

/** GET /api/projects?category=short-form&featured=true&q=text  (public) */
export const listProjects = asyncHandler(async (req, res) => {
  const { category, featured, q, platform } = req.query;
  const filter = {};

  if (category && category !== 'all' && CATEGORIES.includes(category)) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (platform && platform !== 'all' && PLATFORMS.includes(platform)) filter.platform = platform;
  if (q) filter.$or = [{ title: new RegExp(String(q), 'i') }, { description: new RegExp(String(q), 'i') }];
  filter.published = { $ne: false };

  const projects = await Project.find(filter).sort(SORT).lean({ virtuals: true });
  res.json({ success: true, count: projects.length, projects });
});

/** GET /api/projects/admin  (protected, includes unpublished) */
export const listAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().sort(SORT).lean({ virtuals: true });
  res.json({ success: true, count: projects.length, projects });
});

/** GET /api/projects/:id (public) */
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).lean({ virtuals: true });
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json({ success: true, project });
});

/**
 * POST /api/projects/parse-link  { url }  (protected)
 * Auto-parsing utility: extracts platform, embed code and thumbnail when a link is pasted.
 */
export const parseLink = asyncHandler(async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ success: false, message: 'A video URL is required' });

  const info = await resolveVideoLink(url);
  if (!info.ok) return res.status(422).json({ success: false, message: info.error });

  res.json({
    success: true,
    link: {
      platform: info.platform,
      kind: info.kind,
      embedUrl: info.embedUrl,
      embedCode: buildEmbedHtml(info),
      thumbnail: info.thumbnail || '',
      title: info.title || '',
      author: info.author || '',
      watchUrl: info.watchUrl,
      warning: info.warning || (info.oembedFailed ? 'Metadata lookup was blocked - thumbnail/title must be entered manually' : ''),
    },
  });
});

/** POST /api/projects  (protected) */
export const createProject = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (typeof body.tags === 'string') body.tags = body.tags.split(',').map((t) => t.trim()).filter(Boolean);
  if (Array.isArray(body.order)) body.order = Number(body.order[0]) || 0;
  body.order = Number(body.order ?? 0);
  body.featured = body.featured === true || body.featured === 'true' || body.featured === 'on';

  if (!body.embedUrl) {
    const info = parseVideoUrl(body.videoUrl);
    if (!info.ok) return res.status(422).json({ success: false, message: info.error });
    body.platform = info.platform;
    body.embedUrl = info.embedUrl;
    if (!body.thumbnail) body.thumbnail = info.thumbnailUrl || '';
  }

  if (req.file) body.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
  if (!body.order) {
    const last = await Project.findOne().sort({ order: -1 }).select('order').lean();
    body.order = (last?.order ?? 0) + 1;
  }

  const project = await Project.create(body);
  res.status(201).json({ success: true, project });
});

/** PUT /api/projects/:id  (protected) */
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const body = { ...req.body };
  delete body._id;
  if (typeof body.tags === 'string') body.tags = body.tags.split(',').map((t) => t.trim()).filter(Boolean);
  if (Array.isArray(body.order)) body.order = Number(body.order[0]) || 0;
  if (body.order !== undefined) body.order = Number(body.order);
  if (body.featured !== undefined) body.featured = body.featured === true || body.featured === 'true' || body.featured === 'on';

  // Re-parse when the link changed and no embed was supplied explicitly.
  if (body.videoUrl && body.videoUrl !== project.videoUrl && !body.embedUrl) {
    const info = parseVideoUrl(body.videoUrl);
    if (info.ok) {
      body.platform = info.platform;
      body.embedUrl = info.embedUrl;
      if (!body.thumbnail) body.thumbnail = info.thumbnailUrl || '';
    }
  }

  if (req.file) body.thumbnail = `/uploads/thumbnails/${req.file.filename}`;

  Object.assign(project, body);
  await project.save();
  res.json({ success: true, project });
});

/** DELETE /api/projects/:id  (protected) */
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json({ success: true, message: `"${project.title}" deleted` });
});

/** PATCH /api/projects/reorder  { ids: [...] }  (protected) */
export const reorderProjects = asyncHandler(async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids)) return res.status(400).json({ success: false, message: 'ids array is required' });

  const ops = ids.map((id, index) => ({
    updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } },
  }));
  const result = await Project.bulkWrite(ops);
  res.json({ success: true, modified: result.modifiedCount });
});

/** GET /api/projects/meta/options  (protected) - form dropdown data */
export const options = asyncHandler(async (req, res) => {
  res.json({ success: true, categories: CATEGORIES, platforms: PLATFORMS });
});
