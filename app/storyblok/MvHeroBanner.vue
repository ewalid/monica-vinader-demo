<script setup>
import { mediaUrl, resolveMedia } from '~/utils/sirenMedia';

const props = defineProps({ blok: Object });

const desktopSrc = computed(() => mediaUrl(props.blok?.image));
const mobileSrc = computed(() => mediaUrl(props.blok?.mobile_image));
const hasMobile = computed(() => !!mobileSrc.value);

// Map legacy left/center/right to middle-* so old stories keep working.
const textPosition = computed(() => {
  const raw = String(props.blok?.text_position || 'left');
  if (raw === 'left' || raw === 'center' || raw === 'right') {
    return `middle-${raw}`;
  }
  return raw;
});

const textColor = computed(() => props.blok?.text_color || 'light');

const desktopWidth = computed(() => (
  resolveMedia(desktopSrc.value).kind === 'image' ? 1920 : 0
));
const mobileWidth = computed(() => (
  resolveMedia(mobileSrc.value).kind === 'image' ? 750 : 0
));
</script>

<template>
  <section
    v-editable="blok"
    class="mv-hero"
    :class="[
      `mv-hero--pos-${textPosition}`,
      `mv-hero--${textColor}`,
      {
        'mv-hero--full': blok.full_height,
        'mv-hero--has-mobile': hasMobile,
      },
    ]"
  >
    <div v-if="desktopSrc" class="mv-hero__media mv-hero__media--desktop">
      <MvMedia
        :src="desktopSrc"
        :alt="blok.image?.alt || blok.headline || ''"
        :width="desktopWidth"
        class="mv-hero__asset"
      />
    </div>
    <div v-if="mobileSrc" class="mv-hero__media mv-hero__media--mobile">
      <MvMedia
        :src="mobileSrc"
        :alt="blok.mobile_image?.alt || blok.headline || ''"
        :width="mobileWidth"
        class="mv-hero__asset"
      />
    </div>

    <div class="mv-hero__overlay">
      <div class="mv-hero__content">
        <h1 v-if="blok.headline" class="mv-hero__headline">{{ blok.headline }}</h1>
        <p v-if="blok.subheadline" class="mv-hero__sub">{{ blok.subheadline }}</p>
        <a
          v-if="blok.cta_text && blok.cta_link?.cached_url"
          :href="blok.cta_link.cached_url.startsWith('http') ? blok.cta_link.cached_url : '/' + String(blok.cta_link.cached_url).replace(/^\//, '')"
          class="mv-hero__cta"
        >
          {{ blok.cta_text }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-hero {
  position: relative;
  width: 100%;
  min-height: 560px;
  overflow: hidden;
  display: flex;
}
.mv-hero--full {
  min-height: calc(100vh - 92px);
}

.mv-hero__media {
  position: absolute;
  inset: 0;
}
.mv-hero__media--mobile {
  display: none;
}
@media (max-width: 768px) {
  .mv-hero--has-mobile .mv-hero__media--desktop { display: none; }
  .mv-hero--has-mobile .mv-hero__media--mobile { display: block; }
}

.mv-hero__asset,
.mv-hero__media :deep(.mv-media) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.mv-hero__media :deep(.mv-media--embed) {
  border: 0;
  pointer-events: none;
}

.mv-hero__overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px;
  display: flex;
  min-height: inherit;
}

.mv-hero__content {
  max-width: 520px;
}

/* Horizontal */
.mv-hero--pos-top-left .mv-hero__overlay,
.mv-hero--pos-middle-left .mv-hero__overlay,
.mv-hero--pos-bottom-left .mv-hero__overlay {
  justify-content: flex-start;
  text-align: left;
}
.mv-hero--pos-top-center .mv-hero__overlay,
.mv-hero--pos-middle-center .mv-hero__overlay,
.mv-hero--pos-bottom-center .mv-hero__overlay {
  justify-content: center;
  text-align: center;
}
.mv-hero--pos-top-center .mv-hero__content,
.mv-hero--pos-middle-center .mv-hero__content,
.mv-hero--pos-bottom-center .mv-hero__content {
  max-width: 640px;
}
.mv-hero--pos-top-right .mv-hero__overlay,
.mv-hero--pos-middle-right .mv-hero__overlay,
.mv-hero--pos-bottom-right .mv-hero__overlay {
  justify-content: flex-end;
  text-align: right;
}

/* Vertical */
.mv-hero--pos-top-left .mv-hero__overlay,
.mv-hero--pos-top-center .mv-hero__overlay,
.mv-hero--pos-top-right .mv-hero__overlay {
  align-items: flex-start;
}
.mv-hero--pos-middle-left .mv-hero__overlay,
.mv-hero--pos-middle-center .mv-hero__overlay,
.mv-hero--pos-middle-right .mv-hero__overlay {
  align-items: center;
}
.mv-hero--pos-bottom-left .mv-hero__overlay,
.mv-hero--pos-bottom-center .mv-hero__overlay,
.mv-hero--pos-bottom-right .mv-hero__overlay {
  align-items: flex-end;
}

/* Text colours */
.mv-hero--light { color: #fff; }
.mv-hero--dark { color: #1a1a1a; }
.mv-hero--gold { color: var(--mv-brand-gold, #c4a265); }
.mv-hero--cream { color: var(--mv-brand-cream, #faf8f5); }

.mv-hero__headline {
  font-family: var(--font-family-display, serif);
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: 0.02em;
  margin-bottom: 16px;
}
.mv-hero__sub {
  font-size: clamp(14px, 1.5vw, 18px);
  font-weight: 300;
  line-height: 1.5;
  margin-bottom: 28px;
  opacity: 0.9;
}
.mv-hero__cta {
  display: inline-block;
  padding: 14px 36px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
  border: 1px solid currentColor;
  transition: background 0.3s ease, color 0.3s ease;
}
.mv-hero--light .mv-hero__cta:hover,
.mv-hero--cream .mv-hero__cta:hover,
.mv-hero--gold .mv-hero__cta:hover {
  background: currentColor;
  color: #1a1a1a;
}
.mv-hero--dark .mv-hero__cta:hover {
  background: #1a1a1a;
  color: #fff;
}

@media (max-width: 768px) {
  .mv-hero { min-height: 400px; }
  .mv-hero__overlay { padding: 40px 20px; }
}
</style>
