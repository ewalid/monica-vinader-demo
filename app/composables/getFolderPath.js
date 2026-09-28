import { shouldStripLanguagePrefix } from '~/composables/getLanguage';

export default async function () {
  let slug = await getSlug();
  let folderPath = '';

  if (slug) {
    const language = await getLanguage(slug);
    if (shouldStripLanguagePrefix(slug, language)) {
      slug = slug.slice(1);
    }
    /**
     * Additionally, the story slug has to be removed to return only the folder path
     */
    slug.pop();
    folderPath = slug.join('/');
  }

  return folderPath;
}
