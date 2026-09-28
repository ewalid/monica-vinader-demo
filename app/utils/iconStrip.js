/** Shared helpers for the icons strip ↔ showcase scroll/hover link. */

export function slugifyIcon(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function iconAnchorId({ handle, productName, label, uid } = {}) {
  const slug = slugifyIcon(handle || productName || label);
  if (slug) { return `icon-${slug}`; }
  if (uid) { return `icon-${String(uid).replace(/[^a-zA-Z0-9_-]/g, '')}`; }
  return '';
}

/** Prefer a still: Cloudflare Stream thumbnail, else a direct image URL. */
export function stillFromMediaUrl(src) {
  const value = String(src || '').trim();
  if (!value) { return ''; }
  const stream = value.match(/^(https:\/\/customer-[\w-]+\.cloudflarestream\.com)\/([0-9a-f]{32})/i);
  if (stream) {
    return `${stream[1]}/${stream[2]}/thumbnails/thumbnail.jpg`;
  }
  if (/\.(jpe?g|png|webp|avif|gif)(\?|#|$)/i.test(value)) {
    return value;
  }
  return '';
}
