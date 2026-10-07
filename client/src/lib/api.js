const BASE = '/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

/**
 * Tiny fetch wrapper around the Express API.
 * api('/projects') -> GET /api/projects
 */
export async function api(path, { method = 'GET', body, formData, headers = {} } = {}) {
  const finalHeaders = { ...headers };
  const token = getToken();
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (body) finalHeaders['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

export const apiUpload = (path, formData, method = 'POST') => api(path, { method, formData });

export const downloadFilename = (url) => url.split('/').pop() || 'cv.pdf';
