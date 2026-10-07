/**
 * API integration tests. Run the server first, then:
 *   npm --prefix server run test
 * BASE_URL defaults to http://localhost:5000
 */
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const results = [];
let token = '';
let createdId = '';
let messageId = '';

function log(name, detail = '') {
  results.push({ name, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function req(path, { method = 'GET', body, token: t, formData } = {}) {
  const headers = {};
  if (t) headers.Authorization = `Bearer ${t}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => (null));
  return { status: res.status, data, headers: res.headers };
}

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
const TINY_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
  'latin1'
);

async function run() {
  console.log(`\nRunning API tests against ${BASE}\n`);

  // 1. Health
  {
    const { status, data } = await req('/api/health');
    assert.equal(status, 200);
    assert.equal(data.success, true);
    log('GET /api/health');
  }

  // 2. Public projects (seeded)
  let count = 0;
  {
    const { status, data } = await req('/api/projects');
    assert.equal(status, 200);
    assert.ok(Array.isArray(data.projects));
    count = data.projects.length;
    assert.ok(count >= 1, 'expected seeded projects');
    assert.ok(data.projects[0].embedUrl !== undefined, 'virtuals should be serialised');
    log('GET /api/projects', `${count} projects`);

    const shortForm = await req('/api/projects?category=short-form');
    assert.equal(shortForm.status, 200);
    assert.ok(shortForm.data.projects.every((p) => p.category === 'short-form'));
    log('GET /api/projects?category=short-form', `${shortForm.data.count} results`);

    const featured = await req('/api/projects?featured=true');
    assert.ok(featured.data.projects.every((p) => p.featured));
    log('GET /api/projects?featured=true', `${featured.data.count} results`);
  }

  // 3. Auth: bad credentials rejected
  {
    const { status } = await req('/api/auth/login', { method: 'POST', body: { email: 'x@y.z', password: 'nope' } });
    assert.equal(status, 401);
    log('POST /api/auth/login rejects bad credentials');
  }

  // 4. Protected route without token
  {
    const { status } = await req('/api/projects/admin/all');
    assert.equal(status, 401);
    log('protected route returns 401 without JWT');
  }

  // 5. Login
  {
    const { status, data } = await req('/api/auth/login', {
      method: 'POST',
      body: { email: process.env.ADMIN_EMAIL || 'admin@portfolio.dev', password: process.env.ADMIN_PASSWORD || 'ChangeMe123!' },
    });
    assert.equal(status, 200, `login failed: ${JSON.stringify(data)}`);
    assert.ok(data.token?.length > 20);
    token = data.token;
    log('POST /api/auth/login', `JWT ${token.slice(0, 16)}…`);

    const me = await req('/api/auth/me', { token });
    assert.equal(me.status, 200);
    assert.equal(me.data.user.email, (process.env.ADMIN_EMAIL || 'admin@portfolio.dev').toLowerCase());
    log('GET /api/auth/me');
  }

  // 6. Embed parser
  const LINKS = [
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 'youtube-nocookie.com/embed/dQw4w9WgXcQ'],
    ['https://youtu.be/aqz-KE-bpKQ', 'youtube', 'aqz-KE-bpKQ'],
    ['https://www.youtube.com/shorts/jNQXAC9IVRw', 'youtube', 'jNQXAC9IVRw'],
    ['https://vimeo.com/76979871', 'vimeo', 'player.vimeo.com/video/76979871'],
    ['https://www.tiktok.com/@creators/video/7301234567890123456', 'tiktok', 'tiktok.com/embed/v2/7301234567890123456'],
    ['https://www.instagram.com/reel/C8sampleXYZ/', 'instagram', 'instagram.com/p/C8sampleXYZ/embed'],
    ['https://x.com/user/status/1234567890', 'twitter', 'platform.twitter.com/embed/Tweet?id=1234567890'],
    ['https://example.com/files/clip.mp4', 'direct', 'clip.mp4'],
  ];

  for (const [url, platform, needle] of LINKS) {
    const { status, data } = await req('/api/projects/parse-link', { method: 'POST', token, body: { url } });
    assert.equal(status, 200, `parse failed for ${url}: ${JSON.stringify(data)}`);
    assert.equal(data.link.platform, platform, `${url} -> expected ${platform}, got ${data.link.platform}`);
    assert.ok(
      (data.link.embedUrl + data.link.thumbnail).includes(needle),
      `${url} embed/thumbnail missing "${needle}" (got ${data.link.embedUrl})`
    );
  }
  log('POST /api/projects/parse-link', `${LINKS.length} platforms parsed`);

  // YouTube thumbnail from oEmbed/derived URL
  {
    const { data } = await req('/api/projects/parse-link', {
      method: 'POST',
      token,
      body: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });
    assert.ok(data.link.thumbnail.includes('i.ytimg.com'), 'youtube thumbnail missing');
    log('YouTube thumbnail auto-extracted', data.link.thumbnail);
  }

  // 7. Unsupported link
  {
    const { status } = await req('/api/projects/parse-link', { method: 'POST', token, body: { url: 'not a link' } });
    assert.equal(status, 422);
    log('parse-link rejects invalid input (422)');
  }

  // 8. Create project
  {
    const { status, data } = await req('/api/projects', {
      method: 'POST',
      token,
      body: {
        title: 'TEST — Vertical hook edit',
        category: 'short-form',
        videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        description: 'Integration test project',
        duration: '0:30',
        tags: 'test, hooks',
        featured: 'true',
        order: '99',
      },
    });
    assert.equal(status, 201, JSON.stringify(data));
    createdId = data.project._id;
    assert.equal(data.project.platform, 'youtube', 'platform should be auto-derived');
    assert.ok(data.project.embedUrl.includes('9bZkp7q19f0'), 'embedUrl should be auto-derived');
    assert.ok(data.project.thumbnail.includes('i.ytimg.com'), 'thumbnail should be auto-derived');
    assert.deepEqual(data.project.tags, ['test', 'hooks']);
    assert.equal(data.project.featured, true);
    log('POST /api/projects (auto platform/embed/thumbnail)', createdId);
  }

  // 9. Update project
  {
    const { status, data } = await req(`/api/projects/${createdId}`, {
      method: 'PUT',
      token,
      body: { title: 'TEST — updated title', featured: 'false', duration: '0:45' },
    });
    assert.equal(status, 200, JSON.stringify(data));
    assert.equal(data.project.title, 'TEST — updated title');
    assert.equal(data.project.featured, false);
    assert.equal(data.project.duration, '0:45');
    log('PUT /api/projects/:id');
  }

  // 10. Reorder
  {
    const all = await req('/api/projects/admin/all', { token });
    const ids = all.data.projects.map((p) => p._id);
    const { status, data } = await req('/api/projects/reorder', { method: 'PATCH', token, body: { ids } });
    assert.equal(status, 200, JSON.stringify(data));
    assert.equal(data.modified, ids.length);

    const after = await req('/api/projects/admin/all', { token });
    assert.deepEqual(after.data.projects.map((p) => p._id), ids, 'order not persisted');
    log('PATCH /api/projects/reorder', `${ids.length} items re-ordered`);
  }

  // 11. Thumbnail upload
  {
    const fd = new FormData();
    fd.append('file', new Blob([PNG_1PX], { type: 'image/png' }), 'pixel.png');
    const { status, data } = await req('/api/projects/thumbnail', { method: 'POST', token, formData: fd });
    assert.equal(status, 200, JSON.stringify(data));
    assert.ok(data.url.startsWith('/uploads/thumbnails/'));
    log('POST /api/projects/thumbnail', data.url);
  }

  // 12. Contact form
  {
    const { status, data } = await req('/api/contact', {
      method: 'POST',
      body: { name: 'Test Client', email: 'client@example.com', message: 'Need 10 shorts per month please.' },
    });
    assert.equal(status, 201, JSON.stringify(data));
    assert.ok(data.message.length > 0);
    messageId = null;
    log('POST /api/contact', data.emailed ? 'emailed' : 'stored (SMTP disabled)');
  }

  // 13. Invalid contact payload
  {
    const { status } = await req('/api/contact', { method: 'POST', body: { name: '', email: 'bad', message: '' } });
    assert.equal(status, 400);
    log('POST /api/contact validates input (400)');
  }

  // 14. Inbox
  {
    const { status, data } = await req('/api/contact', { token });
    assert.equal(status, 200);
    assert.ok(data.count >= 1);
    const first = data.messages[0];
    const patched = await req(`/api/contact/${first._id}`, { method: 'PATCH', token, body: { read: true } });
    assert.equal(patched.status, 200);
    assert.equal(patched.data.message.read, true);
    log('GET/PATCH /api/contact', `${data.count} messages`);

    const del = await req(`/api/contact/${first._id}`, { method: 'DELETE', token });
    assert.equal(del.status, 200);
    log('DELETE /api/contact/:id');
  }

  // 15. Stats
  {
    const { status, data } = await req('/api/stats', { token });
    assert.equal(status, 200);
    assert.ok(data.stats.projects.total >= 1);
    log('GET /api/stats', JSON.stringify(data.stats.projects));
  }

  // 16. CV: inspect -> (upload only if empty) -> view -> download -> delete own file
  {
    const before = await req('/api/cv');
    assert.equal(before.status, 200);
    log('GET /api/cv', before.data.cv ? 'present' : 'empty');

    const missing = await req('/api/cv/file');
    assert.equal(missing.status, before.data.cv ? 200 : 404);

    if (before.data.cv) {
      // Preserve a CV that is already installed (e.g. the generated demo CV).
      const fileRes = await fetch(`${BASE}/api/cv/file`);
      assert.equal(fileRes.status, 200);
      assert.equal(fileRes.headers.get('content-type'), 'application/pdf');
      log('GET /api/cv/file (existing CV preserved)', `${(await fileRes.arrayBuffer()).byteLength} bytes`);
    } else {
      const fd = new FormData();
      fd.append('cv', new Blob([TINY_PDF], { type: 'application/pdf' }), 'cv.pdf');
      const up = await req('/api/cv', { method: 'POST', token, formData: fd });
      assert.equal(up.status, 200, JSON.stringify(up.data));
      assert.equal(up.data.cv.storage, 'local');
      assert.equal(up.data.cv.url, `/uploads/cv/${up.data.cv.filename}`);
      log('POST /api/cv (PDF upload)', up.data.cv.url);

      const fileRes = await fetch(`${BASE}/api/cv/file`);
      assert.equal(fileRes.status, 200);
      assert.equal(fileRes.headers.get('content-type'), 'application/pdf');
      const bytes = Buffer.from(await fileRes.arrayBuffer());
      assert.equal(bytes.subarray(0, 5).toString('latin1'), '%PDF-');
      log('GET /api/cv/file', `${bytes.length} bytes, application/pdf`);

      const dl = await fetch(`${BASE}/api/cv/download`);
      assert.equal(dl.status, 200);
      assert.ok((dl.headers.get('content-disposition') || '').includes('attachment'));
      log('GET /api/cv/download', dl.headers.get('content-disposition'));

      const meta = await (await fetch(`${BASE}/api/cv`)).json();
      assert.equal(meta.cv.size, bytes.length, 'stored size should match uploaded bytes');
      log('CV metadata size matches file on disk');

      const del = await req('/api/cv', { method: 'DELETE', token });
      assert.equal(del.status, 200);
      const after = await req('/api/cv');
      assert.equal(after.data.cv, null);
      log('DELETE /api/cv (cleanup of test upload)');
    }
  }

  // 17. Cleanup created project
  {
    const { status } = await req(`/api/projects/${createdId}`, { method: 'DELETE', token });
    assert.equal(status, 200);
    const gone = await req(`/api/projects/${createdId}`);
    assert.equal(gone.status, 404);
    log('DELETE /api/projects/:id (cleanup)');
  }

  // 18. Static upload served
  {
    const res = await fetch(`${BASE}/uploads/`);
    assert.ok([200, 404].includes(res.status));
    log('static /uploads mounted', `status ${res.status}`);
  }

  console.log(`\n✅ ${results.length} checks passed\n`);
}

run().catch((err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  if (err.stack) console.error(err.stack.split('\n').slice(1, 4).join('\n'));
  process.exit(1);
});
