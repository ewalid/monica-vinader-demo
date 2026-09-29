<script setup>
import {
  pickBreakpointField,
  useViewportBreakpoint,
} from '~/composables/useViewportBreakpoint';

const props = defineProps({ blok: Object });
const breakpoint = useViewportBreakpoint();

const title = computed(() => pickBreakpointField(props.blok, 'title', breakpoint.value) || '');
const image = computed(() => pickBreakpointField(props.blok, 'image', breakpoint.value));
const imageUrl = computed(() => pickBreakpointField(props.blok, 'image_url', breakpoint.value) || '');
const link = computed(() => pickBreakpointField(props.blok, 'link', breakpoint.value));
const href = computed(() => {
  const cached = link.value?.cached_url;
  if (cached) return cached.startsWith('http') ? cached : `/${cached}`;
  return link.value?.url || '#';
});
const src = computed(() => {
  if (image.value?.filename) return `${image.value.filename}/m/600x600`;
  return imageUrl.value || '';
});
</script>

<template>
  <a
    v-editable="blok"
    :href="href"
    class="mv-three-cards__card"
    :class="{
      'mv-hide-mobile': blok.hide_on_mobile,
      'mv-hide-tablet': blok.hide_on_tablet,
      'mv-hide-desktop': blok.hide_on_desktop,
    }"
  >
    <div class="mv-three-cards__img-wrap">
      <img
        v-if="src"
        :src="src"
        :alt="title || ''"
        class="mv-three-cards__img"
        loading="lazy"
      />
    </div>
    <span v-if="title" class="mv-three-cards__title">{{ title }}</span>
  </a>
</template>

<style scoped>
.mv-three-cards__card {
  text-decoration: none;
  display: block;
}
.mv-three-cards__img-wrap {
  overflow: hidden;
  aspect-ratio: 4/5;
  margin-bottom: 16px;
}
.mv-three-cards__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.mv-three-cards__card:hover .mv-three-cards__img {
  transform: scale(1.03);
}
.mv-three-cards__title {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1a1a1a;
  border-bottom: 1px solid #1a1a1a;
  padding-bottom: 4px;
}
</style>
