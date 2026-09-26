<script setup>
const props = defineProps({ blok: Object });
const pdpProduct = inject('pdpProduct', ref(null));
const pdpVariant = inject('pdpVariant', computed(() => null));
const route = useRoute();

const attributeLabel = computed(() => ({
  product_type: 'Product type',
  finish: 'Finish',
  material: 'Material',
}[props.blok?.match_attribute] || 'Material'));

const editingTemplate = computed(() => {
  const fromQuery = route.query.path ? String(route.query.path).split('/').filter(Boolean) : [];
  const segments = fromQuery.length ? fromQuery : (route.params.slug || []);
  return segments[segments.length - 1] === 'default';
});

const visible = computed(() => {
  if (editingTemplate.value) return true;
  const product = pdpProduct.value;
  const expected = String(props.blok?.match_value || '').trim().toLowerCase();
  if (!product || !expected) return false;
  const attribute = props.blok?.match_attribute;
  const actual = attribute === 'product_type'
    ? product.productType
    : attribute === 'finish'
      ? pdpVariant.value?.title
      : product.material;
  return String(actual || '').toLowerCase().includes(expected);
});
</script>

<template>
  <section v-if="visible" v-editable="blok" class="mv-attribute">
    <div class="mv-attribute__inner">
      <p class="mv-attribute__rule">{{ attributeLabel }} · {{ blok.match_value }}</p>
      <h2 v-if="blok.headline" class="mv-attribute__headline">{{ blok.headline }}</h2>
      <p v-if="blok.body" class="mv-attribute__body">{{ blok.body }}</p>
    </div>
  </section>
</template>

<style scoped>
.mv-attribute {
  background: #1a1a1a;
  color: #faf8f5;
  border-top: 1px solid #1a1a1a;
}
.mv-attribute__inner {
  max-width: 1480px;
  margin: 0 auto;
  padding: 48px 28px;
}
.mv-attribute__rule {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #e4c56a;
  margin: 0 0 12px;
}
.mv-attribute__headline {
  font-family: var(--font-family-display, 'Cormorant Garamond', Georgia, serif);
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 400;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}
.mv-attribute__body {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 15px;
  line-height: 1.6;
  max-width: 640px;
  margin: 0;
  color: #f3f0ea;
}
</style>
