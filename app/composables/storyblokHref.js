export function storyblokHref(link) {
  if (!link) return '';
  if (typeof link === 'string') {
    if (link.startsWith('http') || link.startsWith('/')) return link;
    return `/${link}`;
  }
  if (link.linktype === 'email') return link.email ? `mailto:${link.email}` : '';
  if (link.linktype === 'asset') return link.url || link.cached_url || '';
  if (link.linktype === 'url') return link.url || '';
  const slug = link.story?.full_slug || link.cached_url || '';
  if (!slug) return '';
  if (slug.startsWith('http') || slug.startsWith('/')) return slug;
  return `/${slug}`;
}
