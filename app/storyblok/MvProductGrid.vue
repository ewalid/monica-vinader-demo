<script setup>
const props = defineProps({ blok: Object });

const products = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const handle = props.blok.collection_handle;
    const max = parseInt(props.blok.max_products) || 8;

    if (handle) {
      try {
        const collection = await fetchShopifyCollectionByHandle(handle);
        if (collection && collection.id) {
          const ids = await fetchShopifyProductsByCategory(collection.id);
          const fetched = await Promise.all(
            ids.slice(0, max).map(p => fetchShopifyProductByID(p.id))
          );
          products.value = fetched.filter(Boolean);
        } else {
          const ids = await fetchShopifyAllProducts();
          const fetched = await Promise.all(
            ids.slice(0, max).map(p => fetchShopifyProductByID(p.id))
          );
          products.value = fetched.filter(Boolean);
        }
      } catch (innerErr) {
        console.warn('MvProductGrid collection fetch failed, falling back to all products:', innerErr);
        const ids = await fetchShopifyAllProducts();
        const fetched = await Promise.all(
          ids.slice(0, max).map(p => fetchShopifyProductByID(p.id))
        );
        products.value = fetched.filter(Boolean);
      }
    } else {
      const ids = await fetchShopifyAllProducts();
      const fetched = await Promise.all(
        ids.slice(0, max).map(p => fetchShopifyProductByID(p.id))
      );
      products.value = fetched.filter(Boolean);
    }
  } catch (e) {
    console.error('MvProductGrid:', e);
  } finally {
    loading.value = false;
  }
});

const colClass = computed(() => {
  const cols = props.blok.columns || '4';
  return {
    '2': 'mv-pgrid--cols-2',
    '3': 'mv-pgrid--cols-3',
    '4': 'mv-pgrid--cols-4',
  }[cols] || 'mv-pgrid--cols-4';
});
</script>

<template>
  <section v-editable="blok" class="mv-pgrid page-section">
    <div class="mv-pgrid__container">
      <h2 v-if="blok.headline" class="mv-pgrid__headline">{{ blok.headline }}</h2>

      <div v-if="loading" class="mv-pgrid__loading">
        <span v-for="n in 4" :key="n" class="mv-pgrid__skeleton" />
      </div>

      <div v-else class="mv-pgrid__grid" :class="colClass">
        <a
          v-for="product in products"
          :key="product.id"
          :href="`/products/${product.slug}`"
          class="mv-pcard"
        >
          <div class="mv-pcard__img-wrap">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.title"
              class="mv-pcard__img"
              loading="lazy"
            />
            <div v-else class="mv-pcard__placeholder" />
          </div>
          <div class="mv-pcard__info">
            <h3 class="mv-pcard__title">{{ product.title }}</h3>
            <p v-if="blok.show_price !== false" class="mv-pcard__price">
              {{ product.priceCurrency === 'GBP' ? '£' : '$' }}{{ product.price }}
            </p>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-pgrid__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.mv-pgrid__headline {
  font-family: var(--font-family-display, serif);
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 300;
  text-align: center;
  letter-spacing: 0.04em;
  margin-bottom: 40px;
  color: #1a1a1a;
}
.mv-pgrid__grid {
  display: grid;
  gap: 24px;
}
.mv-pgrid--cols-2 { grid-template-columns: repeat(2, 1fr); }
.mv-pgrid--cols-3 { grid-template-columns: repeat(3, 1fr); }
.mv-pgrid--cols-4 { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 1024px) {
  .mv-pgrid--cols-4 { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .mv-pgrid--cols-3,
  .mv-pgrid--cols-4 { grid-template-columns: repeat(2, 1fr); }
  .mv-pgrid__grid { gap: 16px; }
}

.mv-pcard {
  text-decoration: none;
  color: inherit;
  display: block;
}
.mv-pcard__img-wrap {
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #f5f3ef;
  margin-bottom: 16px;
}
.mv-pcard__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.mv-pcard:hover .mv-pcard__img {
  transform: scale(1.04);
}
.mv-pcard__placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f3ef 0%, #e8e4dc 100%);
}
.mv-pcard__info {
  text-align: center;
}
.mv-pcard__title {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.4;
  margin-bottom: 6px;
  color: #1a1a1a;
}
.mv-pcard__price {
  font-size: 14px;
  color: #666;
}
.mv-pgrid__loading {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
.mv-pgrid__skeleton {
  aspect-ratio: 3/4;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 2px;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
