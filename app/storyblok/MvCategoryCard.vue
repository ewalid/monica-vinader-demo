<script setup>
defineProps({ blok: Object });
</script>

<template>
  <a
    v-editable="blok"
    :href="blok.link?.cached_url || '#'"
    class="mv-catcard"
  >
    <div class="mv-catcard__img-wrap">
      <img
        v-if="blok.image?.filename"
        :src="blok.image.filename + '/m/600x750'"
        :alt="blok.image.alt || blok.title"
        class="mv-catcard__img"
        loading="lazy"
      />
    </div>
    <div class="mv-catcard__label">
      <h3 class="mv-catcard__title">{{ blok.title }}</h3>
      <p v-if="blok.subtitle" class="mv-catcard__sub">{{ blok.subtitle }}</p>
    </div>
  </a>
</template>

<style scoped>
.mv-catcard {
  display: block;
  text-decoration: none;
  color: inherit;
  text-align: center;
}
.mv-catcard__img-wrap {
  aspect-ratio: 4/5;
  overflow: hidden;
  background: #f5f3ef;
  margin-bottom: 16px;
}
.mv-catcard__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.mv-catcard:hover .mv-catcard__img {
  transform: scale(1.04);
}
.mv-catcard__title {
  font-family: var(--font-family-display, serif);
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #1a1a1a;
}
.mv-catcard__sub {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
}
</style>
