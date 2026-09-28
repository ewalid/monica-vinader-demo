import { MARKET_FOLDERS } from '~/utils/markets';

/**
 * Storyblok Visual Editor prefixes the field-level language onto the story path.
 * When the story already lives in a market folder with the same code (ar, de, es),
 * the preview URL becomes /ar/ar/guides/… — strip the duplicate (or lang+market)
 * prefix and keep editing working.
 */
export default defineNuxtRouteMiddleware((to) => {
  const parts = to.path.split('/').filter(Boolean);
  if (parts.length < 2) return;

  const [prefix, second] = parts;
  const secondIsMarket = MARKET_FOLDERS.includes(second);
  if (!secondIsMarket) return;

  // Same-code double: /ar/ar/… or /de/de/…
  const sameCodeDouble = prefix === second;
  // Lang prefixed onto another market: /de/uk/… /ar/us/…
  const langOnMarket = prefix !== second && (
    MARKET_FOLDERS.includes(prefix) || ['de', 'fr', 'es', 'ar'].includes(prefix)
  );

  if (!sameCodeDouble && !langOnMarket) return;

  const canonical = `/${parts.slice(1).join('/')}`;
  const query = { ...to.query };

  if (langOnMarket && !query._storyblok_lang && prefix !== 'default') {
    query._storyblok_lang = prefix;
  }

  if (to.path === canonical || to.path === `${canonical}/`) return;

  return navigateTo({ path: canonical, query, hash: to.hash }, { replace: true });
});
