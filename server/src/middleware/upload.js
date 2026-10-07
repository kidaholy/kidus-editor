import multer from 'multer';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// On Vercel the deployment filesystem is read-only; only /tmp is writable.
// Files there are ephemeral (lost on instance recycle) but keep uploads working.
const onServerless = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
export const UPLOAD_ROOT = onServerless
  ? path.join(os.tmpdir(), 'portfolio-uploads')
  : path.join(__dirname, '..', '..', 'uploads');
export const THUMBNAIL_DIR = path.join(UPLOAD_ROOT, 'thumbnails');
export const CV_DIR = path.join(UPLOAD_ROOT, 'cv');

for (const dir of [UPLOAD_ROOT, THUMBNAIL_DIR, CV_DIR]) fs.mkdirSync(dir, { recursive: true });

// Thumbnails land on disk -> served statically from /uploads/thumbnails
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, THUMBNAIL_DIR),
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `thumb-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
  },
});

function imageFilter(req, file, cb) {
  if (/^image\/(png|jpe?g|webp|gif|avif)$/.test(file.mimetype)) return cb(null, true);
  cb(Object.assign(new Error('Only image files are allowed'), { status: 400 }));
}

function pdfFilter(req, file, cb) {
  if (file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname)) return cb(null, true);
  cb(Object.assign(new Error('CV must be a PDF file'), { status: 400 }));
}

export const uploadThumbnail = multer({ storage: thumbnailStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
// CV is kept in memory so it can be streamed to Cloudinary, then written locally.
export const uploadCv = multer({ storage: multer.memoryStorage(), fileFilter: pdfFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export const cvFilename = () => `cv-${Date.now()}.pdf`;
