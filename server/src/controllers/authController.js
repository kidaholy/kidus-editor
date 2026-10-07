import User from '../models/User.js';
import { signToken, asyncHandler } from '../middleware/auth.js';

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken({ id: user._id, role: user.role });
  return res.json({ success: true, token, user });
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

/** PUT /api/auth/password */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.user._id).select('+password');
  if (currentPassword && !(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});
