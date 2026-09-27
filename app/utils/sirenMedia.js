export function mediaUrl(...candidates) {
  for (const value of candidates) {
    if (!value) continue;
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value.filename) return value.filename;
  }
  return '';
}

export function isStream(src) {
  return /cloudflarestream\.com/i.test(src || '');
}

export function isVideo(src) {
  return isStream(src) || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src || '');
}
