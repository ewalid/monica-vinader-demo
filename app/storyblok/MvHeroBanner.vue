<script setup>
defineProps({ blok: Object });
</script>

<template>
  <section
    v-editable="blok"
    class="mv-hero"
    :class="[
      `mv-hero--text-${blok.text_position || 'left'}`,
      `mv-hero--${blok.text_color || 'light'}`,
      { 'mv-hero--full': blok.full_height },
    ]"
  >
    <picture v-if="blok.image?.filename" class="mv-hero__picture">
      <source
        v-if="blok.mobile_image?.filename"
        :srcset="blok.mobile_image.filename + '/m/750x0'"
        media="(max-width: 768px)"
      />
      <img
        :src="blok.image.filename + '/m/1920x0'"
        :alt="blok.image.alt || blok.headline || ''"
        class="mv-hero__img"
        loading="eager"
      />
    </picture>

    <div class="mv-hero__overlay">
      <div class="mv-hero__content">
        <h1 v-if="blok.headline" class="mv-hero__headline">{{ blok.headline }}</h1>
        <p v-if="blok.subheadline" class="mv-hero__sub">{{ blok.subheadline }}</p>
        <a
          v-if="blok.cta_text && blok.cta_link?.cached_url"
          :href="blok.cta_link.cached_url"
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
  min-height: 520px;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.mv-hero--full {
  min-height: 100vh;
}
.mv-hero__picture {
  position: absolute;
  inset: 0;
}
.mv-hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mv-hero__overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px;
}
.mv-hero--text-left .mv-hero__content { text-align: left; max-width: 520px; }
.mv-hero--text-center .mv-hero__content { text-align: center; max-width: 640px; margin: 0 auto; }
.mv-hero--text-right .mv-hero__content { text-align: right; max-width: 520px; margin-left: auto; }

.mv-hero--light { color: #fff; }
.mv-hero--dark { color: #1a1a1a; }

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
  border: 1px solid currentColor;
  transition: all 0.3s ease;
}
.mv-hero--light .mv-hero__cta {
  color: #fff;
  border-color: #fff;
}
.mv-hero--light .mv-hero__cta:hover {
  background: #fff;
  color: #1a1a1a;
}
.mv-hero--dark .mv-hero__cta {
  color: #1a1a1a;
  border-color: #1a1a1a;
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
