<script setup>
import { mediaUrl, resolveMedia } from '~/utils/sirenMedia';

const props = defineProps({ blok: Object });

const desktopSrc = computed(() => mediaUrl(props.blok?.media, props.blok?.image, props.blok?.image_url));
const mobileSrc = computed(() => mediaUrl(props.blok?.media_mobile, props.blok?.image_mobile, props.blok?.image_mobile_url));
const hasMobileOverride = computed(() => Boolean(mobileSrc.value));
const desktopIsEmbed = computed(() => resolveMedia(desktopSrc.value).kind === 'embed');
const pinned = computed(() => Boolean(String(props.blok?.headline || '').trim()));
const lines = computed(() => String(props.blok?.headline || '').split(/\n|\u2028/).filter(line => line.trim()));
const href = computed(() => storyblokHref(props.blok?.cta_link));
</script>

<template>
  <section
    v-editable="blok"
    class="mv-dark-hero"
    :class="{
      'mv-dark-hero--pin': pinned,
      'mv-dark-hero--has-mobile': hasMobileOverride,
    }"
  >
    <div
      class="mv-dark-hero__media mv-dark-hero__media--desktop"
      :class="{ 'mv-dark-hero__media--embed-cover': desktopIsEmbed && !hasMobileOverride }"
    >
      <MvMedia
        :src="desktopSrc"
        :alt="blok.media?.alt || blok.image?.alt || blok.headline || ''"
        class="mv-dark-hero__img"
      />
    </div>
    <div v-if="hasMobileOverride" class="mv-dark-hero__media mv-dark-hero__media--mobile">
      <MvMedia
        :src="mobileSrc"
        :alt="blok.media_mobile?.alt || blok.image_mobile?.alt || blok.headline || ''"
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
  overflow: hidden;
  container-type: size;
}
.mv-dark-hero__media--mobile {
  display: none;
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
/* Landscape Stream/YouTube iframes ignore object-fit — scale to cover when no mobile asset. */
.mv-dark-hero__media--embed-cover :deep(.mv-media--embed) {
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
  .mv-dark-hero--has-mobile .mv-dark-hero__media--desktop {
    display: none;
  }
  .mv-dark-hero__media--mobile {
    display: block;
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
