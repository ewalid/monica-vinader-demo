/** Root folders a UK page can be cloned into. These slugs stay in the story path. */
export const MARKET_FOLDERS = ['uk', 'us', 'ar', 'de', 'es', 'fr-be'];

/** Country sent to Shopify so the market returns its own currency. */
export const MARKET_COUNTRY = {
  uk: 'GB',
  us: 'US',
  ar: 'AE',
};

export function marketFromSlug(slug) {
  const first = Array.isArray(slug) ? slug[0] : '';
  return MARKET_FOLDERS.includes(first) ? first : null;
}

export function countryFromSlug(slug) {
  const market = marketFromSlug(slug);
  return market ? MARKET_COUNTRY[market] || null : null;
}
