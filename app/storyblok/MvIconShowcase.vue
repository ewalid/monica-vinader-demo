<script setup>
const props = defineProps({ blok: Object });

const shopify = ref(null);
const siteConfig = await getSiteConfig();
const { urlPath } = await getProductsPath();
const cartEnabled = computed(() => !!siteConfig.value?.content?.enable_cart);
const { addToCart } = useCart();

function mediaSrc(blok) {
  return blok?.image?.filename || blok?.image_url || '';
}

function isVideo(src) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src || '');
}

const route = useRoute();

function formatMoney(amount, currency) {
  const locales = { GBP: 'en-GB', USD: 'en-US', AED: 'en-AE' };
  return new Intl.NumberFormat(locales[currency] || 'en-GB', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function pageSlug() {
  if (route.query.path) return String(route.query.path).split('/').filter(Boolean);
  return route.params.slug || [];
}

async function loadShopify() {
  if (!props.blok?.shopify_product) {
    shopify.value = null;
    return;
  }
  try {
    shopify.value = await fetchShopifyShowcaseProduct(
      props.blok.shopify_product,
      countryFromSlug(pageSlug()),
    );
  }
  catch (error) {
    console.log(error);
    shopify.value = null;
  }
}

watch(
  () => [props.blok?.shopify_product, route.params.slug, route.query.path],
  loadShopify,
  { immediate: true },
);

const displayName = computed(() => props.blok?.product_name || '');
const displaySubtitle = computed(() => (
  shopify.value ? shopify.value.subtitle : (props.blok?.subtitle || '')
));
const displayPrice = computed(() => {
  if (shopify.value?.price != null) {
    return formatMoney(shopify.value.price, shopify.value.currency);
  }
  return props.blok?.price || '';
});
const availability = computed(() => {
  if (!shopify.value) return '';
  return shopify.value.available ? 'In stock' : 'Sold out';
});

function isRichText(value) {
  return value?.type === 'doc';
}

const readMoreHref = computed(() => {
  const manual = props.blok.read_more_link?.cached_url;
  if (manual) return `/${String(manual).replace(/^\//, '')}`;
  if (props.blok.shopify_product) return `/${urlPath}/${props.blok.shopify_product}`;
  return '';
});

function onAddToCart() {
  if (!cartEnabled.value || !shopify.value?.variantId || !shopify.value.available) return;
  addToCart(shopify.value.variantId);
}
</script>

<template>
  <section
    v-editable="blok"
    class="mv-icon-showcase"
    :class="{ 'mv-icon-showcase--reversed': blok.image_position === 'right' }"
  >
    <div class="mv-icon-showcase__container">
      <div class="mv-icon-showcase__media">
        <video
          v-if="isVideo(mediaSrc(blok))"
          :src="mediaSrc(blok)"
          class="mv-icon-showcase__img"
          autoplay
          muted
          loop
          playsinline
        />
        <img
          v-else-if="mediaSrc(blok)"
          :src="blok.image?.filename ? mediaSrc(blok) + '/m/900x0' : mediaSrc(blok)"
          :alt="displayName || ''"
          class="mv-icon-showcase__img"
          loading="lazy"
        />
      </div>
      <div class="mv-icon-showcase__content">
        <h3 v-if="displayName" class="mv-icon-showcase__name">
          {{ displayName }}
        </h3>
        <p v-if="displaySubtitle" class="mv-icon-showcase__subtitle">
          {{ displaySubtitle }}
        </p>
        <p
          v-if="displayPrice"
          class="mv-icon-showcase__price"
          :class="{ 'mv-icon-showcase__price--followed': availability }"
        >
          {{ displayPrice }}
        </p>
        <p v-if="availability" class="mv-icon-showcase__availability">
          {{ availability }}
        </p>
        <div v-if="isRichText(blok.description)" class="mv-icon-showcase__desc">
          <StoryblokRichText :document="blok.description" />
        </div>
        <div class="mv-icon-showcase__actions">
          <a
            v-if="readMoreHref"
            :href="readMoreHref"
            class="mv-icon-showcase__btn mv-icon-showcase__btn--outline"
          >
            Read More
          </a>
          <button
            class="mv-icon-showcase__btn mv-icon-showcase__btn--solid"
            :disabled="shopify && !shopify.available"
            @click="onAddToCart"
          >
            Add to Cart &nbsp;&rarr;
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-icon-showcase {
  background: #faf8f5;
  padding: 60px 0;
  border-top: 1px solid #ece9e3;
}
.mv-icon-showcase__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}
.mv-icon-showcase--reversed .mv-icon-showcase__container {
  direction: rtl;
}
.mv-icon-showcase--reversed .mv-icon-showcase__container > * {
  direction: ltr;
}
.mv-icon-showcase__media {
  overflow: hidden;
}
.mv-icon-showcase__img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}
.mv-icon-showcase__name {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.mv-icon-showcase__subtitle {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  color: #666;
  margin-bottom: 6px;
}
.mv-icon-showcase__price {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 15px;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 24px;
}
.mv-icon-showcase__price--followed {
  margin-bottom: 6px;
}
.mv-icon-showcase__availability {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 13px;
  color: #666;
  margin-bottom: 24px;
}
.mv-icon-showcase__desc {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(24px, 3.5vw, 36px);
  font-weight: 300;
  line-height: 1.25;
  color: #1a1a1a;
  margin-bottom: 32px;
}
.mv-icon-showcase__desc :deep(p) {
  margin: 0;
}
.mv-icon-showcase__desc :deep(em),
.mv-icon-showcase__desc :deep(i) {
  font-style: italic;
}
.mv-icon-showcase__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.mv-icon-showcase__btn {
  display: inline-flex;
  align-items: center;
  padding: 14px 32px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
.mv-icon-showcase__btn--outline {
  background: transparent;
  border: 1px solid #1a1a1a;
  color: #1a1a1a;
}
.mv-icon-showcase__btn--outline:hover {
  background: #1a1a1a;
  color: #fff;
}
.mv-icon-showcase__btn--solid {
  background: #1a1a1a;
  border: 1px solid #1a1a1a;
  color: #fff;
}
.mv-icon-showcase__btn--solid:hover {
  background: #333;
}
.mv-icon-showcase__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
@media (max-width: 768px) {
  .mv-icon-showcase__container {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 0 20px;
  }
  .mv-icon-showcase--reversed .mv-icon-showcase__container {
    direction: ltr;
  }
  .mv-icon-showcase { padding: 40px 0; }
}
</style>
