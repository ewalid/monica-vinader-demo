import { marketFromSlug } from '~/utils/markets';

/**
 * Resolve the field-level Storyblok language for this request.
 *
 * Visual Editor switches language via `?_storyblok_lang=de`, not by changing
 * the story path. Market folders (uk, de, ar, …) share codes with languages, so
 * we must not treat a market path as a language prefix — except when the VE
 * doubles it (`/de/de/guides/…`).
 */
export default async function (slug) {
  const route = useRoute();
  const storyblokApi = useStoryblokApi();
  const { data } = await storyblokApi.get('cdn/spaces/me');
  const languageCodes = data.space.language_codes || [];

  const rawQuery = route.query._storyblok_lang ?? route.query.language;
  const queryCode = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;
  if (queryCode && queryCode !== 'default' && languageCodes.includes(queryCode)) {
    return queryCode;
  }

  if (!slug?.length) {
    return null;
  }

  // VE sometimes prefixes the language onto an existing market path → /de/de/… or /de/uk/…
  if (
    languageCodes.includes(slug[0])
    && slug.length >= 2
    && marketFromSlug(slug.slice(1))
  ) {
    return slug[0];
  }

  // Pure field-level URL (/fr/about) — only when the first segment is not a market folder
  if (!marketFromSlug(slug) && languageCodes.includes(slug[0])) {
    return slug[0];
  }

  return null;
}

/**
 * Whether the leading slug segment is a language prefix that should be stripped
 * before fetching the story (vs a real market folder that must stay).
 */
export function shouldStripLanguagePrefix(slug, language) {
  if (!language || !slug?.length || slug[0] !== language) {
    return false;
  }
  const rest = slug.slice(1);
  // /de/de/guides or /fr/uk/guides — strip the VE language prefix
  if (marketFromSlug(rest)) {
    return true;
  }
  // /fr/about — language-only prefix, not a market folder
  if (!marketFromSlug(slug)) {
    return true;
  }
  // /de/guides with ?_storyblok_lang=de — de is the market folder, keep it
  return false;
}
