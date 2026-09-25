<script setup>
defineProps({ blok: Object });

const parallaxY = ref(0);
const heroRef = ref(null);

if (import.meta.client) {
  const onScroll = () => {
    if (!heroRef.value) return;
    const rect = heroRef.value.getBoundingClientRect();
    const progress = -rect.top / (rect.height + window.innerHeight);
    parallaxY.value = Math.round(progress * 120);
  };
  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
  onUnmounted(() => window.removeEventListener('scroll', onScroll));
}
</script>

<template>
  <section
    ref="heroRef"
    v-editable="blok"
    class="mv-dark-hero"
  >
    <picture v-if="blok.image?.filename || blok.image_url" class="mv-dark-hero__bg">
      <img
        :src="blok.image?.filename ? blok.image.filename + '/m/1920x0' : blok.image_url"
        :alt="blok.headline || ''"
        class="mv-dark-hero__bg-img"
        loading="eager"
        :style="{ transform: `translate3d(0, ${parallaxY}px, 0) scale(1.15)` }"
      />
    </picture>
    <div v-else class="mv-dark-hero__bg mv-dark-hero__bg--gradient" />
    <div class="mv-dark-hero__content mv-dark-hero__content--animate">
      <h1 v-if="blok.headline" class="mv-dark-hero__headline">{{ blok.headline }}</h1>
      <a
        v-if="blok.cta_text && blok.cta_link?.cached_url"
        :href="'/' + blok.cta_link.cached_url"
        class="mv-dark-hero__cta"
      >
        {{ blok.cta_text }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.mv-dark-hero {
  position: relative;
  min-height: calc(100vh - 92px);
  display: flex;
  align-items: flex-end;
  background: #0a0a0a;
  overflow: hidden;
}
.mv-dark-hero__bg {
  position: absolute;
  inset: -60px 0;
}
.mv-dark-hero__bg--gradient {
  background: radial-gradient(ellipse at center, #1a1a1a 0%, #050505 100%);
}
.mv-dark-hero__bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
  will-change: transform;
}
.mv-dark-hero__content {
  position: relative;
  z-index: 1;
  padding: 80px 40px;
  max-width: 700px;
}
.mv-dark-hero__content--animate {
  animation: heroReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}
@keyframes heroReveal {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.mv-dark-hero__headline {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 300;
  line-height: 1.1;
  color: #fff;
  margin-bottom: 24px;
}
.mv-dark-hero__cta {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #fff;
  text-decoration: none;
  border-bottom: 1px solid #fff;
  padding-bottom: 4px;
  transition: opacity 0.3s;
}
.mv-dark-hero__cta:hover { opacity: 0.7; }
@media (max-width: 768px) {
  .mv-dark-hero { min-height: 70vh; }
  .mv-dark-hero__content { padding: 60px 20px; }
}
</style>
