<script setup>
import { mediaUrl } from '~/utils/sirenMedia';

const props = defineProps({ blok: Object });

const left = computed(() => mediaUrl(props.blok?.media_left, props.blok?.image_left, props.blok?.image_left_url, props.blok?.image_1_url));
const right = computed(() => mediaUrl(props.blok?.media_right, props.blok?.image_right, props.blok?.image_right_url, props.blok?.image_2_url));
</script>

<template>
  <section v-editable="blok" class="mv-dual-image">
    <div class="mv-dual-image__pane">
      <MvMedia :src="left" :alt="blok.media_left?.alt || blok.image_left?.alt || ''" class="mv-dual-image__img" />
    </div>
    <div class="mv-dual-image__pane">
      <MvMedia :src="right" :alt="blok.media_right?.alt || blok.image_right?.alt || ''" class="mv-dual-image__img" />
    </div>
  </section>
</template>

<style scoped>
.mv-dual-image {
  position: sticky;
  top: 6rem;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: calc(100vh - 6rem);
  min-height: 560px;
  background: #111;
  overflow: hidden;
}
.mv-dual-image__pane {
  position: relative;
  min-width: 0;
  overflow: hidden;
}
.mv-dual-image__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
  pointer-events: none;
}
@media (max-width: 640px) {
  .mv-dual-image {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
    position: relative;
    top: auto;
  }
  .mv-dual-image__pane {
    aspect-ratio: 1;
  }
}
</style>
