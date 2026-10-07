import nodemailer from 'nodemailer';
import Message from '../models/Message.js';
import Project from '../models/Project.js';
import { asyncHandler } from '../middleware/auth.js';

function smtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER);
}

async function sendMail({ name, email, subject, message, budget }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"${name}" <${process.env.SMTP_USER}>`,
    to: process.env.MAIL_TO || process.env.SMTP_USER,
    replyTo: email,
    subject: `[Portfolio] ${subject || 'New project enquiry'}${budget ? ` (${budget})` : ''}`,
    text: `${message}\n\n---\nFrom: ${name} <${email}>`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;background:#0F172A;color:#F8FAFC;padding:24px;border-radius:12px">
        <h2 style="color:#22C55E;margin:0 0 16px">${subject || 'New project enquiry'}</h2>
        <p style="white-space:pre-wrap;line-height:1.6">${message}</p>
        <hr style="border:none;border-top:1px solid #1E293B;margin:16px 0"/>
        <p style="color:#94A3B8;font-size:13px">From: ${name} &lt;${email}&gt;${budget ? ` · Budget: ${budget}` : ''}</p>
      </div>`,
  });
}

/** POST /api/contact  (public) */
export const createMessage = asyncHandler(async (req, res) => {
  const { name, email, message, subject, budget } = req.body || {};
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  const doc = await Message.create({ name, email, message, subject, budget });

  let emailed = false;
  if (smtpConfigured()) {
    try {
      await sendMail({ name, email, message, subject, budget });
      emailed = true;
    } catch (err) {
      console.error('[contact] email failed:', err.message);
    }
  }
  if (emailed) await Message.updateOne({ _id: doc._id }, { $set: { emailed: true } });

  res.status(201).json({
    success: true,
    message: 'Thanks! Your message has been sent - I usually reply within 24 hours.',
    emailed,
  });
});

/** GET /api/contact  (protected) */
export const listMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, count: messages.length, messages });
});

/** PATCH /api/contact/:id  (protected) */
export const updateMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { $set: { read: req.body?.read ?? true } }, { new: true });
  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
  res.json({ success: true, message });
});

/** DELETE /api/contact/:id  (protected) */
export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
  res.json({ success: true, message: 'Message deleted' });
});

/** GET /api/stats  (protected) - dashboard overview numbers */
export const getStats = asyncHandler(async (req, res) => {
  const [total, shortForm, longForm, vfx, featured, unread] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ category: 'short-form' }),
    Project.countDocuments({ category: 'long-form' }),
    Project.countDocuments({ category: 'vfx-motion' }),
    Project.countDocuments({ featured: true }),
    Message.countDocuments({ read: false }),
  ]);

  res.json({
    success: true,
    stats: {
      projects: { total, shortForm, longForm, vfx, featured },
      messages: { unread, total: await Message.countDocuments() },
      mail: smtpConfigured() ? 'configured' : 'disabled',
      storage: process.env.STORAGE === 'cloudinary' && process.env.CLOUDINARY_URL ? 'cloudinary' : 'local',
    },
  });
});
