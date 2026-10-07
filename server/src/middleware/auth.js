import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/** Verifies `Authorization: Bearer <jwt>` and attaches req.user. */
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated: missing token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'Session no longer valid' });

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError' ? 'Session expired, please log in again' : 'Invalid token',
    });
  }
}

/** Optional role gate for future multi-user setups. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  };
}

/** Wraps async controllers so rejections reach the error handler. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
