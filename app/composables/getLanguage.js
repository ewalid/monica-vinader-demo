import { marketFromSlug } from '~/utils/markets';

export default async function (slug) {
  /**
   * Market folders (uk, de, es, …) are real story paths. Do not treat them as
   * field-level language prefixes — stripping them makes a cloned variant 404.
   */
  if (!slug?.length || marketFromSlug(slug)) {
    return null;
  }

  const storyblokApi = useStoryblokApi();
  const { data } = await storyblokApi.get('cdn/spaces/me');
  const languageCodes = data.space.language_codes || [];

  if (languageCodes.includes(slug[0])) {
    return slug[0];
  }

  return null;
}
