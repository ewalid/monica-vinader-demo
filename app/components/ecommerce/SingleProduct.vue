<script setup>
const props = defineProps({
  blok: Object,
  productSlug: String,
  sharedBloks: { type: Array, default: () => [] },
  specificBloks: { type: Array, default: () => [] },
});

const product = ref(null);
provide('pdpProduct', product);
const pending = ref(true);
const selectedVariant = ref(0);
const selectedAddon = ref(-1);
const engravingOpen = ref(false);
const route = useRoute();

function pageSlug() {
  if (route.query.path) return String(route.query.path).split('/').filter(Boolean);
  return route.params.slug || [];
}

function formatMoney(amount, currency) {
  const locales = { GBP: 'en-GB', USD: 'en-US', AED: 'en-AE' };
  const value = Number(amount);
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat(locales[currency] || 'en-GB', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(value);
}

try {
  product.value = await fetchShopifyPdpProduct(props.productSlug, countryFromSlug(pageSlug()));
  pending.value = false;
}
catch (error) {
  console.log(error);
  pending.value = false;
}

const variant = computed(() => product.value?.variants?.[selectedVariant.value] || null);
provide('pdpVariant', variant);

const gallery = computed(() => {
  const images = product.value?.images || [];
  const finish = variant.value?.title;
  const matched = finish
    ? images.filter(image => image.alt === finish)
    : [];
  const source = matched.length ? matched : images;
  if (source.length > 1 && /-f1\./.test(source[0].url)) {
    return [source[1], source[0], ...source.slice(2)];
  }
  return source;
});

const isFinish = computed(() => /finish/i.test(product.value?.optionName || ''));

function metalColor(name) {
  const label = (name || '').toLowerCase();
  if (label.includes('rose')) return '#c9847a';
  if (label.includes('silver') || label.includes('sterling')) return '#d5d5d5';
  if (label.includes('14k')) return '#e4c56a';
  return '#c9a15a';
}

const siteConfig = await getSiteConfig();
const cartEnabled = computed(() => !!siteConfig.value?.content?.enable_cart);

const { addToCart } = useCart();
const justAdded = ref(false);
const onAddToCart = () => {
  if (!cartEnabled.value || !variant.value?.id || !variant.value.available) return;
  addToCart(variant.value.id);
  justAdded.value = true;
  setTimeout(() => { justAdded.value = false; }, 2500);
};

const showGoldNote = computed(() => /14k/i.test(variant.value?.title || product.value?.material || ''));

const openAccordion = ref(null);
const toggleAccordion = (name) => {
  openAccordion.value = openAccordion.value === name ? null : name;
};

const sections = computed(() => {
  const list = ['Details + Dimensions'];
  if (showGoldNote.value) list.push('About 14k Solid Gold');
  list.push('5-Year Warranty', 'Delivery & Returns', 'Product Passport');
  return list;
});

const starFill = computed(() => {
  const rating = Number(product.value?.rating);
  if (!rating) return 0;
  return Math.max(0, Math.min(5, rating)) / 5;
});
</script>

<template>
  <section v-editable="blok" class="mv-pdp">
    <EcommerceLoadingSpinner v-if="pending && !product" />
    <div v-else-if="product" class="mv-pdp__layout">
      <div class="mv-pdp__gallery">
        <div
          v-for="(image, index) in gallery"
          :key="image.url + index"
          class="mv-pdp__tile"
        >
          <img :src="image.url" :alt="image.alt" class="mv-pdp__img" />
        </div>
      </div>

      <div class="mv-pdp__info">
        <h1 class="mv-pdp__title">{{ product.title }}</h1>
        <p class="mv-pdp__material">
          {{ isFinish ? variant?.title : product.material }}
        </p>

        <div v-if="variant" class="mv-pdp__pricing">
          <span class="mv-pdp__price">
            {{ formatMoney(variant.price, variant.currency) }}
          </span>
        </div>

        <div v-if="product.rating" class="mv-pdp__rating">
          <span class="mv-pdp__stars" aria-hidden="true">
            <span class="mv-pdp__stars-base">★★★★★</span>
            <span class="mv-pdp__stars-fill" :style="{ width: `${starFill * 100}%` }">★★★★★</span>
          </span>
          <span class="mv-pdp__rating-text">{{ product.rating }}</span>
          <span v-if="product.reviewCount" class="mv-pdp__rating-count">({{ product.reviewCount }})</span>
        </div>

        <div v-if="product.variants.length && isFinish" class="mv-pdp__finish">
          <span class="mv-pdp__option-label">{{ product.optionName }}:</span>
          <div class="mv-pdp__swatches">
            <button
              v-for="(item, index) in product.variants"
              :key="item.id"
              type="button"
              class="mv-pdp__swatch"
              :class="{ 'mv-pdp__swatch--selected': index === selectedVariant }"
              :style="{ background: metalColor(item.title) }"
              :aria-label="item.title"
              @click="selectedVariant = index"
            />
          </div>
          <span class="mv-pdp__finish-name">{{ variant?.title }}</span>
        </div>

        <div v-else-if="product.variants.length" class="mv-pdp__sizes">
          <span class="mv-pdp__option-label">{{ product.optionName }}:</span>
          <button
            v-for="(item, index) in product.variants"
            :key="item.id"
            type="button"
            class="mv-pdp__size"
            :class="{ 'mv-pdp__size--selected': index === selectedVariant }"
            @click="selectedVariant = index"
          >
            {{ item.title }}
          </button>
        </div>

        <div v-if="product.addons.length" class="mv-pdp__chains">
          <p class="mv-pdp__chains-label">Why not add a chain?</p>
          <div class="mv-pdp__chain-row">
            <button
              v-for="(addon, index) in product.addons"
              :key="addon.image"
              type="button"
              class="mv-pdp__chain"
              :class="{ 'mv-pdp__chain--selected': selectedAddon === index }"
              @click="selectedAddon = selectedAddon === index ? -1 : index"
            >
              <img :src="addon.image" :alt="addon.name" />
            </button>
            <button
              type="button"
              class="mv-pdp__chain mv-pdp__chain--none"
              :class="{ 'mv-pdp__chain--selected': selectedAddon === -1 }"
              @click="selectedAddon = -1"
            >
              No chain
            </button>
          </div>
        </div>

        <div class="mv-pdp__stock">
          <span v-if="variant?.available" class="mv-pdp__in-stock">In Stock &#10003;</span>
          <span v-else class="mv-pdp__out-stock">Out of Stock</span>
        </div>

        <button type="button" class="mv-pdp__engrave" @click="engravingOpen = !engravingOpen">
          <span>Add Complimentary Engraving</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
        </button>
        <input
          v-if="engravingOpen"
          class="mv-pdp__engrave-input"
          type="text"
          maxlength="20"
          placeholder="Engraving"
        />

        <button
          class="mv-pdp__add-btn"
          :disabled="variant && !variant.available"
          @click="onAddToCart"
        >
          <span>{{ justAdded ? 'Added to Bag' : 'Add to Bag' }}</span>
          <span v-if="!justAdded" class="mv-pdp__arrow">&rarr;</span>
          <svg class="mv-pdp__heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.7-4.35-9.33-8.1C.5 10.1 1.2 6.4 4.4 5.2 6.3 4.5 8.2 5.1 12 8.2c3.8-3.1 5.7-3.7 7.6-3 3.2 1.2 3.9 4.9 1.73 7.7C18.7 16.65 12 21 12 21z" /></svg>
        </button>

        <div class="mv-pdp__accordions">
          <div
            v-for="section in sections"
            :key="section"
            class="mv-pdp__accordion"
          >
            <button
              class="mv-pdp__accordion-toggle"
              @click="toggleAccordion(section)"
            >
              <span>{{ section }}</span>
              <span class="mv-pdp__chevron" :class="{ 'mv-pdp__chevron--open': openAccordion === section }">&rsaquo;</span>
            </button>
            <div v-if="openAccordion === section" class="mv-pdp__accordion-body">
              <div v-if="section === 'Details + Dimensions'" class="mv-pdp__copy" v-html="product.description" />
              <p v-else-if="section === 'About 14k Solid Gold'" class="mv-pdp__copy">
                Recycled 14k solid gold. Designed to last a lifetime, 14k gold is made up of 14 parts pure gold and 10 parts other metals, making it resistant to scratches.
              </p>
              <p v-else-if="section === '5-Year Warranty'" class="mv-pdp__copy">
                This piece is sold with Monica Vinader's 5-year warranty.
              </p>
              <p v-else-if="section === 'Delivery & Returns'" class="mv-pdp__copy">
                Delivery and returns follow the options set for this market.
              </p>
              <p v-else class="mv-pdp__copy">
                There is no accountability without traceability. Product Passport traces pieces across their supply chain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="mv-pdp__not-found">
      <div class="mv-pdp__not-found-inner">
        <h1 class="mv-pdp__not-found-title">This product isn't available right now</h1>
        <p class="mv-pdp__not-found-text">The item you're looking for may have sold out or been removed from our collection.</p>
        <a href="/collections/bestsellers" class="mv-pdp__not-found-cta">Shop Bestsellers</a>
      </div>
    </div>
  </section>

  <StoryblokComponent
    v-for="nestedBlok in specificBloks"
    :key="nestedBlok._uid"
    :blok="nestedBlok"
  />
  <StoryblokComponent
    v-for="nestedBlok in sharedBloks"
    :key="nestedBlok._uid"
    :blok="nestedBlok"
  />
</template>

<style scoped>
.mv-pdp {
  background: #fff;
  padding: 12px 0 72px;
}
.mv-pdp__layout {
  max-width: 1480px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.72fr);
  gap: 28px;
  padding: 0 16px 0 8px;
  align-items: start;
}
.mv-pdp__gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.mv-pdp__tile {
  background: #efefef;
  overflow: hidden;
}
.mv-pdp__img {
  width: 100%;
  height: 100%;
  display: block;
  aspect-ratio: 4 / 5;
  object-fit: cover;
}
.mv-pdp__info {
  position: sticky;
  top: 96px;
  padding: 18px 28px 24px 12px;
}
.mv-pdp__title {
  font-family: var(--font-family-display, 'Cormorant Garamond', Georgia, serif);
  font-size: 34px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #1a1a1a;
  margin: 0 0 6px;
}
.mv-pdp__material {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 13px;
  color: #6b6b6b;
  margin: 0 0 14px;
}
.mv-pdp__pricing { margin-bottom: 12px; }
.mv-pdp__price {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 16px;
  color: #1a1a1a;
}
.mv-pdp__rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  font-size: 13px;
  color: #1a1a1a;
}
.mv-pdp__stars {
  position: relative;
  display: inline-block;
  font-size: 14px;
  letter-spacing: 1px;
  line-height: 1;
}
.mv-pdp__stars-base { color: #d7d7d7; }
.mv-pdp__stars-fill {
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
  white-space: nowrap;
  color: #1a1a1a;
}
.mv-pdp__rating-count { color: #6b6b6b; }
.mv-pdp__finish,
.mv-pdp__sizes {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}
.mv-pdp__option-label {
  font-size: 14px;
  color: #1a1a1a;
  flex: 0 0 auto;
}
.mv-pdp__swatches {
  display: flex;
  gap: 10px;
}
.mv-pdp__swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: inset 0 0 0 2px #fff;
  cursor: pointer;
  padding: 0;
}
.mv-pdp__swatch--selected {
  outline: 1px solid #1a1a1a;
  outline-offset: 3px;
}
.mv-pdp__finish-name {
  margin-left: auto;
  font-size: 13px;
  color: #1a1a1a;
  text-align: right;
  max-width: 46%;
}
.mv-pdp__size {
  min-width: 72px;
  padding: 8px 12px;
  border: 1px solid #cfcfcf;
  background: #fff;
  color: #1a1a1a;
  font-size: 12px;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.mv-pdp__size--selected {
  border-color: #1a1a1a;
}
.mv-pdp__chains { margin-bottom: 18px; }
.mv-pdp__chains-label {
  font-size: 14px;
  margin: 0 0 10px;
}
.mv-pdp__chain-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.mv-pdp__chain {
  width: 64px;
  height: 64px;
  padding: 0;
  border: 1px solid transparent;
  background: #f3f3f3;
  cursor: pointer;
  overflow: hidden;
}
.mv-pdp__chain img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.mv-pdp__chain--none {
  width: auto;
  padding: 0 10px;
  background: #fff;
  font-size: 12px;
  color: #1a1a1a;
}
.mv-pdp__chain--selected { border-color: #1a1a1a; }
.mv-pdp__stock { margin: 8px 0 16px; }
.mv-pdp__in-stock {
  font-size: 13px;
  color: #2f7d32;
}
.mv-pdp__out-stock { font-size: 13px; color: #999; }
.mv-pdp__engrave {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #1a1a1a;
  font-size: 14px;
  cursor: pointer;
}
.mv-pdp__engrave svg {
  width: 16px;
  height: 16px;
  fill: #1a1a1a;
}
.mv-pdp__engrave-input {
  width: 100%;
  margin-bottom: 10px;
  padding: 12px 14px;
  border: 1px solid #ddd;
  font-size: 14px;
}
.mv-pdp__add-btn {
  width: 100%;
  padding: 16px 18px;
  background: #111;
  color: #fff;
  border: none;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 28px;
}
.mv-pdp__add-btn:disabled { opacity: 0.45; cursor: default; }
.mv-pdp__heart {
  width: 18px;
  height: 18px;
  margin-left: auto;
  fill: none;
  stroke: #fff;
  stroke-width: 1.6;
}
.mv-pdp__accordions { border-top: 1px solid #e6e6e6; }
.mv-pdp__accordion { border-bottom: 1px solid #e6e6e6; }
.mv-pdp__accordion-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1a1a1a;
}
.mv-pdp__chevron {
  font-size: 22px;
  line-height: 1;
  transform: rotate(90deg);
  transition: transform 0.2s;
}
.mv-pdp__chevron--open { transform: rotate(-90deg); }
.mv-pdp__accordion-body { padding: 0 0 16px; }
.mv-pdp__copy {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #444;
}
.mv-pdp__copy :deep(p) {
  margin: 0 0 10px;
}
.mv-pdp__copy :deep(p:last-child) { margin-bottom: 0; }
.mv-pdp__not-found {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 28px;
  text-align: center;
}
.mv-pdp__not-found-inner { max-width: 480px; margin: 0 auto; }
.mv-pdp__not-found-title {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: 28px;
  font-weight: 400;
  margin-bottom: 12px;
}
.mv-pdp__not-found-text { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 24px; }
.mv-pdp__not-found-cta {
  display: inline-block;
  padding: 14px 32px;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
@media (max-width: 900px) {
  .mv-pdp__layout { grid-template-columns: 1fr; padding: 0 12px; }
  .mv-pdp__info { position: static; padding: 20px 4px 0; }
  .mv-pdp__finish-name { max-width: none; }
}
</style>
