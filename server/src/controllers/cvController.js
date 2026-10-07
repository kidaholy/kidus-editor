import fs from 'node:fs';
import path from 'node:path';
import Setting from '../models/Setting.js';
import { asyncHandler } from '../middleware/auth.js';
import { CV_DIR, cvFilename } from '../middleware/upload.js';

const CV_KEY = 'cv';
const DEFAULT_CV_URL = '/uploads/cv/';

/** GET /api/cv  (public) */
export const getCv = asyncHandler(async (req, res) => {
  const cv = await Setting.get(CV_KEY, null);
  res.json({ success: true, cv });
});

/** GET /api/cv/file  (public) - serves the latest PDF */
export const getCvFile = asyncHandler(async (req, res) => {
  const cv = await Setting.get(CV_KEY, null);
  if (!cv?.filename) return res.status(404).json({ success: false, message: 'No CV uploaded yet' });

  const localPath = path.join(CV_DIR, cv.filename);
  if (cv.storage === 'local' && fs.existsSync(localPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${cv.downloadName || 'cv.pdf'}"`);
    return fs.createReadStream(localPath).pipe(res);
  }

  if (cv.url) return res.redirect(cv.url);
  return res.status(404).json({ success: false, message: 'CV file missing on server' });
});

/** GET /api/cv/download  (public) - forces download */
export const downloadCv = asyncHandler(async (req, res) => {
  const cv = await Setting.get(CV_KEY, null);
  if (!cv?.filename && !cv?.url) return res.status(404).json({ success: false, message: 'No CV uploaded yet' });

  const localPath = path.join(CV_DIR, cv.filename || '');
  if (cv.storage === 'local' && fs.existsSync(localPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cv.downloadName || 'cv.pdf'}"`);
    return fs.createReadStream(localPath).pipe(res);
  }
  return res.redirect(cv.url);
});

/**
 * POST /api/cv  (protected) - multipart field name: cv
 * Stores on Cloudinary when STORAGE=cloudinary + CLOUDINARY_URL are set, else locally.
 */
export const uploadCv = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) return res.status(400).json({ success: false, message: 'PDF file is required (field: cv)' });

  const filename = cvFilename();
  const downloadName = `CV-${new Date().toISOString().slice(0, 10)}.pdf`;
  let record = {
    filename,
    downloadName,
    originalName: req.file.originalname,
    size: req.file.size,
    storage: 'local',
    url: `/uploads/cv/${filename}`,
    updatedAt: new Date().toISOString(),
  };

  const useCloud = process.env.STORAGE === 'cloudinary' && !!process.env.CLOUDINARY_URL;
  if (useCloud) {
    try {
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({ url: process.env.CLOUDINARY_URL });
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: process.env.CLOUDINARY_FOLDER || 'portfolio/cv', resource_type: 'raw', format: 'pdf' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      record = { ...record, storage: 'cloudinary', filename: uploaded.public_id, url: uploaded.secure_url, cloudinaryId: uploaded.public_id };
    } catch (err) {
      console.error('[cv] cloudinary upload failed, keeping local copy:', err.message);
    }
  }

  if (record.storage === 'local') {
    fs.mkdirSync(CV_DIR, { recursive: true });
    fs.writeFileSync(path.join(CV_DIR, filename), req.file.buffer);
  }

  await Setting.set(CV_KEY, record);
  res.json({ success: true, message: 'CV uploaded', cv: record });
});

/** DELETE /api/cv  (protected) */
export const deleteCv = asyncHandler(async (req, res) => {
  const cv = await Setting.get(CV_KEY, null);
  if (cv?.storage === 'local' && cv.filename) {
    const localPath = path.join(CV_DIR, cv.filename);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  }
  await Setting.set(CV_KEY, null);
  res.json({ success: true, message: 'CV removed' });
});
