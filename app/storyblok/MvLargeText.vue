<script setup>
import { renderRichText } from '@storyblok/vue';

const props = defineProps({ blok: Object });

function plainToHtml(raw) {
  return String(raw || '')
    .trim()
    .split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => `<p>${part}</p>`)
    .join('');
}

const rendered = computed(() => {
  const text = props.blok?.text;
  if (!text) return '';
  if (typeof text === 'object') {
    return renderRichText(text) || '';
  }
  const raw = String(text);
  if (raw.includes('<p')) return raw;
  return plainToHtml(raw);
});
/** Default on — keeps Siren overlay stacking; off = flat static section. */
const animate = computed(() => props.blok?.enable_animation !== false);
</script>

<template>
  <section
    v-editable="blok"
    class="mv-large-text"
    :class="{
      'mv-large-text--dark': blok.dark_bg,
      'mv-large-text--animate': animate,
    }"
  >
    <div v-if="rendered" class="mv-large-text__container" v-html="rendered" />
  </section>
</template>

<style scoped>
.mv-large-text {
  position: relative;
  z-index: 0;
  background: #fff;
  color: #000;
  padding: 90px 40px;
}
.mv-large-text--animate {
  z-index: 1;
}
.mv-large-text--dark {
  background: #1a1a1a;
  color: #fff;
}
.mv-large-text__container :deep(p) {
  margin: 0 0 20px;
  font-family: "Libre Caslon Text", "Times New Roman", serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 50px;
  color: inherit;
}
.mv-large-text__container :deep(p:last-child) {
  margin-bottom: 0;
}
.mv-large-text__container :deep(strong) {
  font-weight: 600;
}
.mv-large-text__container :deep(em) {
  font-style: italic;
}
.mv-large-text__container :deep(a) {
  color: inherit;
  text-decoration: underline;
}
@media (max-width: 768px) {
  .mv-large-text { padding: 48px 20px; }
  .mv-large-text__container :deep(p) {
    font-size: 28px;
    line-height: 36px;
  }
}
</style>
