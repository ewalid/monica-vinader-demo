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
  const { maxProducts = 20 } = options;
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

  products = await attachCatalogueFields(products);

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

async function attachCatalogueFields(products) {
  if (!products.length) return products;
  try {
    const config = useRuntimeConfig();
    const response = await fetch(`https://${config.public.shopifyDomain}/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': config.public.shopifyToken,
      },
      body: JSON.stringify({
        query: `{ products(first: 100) { edges { node {
          handle productType tags createdAt
          metafield(namespace: "custom", key: "material") { value }
        } } } }`,
      }),
    });
    const json = await response.json();
    const byHandle = {};
    for (const edge of json.data?.products?.edges || []) {
      byHandle[edge.node.handle] = edge.node;
    }
    return products.map((product) => {
      const extra = byHandle[product.slug] || {};
      return {
        ...product,
        productType: extra.productType || '',
        tags: extra.tags || [],
        materialText: extra.metafield?.value || '',
        createdAt: extra.createdAt || '',
      };
    });
  } catch (error) {
    console.error('Constructor catalogue fields:', error);
    return products;
  }
}

export function getConstructorFacets() {
  return FACETS_MOCK;
}

export function getConstructorSortOptions() {
  return SORT_OPTIONS;
}
