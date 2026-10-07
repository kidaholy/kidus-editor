import { Router } from 'express';
import { getCv, getCvFile, downloadCv, uploadCv, deleteCv } from '../controllers/cvController.js';
import { protect } from '../middleware/auth.js';
import { uploadCv as uploadCvMw } from '../middleware/upload.js';

const router = Router();

router.get('/', getCv);
router.get('/file', getCvFile);
router.get('/download', downloadCv);
router.post('/', protect, uploadCvMw.single('cv'), uploadCv);
router.delete('/', protect, deleteCv);

export default router;
