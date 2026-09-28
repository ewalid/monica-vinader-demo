<script setup>
const props = defineProps({ blok: Object });

const { isRTL } = useDirection();
const track = ref(null);

function isRichText(value) {
  return value?.type === 'doc';
}

const hasHeadline = computed(() => {
  const h = props.blok?.headline;
  if (!h) return false;
  if (typeof h === 'string') return !!h.trim();
  return isRichText(h);
});

function scrollTrack(dir) {
  if (!track.value) return;
  const card = track.value.querySelector('.mv-gift-carousel-item');
  const w = card ? card.offsetWidth + 20 : 260;
  // In RTL the track is direction:rtl, so positive scrollLeft moves toward "start"
  const sign = isRTL.value ? -dir : dir;
  track.value.scrollBy({ left: sign * w * 2, behavior: 'smooth' });
}
</script>

<template>
  <section
    v-editable="blok"
    class="mv-gift-carousel"
    :class="{ 'mv-gift-carousel--rtl': isRTL }"
  >
    <div class="mv-gift-carousel__inner">
      <div class="mv-gift-carousel__aside">
        <h2 v-if="hasHeadline" class="mv-gift-carousel__headline">
          <StoryblokRichText v-if="isRichText(blok.headline)" :document="blok.headline" />
          <span v-else v-html="blok.headline" />
        </h2>
        <div class="mv-gift-carousel__arrows">
          <button
            type="button"
            class="mv-gift-carousel__arrow"
            aria-label="Previous"
            @click="scrollTrack(-1)"
          >
            ←
          </button>
          <button
            type="button"
            class="mv-gift-carousel__arrow"
            aria-label="Next"
            @click="scrollTrack(1)"
          >
            →
          </button>
        </div>
      </div>

      <div ref="track" class="mv-gift-carousel__track">
        <StoryblokComponent
          v-for="item in (blok.items || [])"
          :key="item._uid"
          :blok="item"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-gift-carousel {
  background: #faf9f6;
  padding: 64px 0 72px;
}
/*
 * LTR (default): [ headline | products ]
 * RTL (--rtl):   [ products | headline ] via order — explicit mirror, not
 * document-direction grid quirks (those inverted EN/AR in the VE).
 */
.mv-gift-carousel__inner {
  max-width: 1440px;
  margin: 0 auto;
  padding-inline-start: 40px;
  display: grid;
  grid-template-columns: minmax(220px, 28%) 1fr;
  gap: 32px;
  align-items: center;
  direction: ltr;
}
.mv-gift-carousel--rtl .mv-gift-carousel__inner {
  padding-inline-start: 0;
  padding-inline-end: 40px;
  grid-template-columns: 1fr minmax(220px, 28%);
}
.mv-gift-carousel--rtl .mv-gift-carousel__aside {
  order: 2;
}
.mv-gift-carousel--rtl .mv-gift-carousel__track {
  order: 1;
}
.mv-gift-carousel__aside {
  padding-inline-end: 12px;
}
.mv-gift-carousel--rtl .mv-gift-carousel__aside {
  padding-inline-end: 0;
  padding-inline-start: 12px;
}
.mv-gift-carousel__headline {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 400;
  line-height: 1.2;
  color: #1a1a1a;
  margin: 0 0 28px;
  text-align: start;
}
.mv-gift-carousel--rtl .mv-gift-carousel__headline {
  direction: rtl;
  text-align: right;
}
.mv-gift-carousel__headline :deep(p) {
  margin: 0;
}
.mv-gift-carousel__headline :deep(em),
.mv-gift-carousel__headline :deep(i) {
  font-style: italic;
}
.mv-gift-carousel__arrows {
  display: flex;
  gap: 16px;
  direction: ltr;
  justify-content: flex-start;
}
.mv-gift-carousel--rtl .mv-gift-carousel__arrows {
  justify-content: flex-end;
}
.mv-gift-carousel__arrow {
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: #1a1a1a;
  cursor: pointer;
  padding: 4px 2px;
  transition: opacity 0.2s;
}
.mv-gift-carousel__arrow:hover {
  opacity: 0.45;
}
.mv-gift-carousel__track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-inline-end: 40px;
  direction: ltr;
}
.mv-gift-carousel--rtl .mv-gift-carousel__track {
  /* First item sits next to the headline (on the right) */
  direction: rtl;
  padding-inline-end: 0;
  padding-inline-start: 40px;
}
.mv-gift-carousel__track::-webkit-scrollbar {
  display: none;
}

@media (max-width: 900px) {
  .mv-gift-carousel__inner,
  .mv-gift-carousel--rtl .mv-gift-carousel__inner {
    grid-template-columns: 1fr;
    padding-inline: 24px;
    gap: 24px;
  }
  .mv-gift-carousel--rtl .mv-gift-carousel__aside,
  .mv-gift-carousel--rtl .mv-gift-carousel__track {
    order: unset;
  }
  .mv-gift-carousel__track,
  .mv-gift-carousel--rtl .mv-gift-carousel__track {
    padding-inline: 24px;
    margin-inline: -24px;
  }
}
</style>
