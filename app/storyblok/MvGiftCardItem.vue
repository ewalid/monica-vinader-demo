<script setup>
defineProps({ blok: Object });
</script>

<template>
  <a
    v-editable="blok"
    :href="blok.link?.cached_url ? '/' + blok.link.cached_url : '#'"
    class="mv-gift-card"
  >
    <img
      v-if="blok.image?.filename"
      :src="blok.image.filename + '/m/800x800'"
      :alt="blok.title || ''"
      class="mv-gift-card__img"
      loading="lazy"
    />
    <img
      v-else-if="blok.image_url"
      :src="blok.image_url"
      :alt="blok.title || ''"
      class="mv-gift-card__img"
      loading="lazy"
    />
    <div class="mv-gift-card__overlay">
      <h3 v-if="blok.title" class="mv-gift-card__title" v-html="blok.title" />
      <span class="mv-gift-card__cta">Shop Now</span>
    </div>
  </a>
</template>

<style scoped>
.mv-gift-card {
  position: relative;
  display: block;
  overflow: hidden;
  aspect-ratio: 1;
  text-decoration: none;
}
.mv-gift-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.mv-gift-card:hover .mv-gift-card__img {
  transform: scale(1.03);
}
.mv-gift-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%);
}
.mv-gift-card__title {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 300;
  font-style: italic;
  color: #fff;
  line-height: 1.15;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.mv-gift-card__cta {
  display: inline-block;
  padding: 10px 24px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: #fff;
  color: #1a1a1a;
  transition: all 0.3s;
}
.mv-gift-card:hover .mv-gift-card__cta {
  background: #1a1a1a;
  color: #fff;
}
</style>
