import {
  fetchShopifyAllProducts,
  fetchShopifyProductByID,
  fetchShopifyCollectionByHandle,
  fetchShopifyProductsByCategory,
} from './shopify';

const FACETS_MOCK = [
  {
    name: 'Material',
    field: 'material',
    options: [
      { value: '14k-gold', label: '14K Solid Gold', count: 9 },
      { value: 'gold-vermeil', label: 'Gold Vermeil', count: 14 },
      { value: 'sterling-silver', label: 'Sterling Silver', count: 8 },
      { value: 'rose-gold', label: 'Rose Gold', count: 5 },
    ],
  },
  {
    name: 'Price Range',
    field: 'price',
    options: [
      { value: 'under-100', label: 'Under £100', count: 12 },
      { value: '100-250', label: '£100 – £250', count: 18 },
      { value: '250-500', label: '£250 – £500', count: 7 },
      { value: 'over-500', label: 'Over £500', count: 4 },
    ],
  },
  {
    name: 'Collection',
    field: 'collection',
    options: [
      { value: 'siren', label: 'Siren', count: 6 },
      { value: 'alta', label: 'Alta', count: 5 },
      { value: 'nura', label: 'Nura', count: 7 },
      { value: 'fiji', label: 'Fiji', count: 4 },
    ],
  },
  {
    name: 'Stone',
    field: 'stone',
    options: [
      { value: 'diamond', label: 'Diamond', count: 8 },
      { value: 'pearl', label: 'Pearl', count: 3 },
      { value: 'no-stone', label: 'Plain', count: 22 },
    ],
  },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'bestsellers', label: 'Best Sellers' },
];

export async function fetchConstructorResults(collectionHandle, options = {}) {
  const { maxProducts = 20, sort = 'relevance' } = options;
  let products = [];

  try {
    if (collectionHandle) {
      const collection = await fetchShopifyCollectionByHandle(collectionHandle);
      if (collection?.id) {
        const ids = await fetchShopifyProductsByCategory(collection.id);
        const fetched = await Promise.all(
          ids.slice(0, maxProducts).map(p => fetchShopifyProductByID(p.id))
        );
        products = fetched.filter(Boolean);
      }
    }

    if (!products.length) {
      const ids = await fetchShopifyAllProducts();
      const fetched = await Promise.all(
        ids.slice(0, maxProducts).map(p => fetchShopifyProductByID(p.id))
      );
      products = fetched.filter(Boolean);
    }
  } catch (e) {
    console.error('Constructor mock fetch error:', e);
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  }

  return {
    response: {
      results: products.map((p, i) => ({
        ...p,
        constructor_score: (1 - i * 0.03).toFixed(3),
        constructor_strategy: i < 3 ? 'promoted' : 'organic',
      })),
      total_num_results: products.length,
      facets: FACETS_MOCK,
      sort_options: SORT_OPTIONS,
      request_id: `cnstrc-${Date.now()}`,
      result_id: `res-${Math.random().toString(36).slice(2, 10)}`,
    },
    meta: {
      engine: 'constructor.io',
      api_version: 'v5',
      latency_ms: Math.floor(Math.random() * 40) + 15,
    },
  };
}

export function getConstructorFacets() {
  return FACETS_MOCK;
}

export function getConstructorSortOptions() {
  return SORT_OPTIONS;
}
