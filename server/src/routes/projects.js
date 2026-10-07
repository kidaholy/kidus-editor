import { Router } from 'express';
import {
  listProjects,
  listAllProjects,
  getProject,
  parseLink,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  options,
} from '../controllers/projectController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { uploadThumbnail } from '../middleware/upload.js';

const router = Router();

// Public
router.get('/', listProjects);
router.get('/meta/options', options);
router.get('/:id', getProject);

// Admin (protected)
router.get('/admin/all', protect, listAllProjects);
router.post('/parse-link', protect, parseLink);
router.post('/thumbnail', protect, uploadThumbnail.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Image file is required (field: file)' });
  res.json({ success: true, url: `/uploads/thumbnails/${req.file.filename}` });
});
router.post('/', protect, requireRole('admin', 'editor'), uploadThumbnail.single('thumbnail'), createProject);
router.put('/:id', protect, uploadThumbnail.single('thumbnail'), updateProject);
router.patch('/reorder', protect, reorderProjects);
router.delete('/:id', protect, deleteProject);

export default router;
