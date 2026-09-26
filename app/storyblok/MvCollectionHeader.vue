<script setup>
const props = defineProps({ blok: Object });
const listing = useListingFilters();

function pillKey(label) {
  return String(label || '').trim().toLowerCase();
}

function onPill(pill) {
  if (pill.link?.cached_url || pill.link?.url) return;
  const key = pillKey(pill.label);
  listing.value = {
    ...listing.value,
    pill: listing.value.pill === key || key === 'all necklaces' ? '' : key,
  };
}

function toggleStock() {
  listing.value = { ...listing.value, inStock: !listing.value.inStock };
}
</script>

<template>
  <section v-editable="blok" class="mv-coll-header">
    <div class="mv-coll-header__container">
      <h1 class="mv-coll-header__title">{{ blok.title }}</h1>
      <p v-if="blok.description" class="mv-coll-header__desc">{{ blok.description }}</p>

      <div v-if="blok.filter_pills?.length" class="mv-coll-header__pills">
        <component
          :is="pill.link?.cached_url || pill.link?.url ? 'a' : 'button'"
          v-for="pill in blok.filter_pills"
          :key="pill._uid"
          :href="pill.link?.cached_url ? '/' + pill.link.cached_url : (pill.link?.url || undefined)"
          type="button"
          class="mv-coll-header__pill"
          :class="{ 'mv-coll-header__pill--active': listing.pill === pillKey(pill.label) }"
          @click="onPill(pill)"
        >
          {{ pill.label }}
        </component>
      </div>

      <div class="mv-coll-header__toolbar">
        <span class="mv-coll-header__count">{{ blok.product_count || '' }}</span>
        <button
          type="button"
          class="mv-coll-header__stock-toggle"
          :class="{ 'mv-coll-header__stock-toggle--on': listing.inStock }"
          @click="toggleStock"
        >
          In Stock
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-coll-header {
  background: #faf8f5;
  padding: 40px 0 0;
}
.mv-coll-header__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px;
}
.mv-coll-header__title {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 12px;
}
.mv-coll-header__desc {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  max-width: 600px;
  margin-bottom: 24px;
}
.mv-coll-header__pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none;
}
.mv-coll-header__pills::-webkit-scrollbar { display: none; }
.mv-coll-header__pill {
  display: inline-block;
  padding: 8px 16px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: #1a1a1a;
  background: transparent;
  border: 1px solid #d4d0c8;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.2s;
}
.mv-coll-header__pill:hover {
  border-color: #1a1a1a;
}
.mv-coll-header__pill--active {
  background: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;
}
.mv-coll-header__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #e0ddd6;
}
.mv-coll-header__count {
  font-size: 13px;
  color: #666;
}
.mv-coll-header__stock-toggle {
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
  background: none;
  border: 0;
  cursor: pointer;
  font-family: inherit;
}
.mv-coll-header__stock-toggle--on {
  text-decoration: underline;
}
</style>
