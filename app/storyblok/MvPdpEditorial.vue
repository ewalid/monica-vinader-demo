<script setup>
const props = defineProps({ blok: Object });
const pdpProduct = inject('pdpProduct', ref(null));
const route = useRoute();

const editingTemplate = computed(() => {
  const fromQuery = route.query.path ? String(route.query.path).split('/').filter(Boolean) : [];
  const segments = fromQuery.length ? fromQuery : (route.params.slug || []);
  return segments[segments.length - 1] === 'default';
});

const linkHref = computed(() => storyblokHref(props.blok?.link));

const visible = computed(() => {
  const attribute = props.blok?.match_attribute || 'none';
  if (attribute === 'none') return true;
  if (editingTemplate.value) return true;
  const product = pdpProduct.value;
  const expected = String(props.blok?.match_value || '').trim().toLowerCase();
  if (!product || !expected) return false;
  const actual = attribute === 'product_type'
    ? product.productType
    : attribute === 'tag'
      ? (product.tags || []).join(' ')
      : product.material;
  return String(actual || '').toLowerCase().includes(expected);
});
</script>

<template>
  <section v-if="visible" v-editable="blok" class="mv-pdp-editorial">
    <div class="mv-pdp-editorial__inner">
      <p v-if="blok.eyebrow" class="mv-pdp-editorial__eyebrow">{{ blok.eyebrow }}</p>
      <h2 v-if="blok.headline" class="mv-pdp-editorial__headline">{{ blok.headline }}</h2>
      <p v-if="blok.body" class="mv-pdp-editorial__body">{{ blok.body }}</p>
      <a
        v-if="linkHref && blok.link_label"
        :href="linkHref"
        class="mv-pdp-editorial__link"
        :target="blok.link?.target || undefined"
        :rel="blok.link?.target === '_blank' ? 'noopener' : undefined"
      >
        {{ blok.link_label }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.mv-pdp-editorial {
  background: #f7f5f2;
  border-top: 1px solid #e6e6e6;
}
.mv-pdp-editorial__inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 56px 24px;
}
.mv-pdp-editorial__eyebrow {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6b6b6b;
  margin: 0 0 10px;
}
.mv-pdp-editorial__headline {
  font-family: var(--font-family-display, 'Cormorant Garamond', Georgia, serif);
  font-size: 36px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #1a1a1a;
  margin: 0 0 14px;
}
.mv-pdp-editorial__body {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 15px;
  line-height: 1.6;
  color: #1a1a1a;
  margin: 0;
  white-space: pre-line;
}
.mv-pdp-editorial__link {
  display: inline-block;
  margin-top: 18px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a1a1a;
  text-decoration: none;
  border-bottom: 1px solid #1a1a1a;
  padding-bottom: 2px;
}
</style>
