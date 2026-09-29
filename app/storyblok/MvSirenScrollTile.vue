<script setup>
import { renderRichText } from '@storyblok/vue';
import { mediaUrl } from '~/utils/sirenMedia';
import {
  pickBreakpointBool,
  pickBreakpointField,
  useViewportBreakpoint,
} from '~/composables/useViewportBreakpoint';

const props = defineProps({ blok: Object });
const breakpoint = useViewportBreakpoint();

function plainToHtml(raw) {
  return String(raw || '')
    .trim()
    .split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => `<p>${part}</p>`)
    .join('');
}

const textValue = computed(() => pickBreakpointField(props.blok, 'text', breakpoint.value));
const rendered = computed(() => {
  const text = textValue.value;
  if (!text) return '';
  if (typeof text === 'object') return renderRichText(text) || '';
  const raw = String(text);
  if (raw.includes('<p')) return raw;
  return plainToHtml(raw);
});

const slides = computed(() => {
  const items = pickBreakpointField(props.blok, 'slides', breakpoint.value);
  return Array.isArray(items) ? items : [];
});

const animate = computed(() => pickBreakpointBool(props.blok, 'enable_animation', breakpoint.value, true));
const textFirst = computed(() => {
  const side = pickBreakpointField(props.blok, 'text_side', breakpoint.value) || 'left';
  return side !== 'right';
});

function slideSrc(slide) {
  return mediaUrl(slide?.image, slide?.image_url);
}

function slideAlt(slide) {
  return slide?.image?.alt || slide?.alt || '';
}
</script>

<template>
  <section
    v-editable="blok"
    class="mv-siren-scroll"
    :class="{
      'mv-siren-scroll--animate': animate,
      'mv-siren-scroll--text-right': !textFirst,
    }"
  >
    <div class="mv-siren-scroll__grid">
      <article class="mv-siren-scroll__text">
        <div
          v-if="rendered"
          class="mv-siren-scroll__copy"
          v-html="rendered"
        />
      </article>
      <div class="mv-siren-scroll__gallery">
        <div
          v-for="slide in slides"
          :key="slide._uid"
          class="mv-siren-scroll__slide"
        >
          <MvMedia
            :src="slideSrc(slide)"
            :alt="slideAlt(slide)"
            class="mv-siren-scroll__media"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-siren-scroll {
  position: relative;
  z-index: 1;
  background: #fff;
  --mv-siren-vh: calc(100vh - 6rem);
}
.mv-siren-scroll__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
  background: #fff;
}
.mv-siren-scroll--text-right .mv-siren-scroll__text {
  order: 2;
}
.mv-siren-scroll--text-right .mv-siren-scroll__gallery {
  order: 1;
}
.mv-siren-scroll__text {
  display: flex;
  align-items: center;
  padding: 48px 56px;
  background: #fff;
  min-height: var(--mv-siren-vh);
}
.mv-siren-scroll--animate .mv-siren-scroll__text {
  position: sticky;
  top: 6rem;
  height: var(--mv-siren-vh);
  min-height: 560px;
}
.mv-siren-scroll__copy {
  max-width: 28rem;
}
.mv-siren-scroll__copy :deep(p) {
  margin: 0 0 20px;
  font-family: "Libre Caslon Text", "Times New Roman", serif;
  font-size: 28px;
  font-weight: 400;
  line-height: 38px;
  color: #000;
}
.mv-siren-scroll__copy :deep(p:last-child) {
  margin-bottom: 0;
}
.mv-siren-scroll__gallery {
  background: #111;
}
.mv-siren-scroll__slide {
  position: relative;
  height: var(--mv-siren-vh);
  min-height: 560px;
  overflow: hidden;
}
.mv-siren-scroll__media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
  pointer-events: none;
}
@media (max-width: 768px) {
  .mv-siren-scroll__grid {
    display: flex;
    flex-direction: column;
  }
  .mv-siren-scroll__text {
    order: 0 !important;
    position: relative !important;
    top: auto !important;
    height: auto;
    min-height: 0;
    padding: 36px 20px 24px;
  }
  .mv-siren-scroll__copy :deep(p) {
    font-size: 22px;
    line-height: 30px;
  }
  .mv-siren-scroll__gallery {
    order: 1 !important;
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .mv-siren-scroll__gallery::-webkit-scrollbar {
    display: none;
  }
  .mv-siren-scroll__slide {
    flex: 0 0 85vw;
    height: 85vw;
    min-height: 280px;
    scroll-snap-align: start;
  }
}
</style>
