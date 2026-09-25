/** Root folders a UK page can be cloned into. These slugs stay in the story path. */
export const MARKET_FOLDERS = ['uk', 'us', 'ar', 'de', 'es', 'fr-be'];

export function marketFromSlug(slug) {
  const first = Array.isArray(slug) ? slug[0] : '';
  return MARKET_FOLDERS.includes(first) ? first : null;
}
