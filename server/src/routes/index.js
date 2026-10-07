import { Router } from 'express';
import authRoutes from './auth.js';
import projectRoutes from './projects.js';
import cvRoutes from './cv.js';
import contactRoutes, { statsRouter } from './contact.js';

const router = Router();

router.get('/health', (req, res) =>
  res.json({ success: true, status: 'ok', uptime: Math.round(process.uptime()), time: new Date().toISOString() })
);

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/cv', cvRoutes);
router.use('/contact', contactRoutes);
router.use('/stats', statsRouter);

export default router;
