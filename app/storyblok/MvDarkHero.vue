<script setup>
import { mediaUrl, resolveMedia } from '~/utils/sirenMedia';
import {
  pickBreakpointField,
  useViewportBreakpoint,
} from '~/composables/useViewportBreakpoint';

const props = defineProps({ blok: Object });
const breakpoint = useViewportBreakpoint();

const headline = computed(() => pickBreakpointField(props.blok, 'headline', breakpoint.value) || '');
const media = computed(() => pickBreakpointField(props.blok, 'image', breakpoint.value));
const mediaSrc = computed(() => mediaUrl(media.value));
const ctaText = computed(() => pickBreakpointField(props.blok, 'cta_text', breakpoint.value) || '');
const ctaLink = computed(() => pickBreakpointField(props.blok, 'cta_link', breakpoint.value));
const href = computed(() => storyblokHref(ctaLink.value));
const pinned = computed(() => Boolean(String(headline.value || '').trim()));
const lines = computed(() => String(headline.value || '').split(/\n|\u2028/).filter(line => line.trim()));
const isEmbed = computed(() => resolveMedia(mediaSrc.value).kind === 'embed');
const alt = computed(() => media.value?.alt || headline.value || '');
</script>

<template>
  <section
    v-editable="blok"
    class="mv-dark-hero"
    :class="{
      'mv-dark-hero--pin': pinned,
      'mv-dark-hero--embed-cover': isEmbed,
    }"
  >
    <div class="mv-dark-hero__media">
      <MvMedia
        :src="mediaSrc"
        :alt="alt"
        class="mv-dark-hero__img"
      />
    </div>
    <div v-if="lines.length || ctaText" class="mv-dark-hero__content">
      <h1 v-if="lines.length" class="mv-dark-hero__headline">
        <template v-for="(line, index) in lines" :key="index">
          <br v-if="index" />{{ line }}
        </template>
      </h1>
      <a v-if="ctaText && href" :href="href" class="mv-dark-hero__cta">
        {{ ctaText }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.mv-dark-hero {
  position: relative;
  z-index: 1;
  height: calc(100vh - 6rem);
  min-height: 560px;
  background: #000;
  overflow: hidden;
}
.mv-dark-hero--pin {
  position: sticky;
  top: 6rem;
}
.mv-dark-hero__media {
  position: absolute;
  inset: 0;
  overflow: hidden;
  container-type: size;
}
.mv-dark-hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
  pointer-events: none;
}
.mv-dark-hero--embed-cover :deep(.mv-media--embed) {
  inset: auto;
  top: 50%;
  left: 50%;
  width: max(100cqw, calc(100cqh * 16 / 9));
  height: max(100cqh, calc(100cqw * 9 / 16));
  transform: translate(-50%, -50%);
}
.mv-dark-hero__content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  padding: 0 40px 56px;
  max-width: 640px;
}
.mv-dark-hero__headline {
  margin: 0 0 28px;
  max-width: 11em;
  font-family: 'Libre Caslon Text', 'Times New Roman', serif;
  font-size: 50px;
  font-weight: 400;
  line-height: 50px;
  color: #fff;
}
.mv-dark-hero__cta {
  font-family: 'Work Sans', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #fff;
  text-decoration: none;
  border-bottom: 1px solid #fff;
  padding-bottom: 3px;
}
@media (max-width: 768px) {
  .mv-dark-hero {
    min-height: 70vh;
  }
  .mv-dark-hero__headline {
    font-size: 36px;
    line-height: 38px;
  }
  .mv-dark-hero__content {
    padding: 0 20px 36px;
  }
}
</style>
