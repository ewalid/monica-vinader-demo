<script setup>
import { renderRichText } from '@storyblok/vue';

const props = defineProps({ blok: Object });

const renderedText = computed(() =>
  props.blok.text ? renderRichText(props.blok.text) : ''
);

const bgClass = computed(() => ({
  cream: 'mv-editorial--cream',
  'light-grey': 'mv-editorial--light-grey',
}[props.blok.background_color] || ''));

const aspectClass = computed(() => ({
  portrait: 'mv-editorial__img-wrap--portrait',
  square: 'mv-editorial__img-wrap--square',
  landscape: 'mv-editorial__img-wrap--landscape',
}[props.blok.aspect_ratio] || 'mv-editorial__img-wrap--portrait'));
</script>

<template>
  <section
    v-editable="blok"
    class="mv-editorial page-section"
    :class="[bgClass, { 'mv-editorial--reversed': blok.image_position === 'right' }]"
  >
    <div class="mv-editorial__container">
      <div class="mv-editorial__img-wrap" :class="aspectClass">
        <img
          v-if="blok.image?.filename"
          :src="blok.image.filename + '/m/900x0'"
          :alt="blok.image.alt || blok.headline || ''"
          class="mv-editorial__img"
          loading="lazy"
        />
      </div>
      <div class="mv-editorial__content">
        <h2 v-if="blok.headline" class="mv-editorial__headline">{{ blok.headline }}</h2>
        <div v-if="renderedText" class="mv-editorial__text" v-html="renderedText" />
        <a
          v-if="blok.cta_text && blok.cta_link?.cached_url"
          :href="blok.cta_link.cached_url"
          class="mv-editorial__cta"
        >
          {{ blok.cta_text }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-editorial--cream { background: #f5f3ef; }
.mv-editorial--light-grey { background: #fafafa; }
.mv-editorial__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.mv-editorial--reversed .mv-editorial__container {
  direction: rtl;
}
.mv-editorial--reversed .mv-editorial__container > * {
  direction: ltr;
}
.mv-editorial__img-wrap { overflow: hidden; }
.mv-editorial__img-wrap--portrait { aspect-ratio: 3/4; }
.mv-editorial__img-wrap--square { aspect-ratio: 1; }
.mv-editorial__img-wrap--landscape { aspect-ratio: 4/3; }
.mv-editorial__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mv-editorial__headline {
  font-family: var(--font-family-display, serif);
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 300;
  letter-spacing: 0.03em;
  margin-bottom: 20px;
  color: #1a1a1a;
}
.mv-editorial__text {
  font-size: 15px;
  line-height: 1.7;
  color: #555;
  margin-bottom: 28px;
}
.mv-editorial__text :deep(p + p) {
  margin-top: 12px;
}
.mv-editorial__cta {
  display: inline-block;
  padding: 12px 32px;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid #1a1a1a;
  color: #1a1a1a;
  transition: all 0.3s;
}
.mv-editorial__cta:hover {
  background: #1a1a1a;
  color: #fff;
}
@media (max-width: 768px) {
  .mv-editorial__container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .mv-editorial--reversed .mv-editorial__container {
    direction: ltr;
  }
}
</style>
