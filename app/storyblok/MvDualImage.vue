<script setup>
import { mediaUrl } from '~/utils/sirenMedia';
import {
  pickBreakpointBool,
  pickBreakpointField,
  useViewportBreakpoint,
} from '~/composables/useViewportBreakpoint';

const props = defineProps({ blok: Object });
const breakpoint = useViewportBreakpoint();

const leftAsset = computed(() => pickBreakpointField(props.blok, 'image_left', breakpoint.value));
const leftUrl = computed(() => pickBreakpointField(props.blok, 'image_left_url', breakpoint.value));
const rightAsset = computed(() => pickBreakpointField(props.blok, 'image_right', breakpoint.value));
const rightUrl = computed(() => pickBreakpointField(props.blok, 'image_right_url', breakpoint.value));
const left = computed(() => mediaUrl(leftAsset.value, leftUrl.value));
const right = computed(() => mediaUrl(rightAsset.value, rightUrl.value));
const animate = computed(() => pickBreakpointBool(props.blok, 'enable_animation', breakpoint.value, true));
</script>

<template>
  <section
    v-editable="blok"
    class="mv-dual-image"
    :class="{ 'mv-dual-image--animate': animate }"
  >
    <div class="mv-dual-image__pane">
      <MvMedia :src="left" :alt="leftAsset?.alt || ''" class="mv-dual-image__img" />
    </div>
    <div class="mv-dual-image__pane">
      <MvMedia :src="right" :alt="rightAsset?.alt || ''" class="mv-dual-image__img" />
    </div>
  </section>
</template>

<style scoped>
.mv-dual-image {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: calc(100vh - 6rem);
  min-height: 560px;
  background: #111;
  overflow: hidden;
}
.mv-dual-image--animate {
  position: sticky;
  top: 6rem;
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
.mv-dual-image__pane :deep(video),
.mv-dual-image__pane :deep(iframe) {
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
  }
  .mv-dual-image--animate {
    position: relative;
    top: auto;
  }
  .mv-dual-image__pane {
    aspect-ratio: 1;
  }
}
</style>
