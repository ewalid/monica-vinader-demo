<script setup>
const props = defineProps({ blok: Object });

const products = ref([]);
const loading = ref(true);
const track = ref(null);

onMounted(async () => {
  try {
    const handle = props.blok.collection_handle;
    const max = parseInt(props.blok.max_products) || 12;
    let ids;

    if (handle) {
      try {
        const col = await fetchShopifyCollectionByHandle(handle);
        if (col?.id) {
          ids = await fetchShopifyProductsByCategory(col.id);
        }
      } catch { /* fallback below */ }
    }

    if (!ids) {
      ids = await fetchShopifyAllProducts();
    }

    const fetched = await Promise.all(
      ids.slice(0, max).map(p => fetchShopifyProductByID(p.id))
    );
    products.value = fetched.filter(Boolean);
  } catch (e) {
    console.error('MvRecommendations:', e);
  } finally {
    loading.value = false;
  }
});

function scrollTrack(dir) {
  if (!track.value) return;
  const card = track.value.querySelector('.mv-rec__card');
  const w = card ? card.offsetWidth + 16 : 260;
  track.value.scrollBy({ left: dir * w * 2, behavior: 'smooth' });
}

function formatPrice(p) {
  const num = parseFloat(p);
  return isNaN(num) ? p : `£${num.toFixed(2)}`;
}

function salePrice(p) {
  const num = parseFloat(p);
  if (isNaN(num)) return p;
  return `£${(num * 0.8).toFixed(2)}`;
}
</script>

<template>
  <section v-editable="blok" class="mv-rec page-section">
    <div class="mv-rec__container">
      <div class="mv-rec__header">
        <h2 class="mv-rec__headline">{{ blok.headline || 'We think you may like...' }}</h2>
        <div class="mv-rec__arrows">
          <button class="mv-rec__arrow" aria-label="Previous" @click="scrollTrack(-1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5m0 0 5-5m-5 5 5 5"/></svg>
          </button>
          <button class="mv-rec__arrow" aria-label="Next" @click="scrollTrack(1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14m0 0-5-5m5 5-5 5"/></svg>
          </button>
        </div>
      </div>

      <div v-if="loading" class="mv-rec__loading">
        <span v-for="n in 6" :key="n" class="mv-rec__skeleton" />
      </div>

      <div v-else ref="track" class="mv-rec__track">
        <a
          v-for="product in products"
          :key="product.id"
          :href="`/products/${product.slug}`"
          class="mv-rec__card"
        >
          <div class="mv-rec__badge">20% off</div>
          <div class="mv-rec__img-wrap">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.title"
              class="mv-rec__img"
              loading="lazy"
            />
            <div v-else class="mv-rec__img-placeholder" />
          </div>
          <div class="mv-rec__info">
            <h3 class="mv-rec__title">{{ product.title }}</h3>
            <p class="mv-rec__material">18ct Gold Plated Vermeil on Sterling Silver</p>
            <div class="mv-rec__prices">
              <span class="mv-rec__price-original">{{ formatPrice(product.price) }}</span>
              <span class="mv-rec__price-sale">{{ salePrice(product.price) }}</span>
              <span class="mv-rec__price-tag">20% off</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-rec { background: #fff; }
.mv-rec__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px;
}

.mv-rec__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.mv-rec__headline {
  font-family: var(--font-family-display, serif);
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 400;
  font-style: italic;
  color: #1a1a1a;
}
.mv-rec__arrows {
  display: flex;
  gap: 8px;
}
.mv-rec__arrow {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  color: #1a1a1a;
  padding: 0;
}
.mv-rec__arrow:hover { opacity: 0.5; }
.mv-rec__arrow svg { width: 20px; height: 20px; }

.mv-rec__track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.mv-rec__track::-webkit-scrollbar { display: none; }

.mv-rec__card {
  flex: 0 0 220px;
  scroll-snap-align: start;
  text-decoration: none;
  color: inherit;
  position: relative;
}

.mv-rec__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #1a1a1a;
  color: #fff;
  font-size: 11px;
  padding: 3px 8px;
  letter-spacing: 0.02em;
  font-family: var(--font-family-body, sans-serif);
  z-index: 1;
}

.mv-rec__img-wrap {
  width: 220px;
  height: 280px;
  overflow: hidden;
  background: #f0eeeb;
  margin-bottom: 12px;
}
.mv-rec__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.mv-rec__card:hover .mv-rec__img {
  transform: scale(1.04);
}
.mv-rec__img-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f3ef, #e8e4dc);
}

.mv-rec__info { padding-right: 8px; }
.mv-rec__title {
  font-size: 13px;
  font-weight: 400;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 4px;
}
.mv-rec__material {
  font-size: 11px;
  color: #888;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.mv-rec__material::before {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c4a265;
  flex-shrink: 0;
}
.mv-rec__prices {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.mv-rec__price-original {
  text-decoration: line-through;
  color: #999;
}
.mv-rec__price-sale {
  color: #c23616;
  font-weight: 500;
}
.mv-rec__price-tag {
  color: #c23616;
  font-size: 12px;
}

.mv-rec__loading {
  display: flex;
  gap: 16px;
  overflow: hidden;
}
.mv-rec__skeleton {
  flex: 0 0 220px;
  height: 340px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: rec-shimmer 1.5s infinite;
}
@keyframes rec-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@media (max-width: 768px) {
  .mv-rec__card { flex: 0 0 170px; }
  .mv-rec__img-wrap { width: 170px; height: 220px; }
}
</style>
