<script setup>
import { mediaUrl, isStream, isVideo } from '~/utils/sirenMedia';

const props = defineProps({ blok: Object });

const src = computed(() => mediaUrl(props.blok?.media, props.blok?.image, props.blok?.image_url));
const video = computed(() => isVideo(src.value));
const stream = computed(() => isStream(src.value));
const pinned = computed(() => Boolean(String(props.blok?.headline || '').trim()));
const lines = computed(() => String(props.blok?.headline || '').split(/\n|\u2028/).filter(line => line.trim()));
const href = computed(() => storyblokHref(props.blok?.cta_link));
</script>

<template>
  <section
    v-editable="blok"
    class="mv-dark-hero"
    :class="{ 'mv-dark-hero--pin': pinned }"
  >
    <div class="mv-dark-hero__media">
      <iframe
        v-if="stream"
        :src="src"
        class="mv-dark-hero__frame"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
        title=""
      />
      <video
        v-else-if="video"
        :src="src"
        class="mv-dark-hero__video"
        autoplay
        muted
        loop
        playsinline
      />
      <img
        v-else-if="src"
        :src="src"
        :alt="blok.headline || ''"
        class="mv-dark-hero__img"
      />
    </div>
    <div v-if="lines.length || blok.cta_text" class="mv-dark-hero__content">
      <h1 v-if="lines.length" class="mv-dark-hero__headline">
        <template v-for="(line, index) in lines" :key="index">
          <br v-if="index" />{{ line }}
        </template>
      </h1>
      <a v-if="blok.cta_text && href" :href="href" class="mv-dark-hero__cta">
        {{ blok.cta_text }}
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
}
.mv-dark-hero__frame,
.mv-dark-hero__video,
.mv-dark-hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
  pointer-events: none;
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
  font-family: "Libre Caslon Text", "Times New Roman", serif;
  font-size: 50px;
  font-weight: 400;
  line-height: 50px;
  color: #fff;
}
.mv-dark-hero__cta {
  font-family: "Work Sans", Helvetica, sans-serif;
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
  .mv-dark-hero { min-height: 70vh; }
  .mv-dark-hero__headline { font-size: 36px; line-height: 38px; }
  .mv-dark-hero__content { padding: 0 20px 36px; }
}
</style>
