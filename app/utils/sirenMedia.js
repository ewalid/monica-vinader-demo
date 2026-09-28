export function mediaUrl(...candidates) {
  for (const value of candidates) {
    if (!value) { continue; }
    if (typeof value === 'string' && value.trim()) { return value.trim(); }
    if (value.filename) { return value.filename; }
  }
  return '';
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|svg)(\?|#|$)/i;

function parse(src) {
  try {
    return new URL(src);
  }
  catch {
    return null;
  }
}

// Any Cloudflare Stream link (iframe, watch, manifest, thumbnail) → the looping, muted, chromeless player.
function cloudflareStream(url) {
  const customer = /^customer-[\w-]+\.cloudflarestream\.com$/i.test(url.hostname);
  if (!customer && !/(^|\.)videodelivery\.net$/i.test(url.hostname)) { return ''; }
  if (url.pathname.includes('/thumbnails/')) { return ''; }
  const id = url.pathname.split('/').filter(Boolean)[0] || '';
  if (!/^[0-9a-f]{32}$/i.test(id)) { return ''; }
  const player = customer ? `https://${url.hostname}/${id}/iframe` : `https://iframe.videodelivery.net/${id}`;
  return `${player}?muted=true&loop=true&autoplay=true&controls=false&preload=auto`;
}

function youtube(url) {
  const host = url.hostname.replace(/^(www|m)\./, '');
  let id = '';
  if (host === 'youtu.be') {
    id = url.pathname.slice(1);
  }
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || '';
  }
  if (!/^[\w-]{6,}$/.test(id)) { return ''; }
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0`;
}

function vimeo(url) {
  const host = url.hostname.replace(/^www\./, '');
  if (host !== 'vimeo.com' && host !== 'player.vimeo.com') { return ''; }
  const id = url.pathname.match(/(\d{6,})/)?.[1];
  return id ? `https://player.vimeo.com/video/${id}?background=1&autoplay=1&muted=1&loop=1` : '';
}

/**
 * Classify whatever an editor put in a media field — a Storyblok asset, a CDN/DAM URL,
 * or a Stream/YouTube/Vimeo link — as { kind: 'embed' | 'video' | 'image' | 'unknown' | 'none', src }.
 * 'unknown' is an extensionless DAM URL: <MvMedia> tries it as an image, then as a video.
 */
export function resolveMedia(src) {
  const value = String(src || '').trim();
  if (!value) { return { kind: 'none', src: '' }; }
  const url = parse(value);
  const embed = url && (cloudflareStream(url) || youtube(url) || vimeo(url));
  if (embed) { return { kind: 'embed', src: embed }; }
  if (VIDEO_EXT.test(value) || (url && /\/video\/upload\//.test(url.pathname))) { return { kind: 'video', src: value }; }
  if (IMAGE_EXT.test(value)) { return { kind: 'image', src: value }; }
  return { kind: 'unknown', src: value };
}

export function isStoryblokImage(src) {
  return /^https:\/\/a\.storyblok\.com\/f\/.+\.(jpe?g|png|webp)$/i.test(src || '');
}
