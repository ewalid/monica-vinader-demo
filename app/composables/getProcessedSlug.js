export default async function () {
  let slug = await getSlug();

  if (slug) {
    const language = await getLanguage(slug);
    if (language) {
      slug = slug.slice(1);
    }
    slug = slug.join('/');
  }
  else {
    slug = 'uk';
  }
  if (slug === '') {
    slug = 'uk';
  }

  return slug;
}
