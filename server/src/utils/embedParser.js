/**
 * Social media embed parser.
 *
 * parseVideoUrl(url)     -> synchronous platform detection + embed/thumbnail URLs
 * resolveVideoLink(url)  -> parse + best-effort oEmbed metadata (title, author, thumbnail)
 *
 * Supported: YouTube (watch / shorts / youtu.be / embed / live), TikTok, Vimeo,
 * Instagram (p / reel / reels), X/Twitter, and direct video files (mp4/webm/mov...).
 */

const DIRECT_FILE_RE = /\.(mp4|webm|mov|m4v|ogv|ogg|mkv|m3u8)(\?.*)?$/i;
const YOUTUBE_RE =
  /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;
const TIKTOK_RE = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/i;
const INSTAGRAM_RE = /instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/i;
const TWITTER_RE = /(?:twitter\.com|x\.com)\/\w+\/status(?:es)?\/(\d+)/i;

function absolutize(raw = '') {
  const url = String(raw).trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (/^\/\//.test(url)) return `https:${url}`;
  if (/^[\w-]+\.[a-z]{2,}\//i.test(url)) return `https://${url}`;
  return '';
}

export function parseVideoUrl(rawUrl) {
  const url = absolutize(rawUrl);
  if (!url) return { ok: false, error: 'Please paste a valid link' };

  let m;

  if ((m = url.match(YOUTUBE_RE))) {
    const id = m[1];
    return {
      ok: true,
      platform: 'youtube',
      kind: 'embed',
      id,
      url,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&autoplay=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      oembedUrl: `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
    };
  }

  if ((m = url.match(VIMEO_RE))) {
    const id = m[1];
    return {
      ok: true,
      platform: 'vimeo',
      kind: 'embed',
      id,
      url,
      watchUrl: `https://vimeo.com/${id}`,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1`,
      thumbnailUrl: '',
      oembedUrl: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}`,
    };
  }

  if ((m = url.match(TIKTOK_RE))) {
    const id = m[1];
    return {
      ok: true,
      platform: 'tiktok',
      kind: 'embed',
      id,
      url,
      watchUrl: url.split('?')[0],
      embedUrl: `https://www.tiktok.com/embed/v2/${id}?autoplay=1`,
      thumbnailUrl: '',
      // TikTok's public oEmbed endpoint is rate-limited; still worth trying.
      oembedUrl: `https://www.tiktok.com/oembed?url=${encodeURIComponent(url.split('?')[0])}`,
    };
  }

  if ((m = url.match(INSTAGRAM_RE))) {
    const code = m[1];
    return {
      ok: true,
      platform: 'instagram',
      kind: 'embed',
      id: code,
      url: url.split('?')[0],
      watchUrl: url.split('?')[0],
      embedUrl: `https://www.instagram.com/p/${code}/embed/captioned/`,
      thumbnailUrl: '',
      oembedUrl: `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(url.split('?')[0])}&omit_script=true`,
    };
  }

  if ((m = url.match(TWITTER_RE))) {
    const id = m[1];
    return {
      ok: true,
      platform: 'twitter',
      kind: 'embed',
      id,
      url,
      watchUrl: url.split('?')[0],
      embedUrl: `https://platform.twitter.com/embed/Tweet?id=${id}&theme=dark&dnt=true`,
      thumbnailUrl: '',
      oembedUrl: `https://publish.twitter.com/oembed?url=${encodeURIComponent(url.split('?')[0])}`,
    };
  }

  if (DIRECT_FILE_RE.test(url)) {
    const ext = (url.match(DIRECT_FILE_RE) || [])[1] || 'mp4';
    return {
      ok: true,
      platform: 'direct',
      kind: 'file',
      id: '',
      url,
      watchUrl: url,
      embedUrl: url,
      thumbnailUrl: '',
      mimeHint: `video/${ext === 'mkv' ? 'x-matroska' : ext === 'm3u8' ? 'mpegurl' : ext}`,
    };
  }

  if (/^https?:\/\//i.test(url)) {
    return {
      ok: true,
      platform: 'other',
      kind: 'embed',
      id: '',
      url,
      watchUrl: url,
      embedUrl: url,
      thumbnailUrl: '',
      warning: 'Unrecognised platform - the link will be opened as-is',
    };
  }

  return { ok: false, error: 'Unsupported link. Paste a YouTube, TikTok, Vimeo, Instagram or X link.' };
}

async function fetchJson(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)', Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parses a pasted link and enriches it with platform metadata
 * (auto-filled title, author, thumbnail) when the platform allows it.
 */
export async function resolveVideoLink(rawUrl) {
  const parsed = parseVideoUrl(rawUrl);
  if (!parsed.ok) return parsed;

  const result = { ...parsed, title: '', author: '', thumbnail: parsed.thumbnailUrl || '' };

  if (parsed.oembedUrl) {
    try {
      const data = await fetchJson(parsed.oembedUrl);
      result.title = data.title || data.author_name || '';
      result.author = data.author_name || data.author || '';
      result.thumbnail = data.thumbnail_url || result.thumbnail;
      if (data.width && data.height && !result.duration) {
        result.width = data.width;
        result.height = data.height;
      }
    } catch {
      // oEmbed is best-effort (blocked/rate-limited) - the link still works.
      result.oembedFailed = true;
    }
  }

  return result;
}

/** Builds the safest iframe/html snippet when the admin wants a raw embed code. */
export function buildEmbedHtml(parsed) {
  if (!parsed?.ok) return '';
  if (parsed.platform === 'direct') return '';
  return `<iframe src="${parsed.embedUrl}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
}
