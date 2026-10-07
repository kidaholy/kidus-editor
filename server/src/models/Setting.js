import mongoose from 'mongoose';

/** Tiny key/value collection used for CV metadata and site settings. */
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

settingSchema.statics.get = async function get(key, fallback = null) {
  const doc = await this.findOne({ key }).lean();
  return doc ? doc.value : fallback;
};

settingSchema.statics.set = async function set(key, value) {
  return this.findOneAndUpdate({ key }, { $set: { value } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
};

export default mongoose.model('Setting', settingSchema);
