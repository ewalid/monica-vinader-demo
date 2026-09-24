<script setup>
defineProps({ blok: Object });
</script>

<template>
  <a
    v-editable="blok"
    :href="blok.link?.cached_url || blok.link?.url || '#'"
    class="mv-catcard"
  >
    <div class="mv-catcard__img-wrap">
      <img
        v-if="blok.image?.filename"
        :src="blok.image.filename + '/m/400x400'"
        :alt="blok.image.alt || blok.title"
        class="mv-catcard__img"
        loading="lazy"
      />
    </div>
    <h3 class="mv-catcard__title">{{ blok.title }}</h3>
  </a>
</template>

<style scoped>
.mv-catcard {
  display: block;
  text-decoration: none;
  color: inherit;
  flex: 0 0 220px;
  scroll-snap-align: start;
}
.mv-catcard__img-wrap {
  width: 220px;
  height: 220px;
  overflow: hidden;
  background: #f0eeeb;
  margin-bottom: 12px;
}
.mv-catcard__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.mv-catcard:hover .mv-catcard__img {
  transform: scale(1.05);
}
.mv-catcard__title {
  font-family: var(--font-family-body, sans-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #1a1a1a;
}

@media (max-width: 768px) {
  .mv-catcard { flex: 0 0 160px; }
  .mv-catcard__img-wrap { width: 160px; height: 160px; }
}
</style>
