<script setup>
defineProps({ blok: Object });
</script>

<template>
  <section v-editable="blok" class="mv-coll-header">
    <div class="mv-coll-header__container">
      <h1 class="mv-coll-header__title">{{ blok.title }}</h1>
      <p v-if="blok.description" class="mv-coll-header__desc">{{ blok.description }}</p>

      <div v-if="blok.filter_pills?.length" class="mv-coll-header__pills">
        <a
          v-for="pill in blok.filter_pills"
          :key="pill._uid"
          :href="pill.link?.cached_url ? '/' + pill.link.cached_url : '#'"
          class="mv-coll-header__pill"
        >
          {{ pill.label }}
        </a>
      </div>

      <div class="mv-coll-header__toolbar">
        <span class="mv-coll-header__count">{{ blok.product_count || '' }}</span>
        <span class="mv-coll-header__stock-toggle">In Stock</span>
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
  border: 1px solid #d4d0c8;
  white-space: nowrap;
  transition: all 0.2s;
}
.mv-coll-header__pill:hover {
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
}
</style>
