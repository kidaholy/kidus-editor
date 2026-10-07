import { Router } from 'express';
import {
  createMessage,
  listMessages,
  updateMessage,
  deleteMessage,
  getStats,
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', createMessage);
router.get('/', protect, listMessages);
router.patch('/:id', protect, updateMessage);
router.delete('/:id', protect, deleteMessage);

export const statsRouter = Router();
statsRouter.get('/', protect, getStats);

export default router;
