import mongoose from 'mongoose';

export const CATEGORIES = ['short-form', 'long-form', 'vfx-motion'];
export const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'vimeo', 'twitter', 'direct', 'other'];

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 160 },
    category: { type: String, enum: CATEGORIES, default: 'short-form', index: true },
    platform: { type: String, enum: PLATFORMS, default: 'other' },

    // Original link pasted by the admin (YouTube / TikTok / Vimeo / Instagram / direct file)
    videoUrl: { type: String, required: [true, 'Video link is required'], trim: true },
    // Auto-generated player embed (YouTube iframe, TikTok embed, Vimeo player, <video>...)
    embedUrl: { type: String, default: '' },
    // Optional custom embed code that overrides embedUrl when present
    embedCode: { type: String, default: '' },

    thumbnail: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 2000 },
    duration: { type: String, default: '' },
    tags: { type: [String], default: [] },

    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0, index: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

projectSchema.index({ title: 'text', description: 'text', tags: 'text' });

/** Returns the code the client should render inside ProjectModal. */
projectSchema.virtual('playerCode').get(function playerCode() {
  if (this.embedCode && this.embedCode.trim()) return this.embedCode.trim();
  return this.embedUrl || '';
});

export default mongoose.model('Project', projectSchema);
