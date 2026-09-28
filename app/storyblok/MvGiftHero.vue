<script setup>
import { mediaUrl } from '~/utils/sirenMedia';

const props = defineProps({ blok: Object });

const left = computed(() =>
  mediaUrl(props.blok?.image_left, props.blok?.image_left_url),
);
const right = computed(() =>
  mediaUrl(props.blok?.image_right, props.blok?.image_right_url),
);
</script>

<template>
  <section v-editable="blok" class="mv-gift-hero">
    <div class="mv-gift-hero__pane">
      <MvMedia
        :src="left"
        :alt="blok.image_left?.alt || blok.image_left_alt || ''"
        class="mv-gift-hero__img"
      />
    </div>
    <div class="mv-gift-hero__pane">
      <MvMedia
        :src="right"
        :alt="blok.image_right?.alt || blok.image_right_alt || ''"
        class="mv-gift-hero__img"
      />
    </div>
  </section>
</template>

<style scoped>
.mv-gift-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  min-height: clamp(320px, 52vw, 640px);
  background: #f5f3ef;
  overflow: hidden;
}
.mv-gift-hero__pane {
  position: relative;
  min-width: 0;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  max-height: 720px;
}
.mv-gift-hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (max-width: 768px) {
  .mv-gift-hero {
    grid-template-columns: 1fr;
    min-height: 0;
  }
  .mv-gift-hero__pane {
    aspect-ratio: 1;
    max-height: none;
  }
}
</style>
