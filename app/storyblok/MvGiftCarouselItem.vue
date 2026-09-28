<script setup>
const props = defineProps({ blok: Object });

const href = computed(() => {
  const raw = props.blok?.link?.cached_url || props.blok?.link?.url || '';
  if (!raw) return '#';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  return `/${raw}`;
});
</script>

<template>
  <a
    v-editable="blok"
    :href="href"
    class="mv-gift-carousel-item"
  >
    <div class="mv-gift-carousel-item__img-wrap">
      <img
        v-if="blok.image?.filename"
        :src="blok.image.filename + '/m/600x600'"
        :alt="blok.image.alt || blok.title || ''"
        class="mv-gift-carousel-item__img"
        loading="lazy"
      />
      <img
        v-else-if="blok.image_url"
        :src="blok.image_url"
        :alt="blok.title || ''"
        class="mv-gift-carousel-item__img"
        loading="lazy"
      />
    </div>
    <h3 class="mv-gift-carousel-item__title">{{ blok.title }}</h3>
  </a>
</template>

<style scoped>
.mv-gift-carousel-item {
  display: block;
  flex: 0 0 240px;
  scroll-snap-align: start;
  text-decoration: none;
  color: inherit;
}
.mv-gift-carousel-item__img-wrap {
  width: 240px;
  height: 240px;
  overflow: hidden;
  background: #eceae6;
  margin-bottom: 14px;
}
.mv-gift-carousel-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.mv-gift-carousel-item:hover .mv-gift-carousel-item__img {
  transform: scale(1.04);
}
.mv-gift-carousel-item__title {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1a1a1a;
  text-align: left;
}
@media (max-width: 768px) {
  .mv-gift-carousel-item { flex: 0 0 180px; }
  .mv-gift-carousel-item__img-wrap { width: 180px; height: 180px; }
}
</style>
