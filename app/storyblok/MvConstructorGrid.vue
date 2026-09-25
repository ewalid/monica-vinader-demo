<script setup>
import { fetchConstructorResults, getConstructorSortOptions } from '~/composables/ecommerce/constructor-mock';

const props = defineProps({ blok: Object });

const products = ref([]);
const facets = ref([]);
const sortOptions = ref(getConstructorSortOptions());
const activeSort = ref('relevance');
const activeFacets = ref({});
const loading = ref(true);
const totalResults = ref(0);
const requestMeta = ref(null);

async function loadProducts() {
  loading.value = true;
  try {
    const handle = props.blok.collection_handle || '';
    const max = parseInt(props.blok.max_products) || 20;
    const result = await fetchConstructorResults(handle, {
      maxProducts: max,
      sort: activeSort.value,
    });
    products.value = result.response.results;
    facets.value = result.response.facets;
    totalResults.value = result.response.total_num_results;
    requestMeta.value = result.meta;
  } catch (e) {
    console.error('Constructor grid error:', e);
  } finally {
    loading.value = false;
  }
}

onMounted(loadProducts);

function toggleFacet(field, value) {
  if (!activeFacets.value[field]) activeFacets.value[field] = [];
  const idx = activeFacets.value[field].indexOf(value);
  if (idx > -1) activeFacets.value[field].splice(idx, 1);
  else activeFacets.value[field].push(value);
}

function isFacetActive(field, value) {
  return activeFacets.value[field]?.includes(value);
}

function changeSort(val) {
  activeSort.value = val;
  loadProducts();
}

const editorialPosition = computed(() => parseInt(props.blok.editorial_position) || 5);

const gridItems = computed(() => {
  const items = products.value.map(p => ({ type: 'product', data: p }));
  if (props.blok.editorial_tile?.length) {
    const pos = Math.min(editorialPosition.value - 1, items.length);
    items.splice(pos, 0, { type: 'editorial', data: props.blok.editorial_tile[0] });
  }
  return items;
});
</script>

<template>
  <section v-editable="blok" class="mv-cnstr">
    <div class="mv-cnstr__container">
      <div class="mv-cnstr__layout">
        <!-- Facets sidebar -->
        <aside class="mv-cnstr__facets">
          <div class="mv-cnstr__facets-head">
            <span class="mv-cnstr__facets-title">Filter</span>
            <span class="mv-cnstr__facets-count">{{ totalResults }} results</span>
          </div>
          <div v-for="facet in facets" :key="facet.field" class="mv-cnstr__facet-group">
            <h4 class="mv-cnstr__facet-name">{{ facet.name }}</h4>
            <label
              v-for="opt in facet.options"
              :key="opt.value"
              class="mv-cnstr__facet-opt"
              :class="{ 'mv-cnstr__facet-opt--active': isFacetActive(facet.field, opt.value) }"
              @click="toggleFacet(facet.field, opt.value)"
            >
              <span class="mv-cnstr__facet-check">
                <svg v-if="isFacetActive(facet.field, opt.value)" width="10" height="8" viewBox="0 0 10 8"><path d="M1 3.5L3.5 6L9 1" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
              </span>
              <span class="mv-cnstr__facet-label">{{ opt.label }}</span>
              <span class="mv-cnstr__facet-count">({{ opt.count }})</span>
            </label>
          </div>
          <div class="mv-cnstr__powered">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#6B4EFF" stroke-width="2"/><path d="M8 12h8M12 8v8" stroke="#6B4EFF" stroke-width="2"/></svg>
            <span>Powered by <strong>Constructor</strong></span>
          </div>
        </aside>

        <!-- Main grid area -->
        <div class="mv-cnstr__main">
          <div class="mv-cnstr__toolbar">
            <span class="mv-cnstr__result-count">
              {{ totalResults }} products
              <span v-if="requestMeta" class="mv-cnstr__latency">({{ requestMeta.latency_ms }}ms)</span>
            </span>
            <select class="mv-cnstr__sort" :value="activeSort" @change="changeSort($event.target.value)">
              <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>

          <div v-if="loading" class="mv-cnstr__grid mv-cnstr__grid--4">
            <span v-for="n in 8" :key="n" class="mv-cnstr__skeleton" />
          </div>

          <div v-else class="mv-cnstr__grid mv-cnstr__grid--4">
            <template v-for="(item, idx) in gridItems" :key="idx">
              <!-- Product card -->
              <a
                v-if="item.type === 'product'"
                :href="`/products/${item.data.slug}`"
                class="mv-cnstr__pcard"
              >
                <div class="mv-cnstr__pcard-badge" v-if="item.data.constructor_strategy === 'promoted'">
                  Promoted
                </div>
                <div class="mv-cnstr__pcard-img">
                  <img v-if="item.data.image" :src="item.data.image" :alt="item.data.title" loading="lazy" />
                  <div v-else class="mv-cnstr__pcard-placeholder" />
                </div>
                <div class="mv-cnstr__pcard-info">
                  <h3 class="mv-cnstr__pcard-title">{{ item.data.title }}</h3>
                  <p class="mv-cnstr__pcard-price">
                    {{ item.data.priceCurrency === 'GBP' ? '£' : '$' }}{{ item.data.price }}
                  </p>
                </div>
              </a>

              <!-- Editorial tile (CMS-injected) -->
              <div v-else-if="item.type === 'editorial'" class="mv-cnstr__editorial">
                <div class="mv-cnstr__editorial-badge">Editorial — CMS</div>
                <img
                  v-if="item.data.image?.filename"
                  :src="item.data.image.filename + '/m/600x800'"
                  :alt="item.data.headline || ''"
                  class="mv-cnstr__editorial-img"
                />
                <img
                  v-else-if="item.data.image_url"
                  :src="item.data.image_url"
                  :alt="item.data.headline || ''"
                  class="mv-cnstr__editorial-img"
                />
                <div class="mv-cnstr__editorial-overlay">
                  <h3 v-if="item.data.headline" class="mv-cnstr__editorial-title">{{ item.data.headline }}</h3>
                  <p v-if="item.data.subheadline" class="mv-cnstr__editorial-sub">{{ item.data.subheadline }}</p>
                  <a
                    v-if="item.data.cta_link?.cached_url || item.data.cta_link?.url"
                    :href="item.data.cta_link.cached_url ? '/' + item.data.cta_link.cached_url : item.data.cta_link.url"
                    class="mv-cnstr__editorial-cta"
                  >{{ item.data.cta_text || 'Discover' }}</a>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-cnstr__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px;
}
.mv-cnstr__layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 40px;
}
@media (max-width: 1024px) {
  .mv-cnstr__layout { grid-template-columns: 200px 1fr; gap: 24px; }
}
@media (max-width: 768px) {
  .mv-cnstr__layout { grid-template-columns: 1fr; }
  .mv-cnstr__facets { display: none; }
}

/* Facets sidebar */
.mv-cnstr__facets {
  padding-top: 8px;
}
.mv-cnstr__facets-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0ddd6;
}
.mv-cnstr__facets-title {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a1a1a;
}
.mv-cnstr__facets-count {
  font-size: 12px;
  color: #999;
}
.mv-cnstr__facet-group {
  margin-bottom: 24px;
}
.mv-cnstr__facet-name {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #1a1a1a;
  margin-bottom: 12px;
}
.mv-cnstr__facet-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
  font-size: 13px;
  color: #444;
  transition: color 0.15s;
}
.mv-cnstr__facet-opt:hover { color: #1a1a1a; }
.mv-cnstr__facet-opt--active { color: #1a1a1a; font-weight: 500; }
.mv-cnstr__facet-check {
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.mv-cnstr__facet-opt--active .mv-cnstr__facet-check {
  border-color: #1a1a1a;
  background: #1a1a1a;
  color: #fff;
}
.mv-cnstr__facet-label { flex: 1; }
.mv-cnstr__facet-count { color: #999; font-size: 12px; }
.mv-cnstr__powered {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e0ddd6;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #999;
}
.mv-cnstr__powered strong { color: #6B4EFF; }

/* Toolbar */
.mv-cnstr__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0ddd6;
}
.mv-cnstr__result-count {
  font-size: 13px;
  color: #666;
}
.mv-cnstr__latency {
  color: #999;
  font-size: 11px;
}
.mv-cnstr__sort {
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #d4d0c8;
  background: #fff;
  color: #1a1a1a;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  cursor: pointer;
}

/* Grid */
.mv-cnstr__grid {
  display: grid;
  gap: 24px;
}
.mv-cnstr__grid--4 { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 1024px) { .mv-cnstr__grid--4 { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .mv-cnstr__grid--4 { grid-template-columns: repeat(2, 1fr); } }

/* Product card */
.mv-cnstr__pcard {
  text-decoration: none;
  color: inherit;
  display: block;
  position: relative;
}
.mv-cnstr__pcard-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  padding: 3px 8px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #6B4EFF;
  color: #fff;
  border-radius: 2px;
}
.mv-cnstr__pcard-img {
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #f5f3ef;
  margin-bottom: 12px;
}
.mv-cnstr__pcard-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.mv-cnstr__pcard:hover .mv-cnstr__pcard-img img { transform: scale(1.04); }
.mv-cnstr__pcard-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f3ef 0%, #e8e4dc 100%);
}
.mv-cnstr__pcard-info { text-align: center; }
.mv-cnstr__pcard-title {
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.4;
  margin-bottom: 4px;
  color: #1a1a1a;
}
.mv-cnstr__pcard-price {
  font-size: 13px;
  color: #666;
}

/* Editorial tile */
.mv-cnstr__editorial {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: 0;
}
.mv-cnstr__editorial-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  padding: 3px 8px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #c4a265;
  color: #fff;
  border-radius: 2px;
}
.mv-cnstr__editorial-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mv-cnstr__editorial-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.mv-cnstr__editorial-title {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: 22px;
  font-weight: 300;
  font-style: italic;
  color: #fff;
}
.mv-cnstr__editorial-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.85);
}
.mv-cnstr__editorial-cta {
  display: inline-block;
  padding: 8px 16px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: #fff;
  color: #1a1a1a;
  text-decoration: none;
  transition: all 0.3s;
}
.mv-cnstr__editorial-cta:hover {
  background: #1a1a1a;
  color: #fff;
}

/* Skeleton */
.mv-cnstr__skeleton {
  aspect-ratio: 3/4;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: cnstr-shimmer 1.5s infinite;
}
@keyframes cnstr-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
