export function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status =
    err.status || (err.name === 'MulterError' || err.name === 'ValidationError' ? 400 : err.name === 'CastError' ? 400 : 500);

  const message =
    err.name === 'ValidationError'
      ? Object.values(err.errors || {}).map((e) => e.message).join(', ') || err.message
      : err.code === 11000
        ? 'Duplicate value for a unique field'
        : err.message || 'Server error';

  if (status >= 500) console.error('[api]', err);
  res.status(status).json({ success: false, message });
}
