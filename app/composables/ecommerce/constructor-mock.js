import {
  fetchShopifyAllProducts,
  fetchShopifyProductByID,
  fetchShopifyCollectionByHandle,
  fetchShopifyProductsByCategory,
} from './shopify';

const PRICE_FACETS = {
  GBP: [
    { value: 'under-100', label: 'Under £100', max: 100 },
    { value: '100-250', label: '£100 – £250', min: 100, max: 250 },
    { value: '250-500', label: '£250 – £500', min: 250, max: 500 },
    { value: 'over-500', label: 'Over £500', min: 500 },
  ],
  USD: [
    { value: 'under-100', label: 'Under $100', max: 100 },
    { value: '100-250', label: '$100 – $250', min: 100, max: 250 },
    { value: '250-500', label: '$250 – $500', min: 250, max: 500 },
    { value: 'over-500', label: 'Over $500', min: 500 },
  ],
  AED: [
    { value: 'under-100', label: 'Under AED 400', max: 400 },
    { value: '100-250', label: 'AED 400 – 1,000', min: 400, max: 1000 },
    { value: '250-500', label: 'AED 1,000 – 2,000', min: 1000, max: 2000 },
    { value: 'over-500', label: 'Over AED 2,000', min: 2000 },
  ],
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'bestsellers', label: 'Best Sellers' },
];

const MARKET_LOCALE = {
  uk: 'en-GB',
  us: 'en-US',
  ar: 'ar-AE',
  de: 'de-DE',
  es: 'es-ES',
  'fr-be': 'fr-BE',
};

function shopifyEndpoint() {
  const config = useRuntimeConfig();
  return {
    url: `https://${config.public.shopifyDomain}/api/2025-01/graphql.json`,
    token: config.public.shopifyToken,
  };
}

async function shopifyGraphql(query, variables = {}) {
  const { url, token } = shopifyEndpoint();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

function mapNode(node) {
  const variant = node.variants?.edges?.[0]?.node;
  return {
    id: node.id,
    slug: node.handle,
    title: node.title,
    description: node.description || '',
    image: node.featuredImage?.url || node.images?.edges?.[0]?.node?.url || '',
    priceCurrency: variant?.price?.currencyCode || 'GBP',
    price: Math.floor(Number(variant?.price?.amount || 0)),
    availability: Boolean(variant?.availableForSale),
    productType: node.productType || '',
    tags: node.tags || [],
    materialText: node.metafield?.value || '',
    createdAt: node.createdAt || '',
  };
}

/**
 * Market-aware catalogue fetch via Storefront GraphQL `@inContext(country)`.
 * Falls back to the Buy SDK path when no country is provided.
 */
async function fetchMarketAwareProducts(collectionHandle, { maxProducts, country }) {
  const productFields = `
    id handle title description productType tags createdAt
    featuredImage { url }
    images(first: 1) { edges { node { url } } }
    metafield(namespace: "custom", key: "material") { value }
    variants(first: 1) {
      edges { node {
        availableForSale
        price { amount currencyCode }
      } }
    }
  `;

  const contextDecl = country
    ? '($country: CountryCode!, $first: Int!)'
    : '($first: Int!)';
  const contextDir = country ? ' @inContext(country: $country)' : '';
  const variables = country
    ? { country, first: maxProducts }
    : { first: maxProducts };

  if (collectionHandle) {
    const handleDecl = country
      ? '($handle: String!, $country: CountryCode!, $first: Int!)'
      : '($handle: String!, $first: Int!)';
    const handleVars = country
      ? { handle: collectionHandle, country, first: maxProducts }
      : { handle: collectionHandle, first: maxProducts };
    const json = await shopifyGraphql(
      `query CollectionProducts${handleDecl}${contextDir} {
        collection(handle: $handle) {
          products(first: $first) {
            edges { node { ${productFields} } }
          }
        }
      }`,
      handleVars,
    );
    const edges = json.data?.collection?.products?.edges || [];
    if (edges.length) {
      return edges.map(edge => mapNode(edge.node));
    }
  }

  const json = await shopifyGraphql(
    `query AllProducts${contextDecl}${contextDir} {
      products(first: $first) {
        edges { node { ${productFields} } }
      }
    }`,
    variables,
  );
  return (json.data?.products?.edges || []).map(edge => mapNode(edge.node));
}

async function fetchLegacyProducts(collectionHandle, maxProducts) {
  let products = [];
  try {
    if (collectionHandle) {
      const collection = await fetchShopifyCollectionByHandle(collectionHandle);
      if (collection?.id) {
        const ids = await fetchShopifyProductsByCategory(collection.id);
        const fetched = await Promise.all(
          ids.slice(0, maxProducts).map(p => fetchShopifyProductByID(p.id)),
        );
        products = fetched.filter(Boolean);
      }
    }
    if (!products.length) {
      const ids = await fetchShopifyAllProducts();
      const fetched = await Promise.all(
        ids.slice(0, maxProducts).map(p => fetchShopifyProductByID(p.id)),
      );
      products = fetched.filter(Boolean);
    }
  }
  catch (e) {
    console.error('Constructor mock fetch error:', e);
  }
  return attachCatalogueFields(products);
}

function buildFacets(currency) {
  const priceBands = PRICE_FACETS[currency] || PRICE_FACETS.GBP;
  return [
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
      options: priceBands.map(({ value, label }) => ({ value, label, count: 0 })),
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
}

export function getPriceFacetTests(currency) {
  const bands = PRICE_FACETS[currency] || PRICE_FACETS.GBP;
  return bands.map((band) => ({
    value: band.value,
    label: band.label,
    test: (p) => {
      const price = Number(p.price);
      if (band.min != null && band.max != null) {
        return price >= band.min && price <= band.max;
      }
      if (band.max != null) return price < band.max;
      if (band.min != null) return price > band.min;
      return true;
    },
  }));
}

export async function fetchConstructorResults(collectionHandle, options = {}) {
  const {
    maxProducts = 20,
    country = null,
    market = null,
    locale = null,
  } = options;

  const resolvedLocale = locale || MARKET_LOCALE[market] || (country === 'AE' ? 'ar-AE' : country === 'US' ? 'en-US' : 'en-GB');

  let products = [];
  try {
    if (country) {
      products = await fetchMarketAwareProducts(collectionHandle, { maxProducts, country });
    }
    else {
      products = await fetchLegacyProducts(collectionHandle, maxProducts);
    }
  }
  catch (e) {
    console.error('Constructor mock fetch error:', e);
    products = await fetchLegacyProducts(collectionHandle, maxProducts);
  }

  const currency = products[0]?.priceCurrency || (country === 'AE' ? 'AED' : country === 'US' ? 'USD' : 'GBP');

  return {
    response: {
      results: products.map((p, i) => ({
        ...p,
        constructor_score: (1 - i * 0.03).toFixed(3),
        constructor_strategy: i < 3 ? 'promoted' : 'organic',
      })),
      total_num_results: products.length,
      facets: buildFacets(currency),
      sort_options: SORT_OPTIONS,
      request_id: `cnstrc-${Date.now()}`,
      result_id: `res-${Math.random().toString(36).slice(2, 10)}`,
    },
    meta: {
      engine: 'constructor.io',
      api_version: 'v5',
      latency_ms: Math.floor(Math.random() * 40) + 15,
      market: market || null,
      locale: resolvedLocale,
      country: country || null,
      currency,
    },
  };
}

async function attachCatalogueFields(products) {
  if (!products.length) return products;
  try {
    const json = await shopifyGraphql(`{ products(first: 100) { edges { node {
      handle productType tags createdAt
      metafield(namespace: "custom", key: "material") { value }
    } } } }`);
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
  }
  catch (error) {
    console.error('Constructor catalogue fields:', error);
    return products;
  }
}

export function getConstructorFacets(currency = 'GBP') {
  return buildFacets(currency);
}

export function getConstructorSortOptions() {
  return SORT_OPTIONS;
}
