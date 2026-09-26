<script setup>
const props = defineProps({
  blok: Object,
  productSlug: String,
  sharedBloks: { type: Array, default: () => [] },
  specificBloks: { type: Array, default: () => [] },
});

const product = ref(null);
const pending = ref(true);
const selectedVariant = ref(0);
const route = useRoute();

function pageSlug() {
  if (route.query.path) return String(route.query.path).split('/').filter(Boolean);
  return route.params.slug || [];
}

function formatMoney(amount, currency) {
  const locales = { GBP: 'en-GB', USD: 'en-US', AED: 'en-AE' };
  return new Intl.NumberFormat(locales[currency] || 'en-GB', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));
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

const openAccordion = ref(null);
const toggleAccordion = (name) => {
  openAccordion.value = openAccordion.value === name ? null : name;
};
</script>

<template>
  <section v-editable="blok" class="mv-pdp">
    <EcommerceLoadingSpinner v-if="pending && !product" />
    <div v-else-if="product" class="mv-pdp__layout">
      <!-- Image Gallery -->
      <div class="mv-pdp__gallery">
        <div class="mv-pdp__main-image">
          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.imageAlt"
            class="mv-pdp__img"
          />
        </div>
      </div>

      <!-- Product Info -->
      <div class="mv-pdp__info">
        <h1 class="mv-pdp__title">{{ product.title }}</h1>
        <p v-if="product.material" class="mv-pdp__material">{{ product.material }}</p>

        <div v-if="variant" class="mv-pdp__pricing">
          <span class="mv-pdp__price">
            {{ formatMoney(variant.price, variant.currency) }}
          </span>
        </div>

        <div class="mv-pdp__rating">
          <span class="mv-pdp__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <span class="mv-pdp__rating-text">4.9</span>
        </div>

        <div v-if="product.variants.length" class="mv-pdp__variants">
          <span class="mv-pdp__finish-label">{{ product.optionName }}:</span>
          <button
            v-for="(item, index) in product.variants"
            :key="item.id"
            type="button"
            class="mv-pdp__variant"
            :class="{ 'mv-pdp__variant--selected': index === selectedVariant }"
            @click="selectedVariant = index"
          >
            {{ item.title }}
          </button>
        </div>

        <div class="mv-pdp__stock">
          <span v-if="variant?.available" class="mv-pdp__in-stock">In Stock &#10003;</span>
          <span v-else class="mv-pdp__out-stock">Out of Stock</span>
        </div>

        <button
          class="mv-pdp__add-btn"
          :disabled="variant && !variant.available"
          @click="onAddToCart"
        >
          {{ justAdded ? 'Added to Bag ✓' : 'Add to Bag' }}
          <span v-if="!justAdded" class="mv-pdp__arrow">&rarr;</span>
        </button>

        <!-- Accordion sections -->
        <div class="mv-pdp__accordions">
          <div
            v-for="section in ['Details + Dimensions', 'Delivery & Returns', '5-Year Warranty']"
            :key="section"
            class="mv-pdp__accordion"
          >
            <button
              class="mv-pdp__accordion-toggle"
              @click="toggleAccordion(section)"
            >
              <span>{{ section }}</span>
              <span class="mv-pdp__accordion-icon">{{ openAccordion === section ? '−' : '+' }}</span>
            </button>
            <div v-if="openAccordion === section" class="mv-pdp__accordion-body">
              <p v-if="section === 'Details + Dimensions'">
                {{ product.description || 'Handcrafted with precision. Please refer to the size guide for detailed measurements.' }}
              </p>
              <p v-else-if="section === 'Delivery & Returns'">
                Free UK delivery on orders over £50. International delivery available. 30-day returns.
              </p>
              <p v-else>
                All Monica Vinader jewellery comes with a 5-year warranty against manufacturing defects.
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
  background: #faf8f5;
  padding: 0 0 60px;
}
.mv-pdp__layout {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  padding: 0 28px;
}
.mv-pdp__gallery {
  position: sticky;
  top: 100px;
  align-self: start;
}
.mv-pdp__main-image {
  background: #f0ede8;
  overflow: hidden;
}
.mv-pdp__img {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 1;
  object-fit: cover;
}
.mv-pdp__info {
  padding: 40px 0 40px 20px;
}
.mv-pdp__title {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: 28px;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 4px;
}
.mv-pdp__material {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
}
.mv-pdp__pricing {
  margin-bottom: 12px;
}
.mv-pdp__price {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 16px;
  font-weight: 400;
  color: #1a1a1a;
}
.mv-pdp__rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}
.mv-pdp__stars {
  color: #1a1a1a;
  font-size: 14px;
  letter-spacing: 2px;
}
.mv-pdp__rating-text {
  font-size: 13px;
  color: #666;
}
.mv-pdp__finish {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.mv-pdp__finish-label {
  font-size: 13px;
  color: #666;
}
.mv-pdp__variants {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.mv-pdp__variant {
  min-width: 44px;
  padding: 8px 12px;
  border: 1px solid #1a1a1a;
  background: transparent;
  color: #1a1a1a;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 12px;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.mv-pdp__variant--selected {
  background: #1a1a1a;
  color: #fff;
}
.mv-pdp__swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}
.mv-pdp__swatch--gold {
  background: #c4a265;
  border-color: #1a1a1a;
}
.mv-pdp__swatch--silver {
  background: #c0c0c0;
}
.mv-pdp__swatch--rose {
  background: #b76e79;
}
.mv-pdp__stock {
  margin-bottom: 20px;
}
.mv-pdp__in-stock {
  font-size: 13px;
  color: #2d7d46;
  border: 1px solid #2d7d46;
  padding: 6px 16px;
  border-radius: 20px;
}
.mv-pdp__out-stock {
  font-size: 13px;
  color: #999;
}
.mv-pdp__add-btn {
  width: 100%;
  padding: 16px 32px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.3s;
  margin-bottom: 32px;
}
.mv-pdp__add-btn:hover { background: #333; }
.mv-pdp__arrow { font-size: 16px; }
.mv-pdp__accordions {
  border-top: 1px solid #e0ddd6;
}
.mv-pdp__accordion {
  border-bottom: 1px solid #e0ddd6;
}
.mv-pdp__accordion-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1a1a1a;
}
.mv-pdp__accordion-icon {
  font-size: 18px;
  font-weight: 300;
}
.mv-pdp__accordion-body {
  padding: 0 0 18px;
  font-size: 14px;
  line-height: 1.6;
  color: #555;
}
.mv-pdp__not-found {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 28px;
  text-align: center;
}
.mv-pdp__not-found-inner {
  max-width: 480px;
  margin: 0 auto;
}
.mv-pdp__not-found-title {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: 28px;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 12px;
}
.mv-pdp__not-found-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
}
.mv-pdp__not-found-cta {
  display: inline-block;
  padding: 14px 32px;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: background 0.3s;
}
.mv-pdp__not-found-cta:hover { background: #333; }
@media (max-width: 768px) {
  .mv-pdp__layout {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .mv-pdp__gallery { position: static; }
  .mv-pdp__info { padding: 24px 0; }
}
</style>
