/**
 * Storyblok CDN version for API requests.
 *
 * - Visual Editor / Bridge (`_storyblok…`) → draft (saved, unpublished OK)
 * - Explicit published preview in the editor → published
 * - Public / production URL → published only
 */
export default function () {
  const route = useRoute();
  const query = route.query || {};

  // Editor toggle: view as published
  if (query._storyblok_published !== undefined) {
    return 'published';
  }

  // Inside Storyblok Visual Editor / Bridge / release preview
  const inEditor = [
    '_storyblok',
    '_storyblok_tk',
    '_storyblok_release',
    '_storyblok_rl',
    '_storyblok_lang',
  ].some(key => query[key] !== undefined);

  if (inEditor) {
    return 'draft';
  }

  return 'published';
}
