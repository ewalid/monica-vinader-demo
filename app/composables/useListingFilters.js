export function useListingFilters() {
  return useState('mv-listing-filters', () => ({
    facets: {},
    pill: '',
    sort: 'relevance',
    inStock: false,
  }));
}
