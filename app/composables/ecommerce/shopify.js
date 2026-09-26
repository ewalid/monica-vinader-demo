import Client from 'shopify-buy';

/**
 * Shopify Storefront API access via the `shopify-buy` JS Buy SDK.
 *
 * The client is built lazily (on first use) so `useRuntimeConfig()` is only
 * read inside a Nuxt context. Domain + storefront token come from the public
 * runtime config (`SHOPIFY_DOMAIN` / `SHOPIFY_TOKEN`). SSR is disabled, so all
 * of this runs client-side — the storefront token is intentionally public.
 */
let shopifyClient;

function getShopifyClient() {
  if (!shopifyClient) {
    const config = useRuntimeConfig();
    shopifyClient = Client.buildClient({
      domain: config.public.shopifyDomain,
      storefrontAccessToken: config.public.shopifyToken,
    });
  }
  return shopifyClient;
}

const assignProductData = (fetchedProduct) => {
  const product = {};
  product.id = fetchedProduct.id;
  product.slug = fetchedProduct.handle;
  product.title = fetchedProduct.title;
  product.variantId = fetchedProduct.variants[0]?.id;
  product.description = fetchedProduct?.description;
  product.image = fetchedProduct?.images[0]?.src;
  product.priceCurrency = fetchedProduct?.variants[0]?.price?.currencyCode;
  product.price = Math.floor(fetchedProduct?.variants[0]?.price.amount);
  product.availability = fetchedProduct?.variants[0]?.available;

  return product;
};

const assignCategoryData = (fetchedCollection) => {
  const category = {};
  category.id = fetchedCollection.id;
  category.slug = fetchedCollection.handle;
  category.title = fetchedCollection.title;
  category.description = fetchedCollection?.description;
  category.image = fetchedCollection?.image?.src;

  return category;
};

export const fetchShopifyProductsByCategory = async (categoryID) => {
  if (categoryID === '' || !categoryID) {
    return [];
  }

  const products = [];

  await getShopifyClient()
    .collection
    .fetchWithProducts(categoryID, { productsFirst: 20 })
    .then((fetchedCollection) => {
      fetchedCollection.products.forEach((product) => {
        products.push({ id: product.id });
      });
    });

  return products;
};

export const fetchShopifyCollectionByHandle = async (categoryHandle) => {
  if (categoryHandle === '' || !categoryHandle) {
    return;
  }

  const category = {};

  await getShopifyClient()
    .collection
    .fetchByHandle(categoryHandle)
    .then((fetchedCollection) => {
      Object.assign(category, assignCategoryData(fetchedCollection));
    });

  return category;
};

export const fetchShopifyProductByID = async (productID) => {
  if (productID === '' || !productID) {
    return;
  }

  let product = {};

  await getShopifyClient()
    .product
    .fetch(productID)
    .then((fetchedProduct) => {
      product = assignProductData(fetchedProduct);
    });

  return product;
};

export const fetchShopifyProductByHandle = async (productHandle) => {
  if (productHandle === '' || !productHandle) {
    return;
  }

  const { collectionSlug } = await useShopifyConfig();
  const client = getShopifyClient();

  let product = null;

  if (collectionSlug) {
    try {
      const collection = await client.collection.fetchByHandle(collectionSlug);
      if (!collection?.id) {
        return null;
      }

      const collectionWithProducts = await client.collection.fetchWithProducts(
        collection.id,
        { productsFirst: 250 },
      );

      const products = collectionWithProducts?.products ?? [];
      const match
        = products.find(p => p.handle === productHandle) ?? products[0];
      if (match) {
        product = assignProductData(match);
      }
    }
    catch (e) {
      console.log(e);
    }

    return product;
  }

  await client.product.fetchByHandle(productHandle).then((fetchedProduct) => {
    product = assignProductData(fetchedProduct);
  });

  return product;
};

export const fetchShopifyAllProducts = async () => {
  const products = [];

  await getShopifyClient()
    .product
    .fetchAll(20)
    .then((fetchedProducts) => {
      fetchedProducts.forEach((fetchedProduct) => {
        products.push({ id: fetchedProduct.id });
      });
    });

  return products;
};

function showcaseProductFromNode(product) {
  if (!product) {
    return null;
  }
  const variant = product.variants?.edges?.[0]?.node;
  const material = product.metafields?.[0]?.value || '';
  const variantTitle = variant?.title && variant.title !== 'Default Title' ? variant.title : '';
  return {
    handle: product.handle || '',
    title: product.title,
    subtitle: material || variantTitle || product.productType || '',
    price: variant?.price?.amount,
    currency: variant?.price?.currencyCode || 'USD',
    available: Boolean(variant?.availableForSale),
    variantId: variant?.id || '',
  };
}

const SHOWCASE_PRODUCT_FIELDS = `
  handle
  title
  productType
  metafields(identifiers: [{namespace: "custom", key: "material"}]) { value }
  variants(first: 1) {
    edges { node { id title availableForSale price { amount currencyCode } } }
  }
`;

async function queryShowcaseProduct(selection, variables, country) {
  const config = useRuntimeConfig();
  const endpoint = `https://${config.public.shopifyDomain}/api/2025-01/graphql.json`;
  const declared = country ? { ...variables, country } : variables;
  const argList = Object.keys(declared).map((key) => {
    const type = key === 'country' ? 'CountryCode!' : key === 'id' ? 'ID!' : 'String!';
    return `$${key}: ${type}`;
  }).join(', ');
  const contextual = country ? ' @inContext(country: $country)' : '';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.public.shopifyToken,
    },
    body: JSON.stringify({
      query: `query (${argList})${contextual} { product(${selection}) { ${SHOWCASE_PRODUCT_FIELDS} } }`,
      variables: declared,
    }),
  });
  const json = await response.json();
  return showcaseProductFromNode(json.data?.product);
}

export const fetchShopifyShowcaseProduct = async (handle, country) => {
  if (!handle) {
    return null;
  }
  return queryShowcaseProduct('handle: $handle', { handle }, country);
};

export const fetchShopifyShowcaseProductById = async (id, country) => {
  if (!id) {
    return null;
  }
  return queryShowcaseProduct('id: $id', { id }, country);
};

export const fetchShopifyPdpProduct = async (handle, country) => {
  if (!handle) {
    return null;
  }

  const config = useRuntimeConfig();
  const endpoint = `https://${config.public.shopifyDomain}/api/2025-01/graphql.json`;
  const contextual = country
    ? 'query ($handle: String!, $country: CountryCode!) @inContext(country: $country)'
    : 'query ($handle: String!)';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.public.shopifyToken,
    },
    body: JSON.stringify({
      query: `${contextual} {
        product(handle: $handle) {
          title
          description
          descriptionHtml
          productType
          tags
          options { name }
          images(first: 16) { edges { node { url altText } } }
          metafields(identifiers: [
            {namespace: "custom", key: "material"},
            {namespace: "custom", key: "addons"},
            {namespace: "custom", key: "rating"},
            {namespace: "custom", key: "review_count"}
          ]) { value }
          variants(first: 20) {
            edges { node {
              id
              title
              availableForSale
              price { amount currencyCode }
              image { url altText }
            } }
          }
        }
      }`,
      variables: country ? { handle, country } : { handle },
    }),
  });
  const json = await response.json();
  const product = json.data?.product;
  if (!product) {
    return null;
  }

  const fields = product.metafields || [];
  let addons = [];
  try {
    addons = fields[1]?.value ? JSON.parse(fields[1].value) : [];
  }
  catch {
    addons = [];
  }

  return {
    title: product.title,
    description: product.descriptionHtml || product.description || '',
    productType: product.productType || '',
    tags: product.tags || [],
    material: fields[0]?.value || '',
    addons: Array.isArray(addons) ? addons : [],
    rating: fields[2]?.value || '',
    reviewCount: fields[3]?.value || '',
    optionName: product.options?.[0]?.name || '',
    images: (product.images?.edges || []).map(({ node }) => ({
      url: node.url,
      alt: node.altText || product.title,
    })),
    variants: (product.variants?.edges || []).map(({ node }) => ({
      id: node.id,
      title: node.title,
      available: Boolean(node.availableForSale),
      price: node.price?.amount,
      currency: node.price?.currencyCode || 'USD',
      image: node.image?.url || '',
    })),
  };
};

export const fetchShopifyProductsByCustomQuery = async (searchTerm) => {
  const products = [];

  const query = {
    query: searchTerm ? `title:'${searchTerm}'` : '',
  };

  await getShopifyClient()
    .product
    .fetchQuery(query)
    .then((fetchedProducts) => {
      fetchedProducts.forEach((fetchedProduct) => {
        products.push({ id: fetchedProduct.id });
      });
    });

  return products;
};
