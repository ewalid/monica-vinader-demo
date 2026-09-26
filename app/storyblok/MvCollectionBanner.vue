<script setup>
const props = defineProps({ blok: Object });
const href = computed(() => storyblokHref(props.blok?.link));
</script>

<template>
  <component
    :is="href ? 'a' : 'section'"
    v-editable="blok"
    class="mv-collection-banner"
    :class="{ 'mv-collection-banner--visual': blok.image?.filename }"
    :href="href || undefined"
    :target="blok.link?.target || undefined"
    :rel="blok.link?.target === '_blank' ? 'noopener' : undefined"
  >
    <div class="mv-collection-banner__copy">
      <h2 v-if="blok.headline" class="mv-collection-banner__headline">{{ blok.headline }}</h2>
      <p v-if="blok.subheadline" class="mv-collection-banner__sub">{{ blok.subheadline }}</p>
    </div>
    <div v-if="blok.image?.filename" class="mv-collection-banner__media">
      <img
        :src="blok.image.filename + '/m/1400x0'"
        :alt="blok.image.alt || blok.headline || ''"
      >
    </div>
  </component>
</template>

<style scoped>
.mv-collection-banner {
  display: block;
  background: #faf8f5;
  text-decoration: none;
  color: inherit;
  border-top: 1px solid #e6e6e6;
}
.mv-collection-banner--visual {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) 1.2fr;
  min-height: 460px;
}
.mv-collection-banner__copy {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 64px 48px;
  max-width: 640px;
}
.mv-collection-banner__headline {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: #1a1a1a;
  margin: 0 0 16px;
}
.mv-collection-banner__sub {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(16px, 2vw, 22px);
  line-height: 1.45;
  color: #1a1a1a;
  margin: 0;
}
.mv-collection-banner__media {
  min-height: 320px;
  background: #efeae4;
  overflow: hidden;
}
.mv-collection-banner__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
@media (max-width: 800px) {
  .mv-collection-banner--visual { grid-template-columns: 1fr; }
  .mv-collection-banner__copy { padding: 40px 20px 28px; }
  .mv-collection-banner__media { min-height: 280px; order: -1; }
}
</style>
