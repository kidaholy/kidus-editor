import fs from 'node:fs';
import path from 'node:path';
import Setting from '../models/Setting.js';
import { asyncHandler } from '../middleware/auth.js';
import { CV_DIR, cvFilename } from '../middleware/upload.js';

const CV_KEY = 'cv';
const CV_BUFFER_KEY = 'cv_buffer'; // Stores base64 PDF for serverless environments

/** GET /api/cv  (public) */
export const getCv = asyncHandler(async (req, res) => {
  const cv = await Setting.get(CV_KEY, null);
  res.json({ success: true, cv });
});

/**
 * Shared helper: streams the PDF to the response.
 * Priority: MongoDB buffer → Cloudinary URL → local disk → 404
 */
async function streamCv(res, disposition) {
  const cv = await Setting.get(CV_KEY, null);
  if (!cv) return res.status(404).json({ success: false, message: 'No CV uploaded yet' });

  const filename = cv.downloadName || 'cv.pdf';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);

  // 1. Prefer the in-DB buffer (always available, survives serverless cold starts)
  const stored = await Setting.get(CV_BUFFER_KEY, null);
  if (stored?.data) {
    const buf = Buffer.from(stored.data, 'base64');
    res.setHeader('Content-Length', buf.length);
    return res.end(buf);
  }

  // 2. Cloudinary or other absolute external URL
  if (cv.url && /^https?:\/\//i.test(cv.url)) {
    return res.redirect(cv.url);
  }

  // 3. Local disk (only reliable in non-serverless environments)
  if (cv.filename) {
    const localPath = path.join(CV_DIR, cv.filename);
    if (fs.existsSync(localPath)) {
      return fs.createReadStream(localPath).pipe(res);
    }
  }

  return res.status(404).json({ success: false, message: 'CV file is not available. Please re-upload it from the dashboard.' });
}

/** GET /api/cv/file  (public) - serves the latest PDF inline */
export const getCvFile = asyncHandler(async (req, res) => {
  return streamCv(res, 'inline');
});

/** GET /api/cv/download  (public) - forces download */
export const downloadCv = asyncHandler(async (req, res) => {
  return streamCv(res, 'attachment');
});

/**
 * POST /api/cv  (protected) - multipart field name: cv
 * Stores on Cloudinary when STORAGE=cloudinary + CLOUDINARY_URL are set,
 * otherwise saves to local disk AND stores the buffer in MongoDB for serverless resilience.
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
    // Write to disk (works in local dev)
    fs.mkdirSync(CV_DIR, { recursive: true });
    fs.writeFileSync(path.join(CV_DIR, filename), req.file.buffer);
  }

  // Always persist the buffer in MongoDB so it survives serverless cold starts
  await Setting.set(CV_BUFFER_KEY, { data: req.file.buffer.toString('base64'), size: req.file.size });

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
  await Setting.set(CV_BUFFER_KEY, null);
  res.json({ success: true, message: 'CV removed' });
});
