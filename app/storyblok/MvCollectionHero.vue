<script setup>
defineProps({ blok: Object });
</script>

<template>
  <section v-editable="blok" class="mv-coll-hero">
    <img
      v-if="blok.image?.filename"
      :src="blok.image.filename + '/m/1920x600'"
      :alt="blok.title"
      class="mv-coll-hero__bg"
    />
    <div class="mv-coll-hero__overlay">
      <h1 class="mv-coll-hero__title">{{ blok.title }}</h1>
      <p v-if="blok.description" class="mv-coll-hero__desc">{{ blok.description }}</p>
      <p v-if="blok.product_count" class="mv-coll-hero__count">{{ blok.product_count }}</p>
    </div>
  </section>
</template>

<style scoped>
.mv-coll-hero {
  position: relative;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  background: #f5f3ef;
}
.mv-coll-hero__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mv-coll-hero__overlay {
  position: relative;
  z-index: 1;
  padding: 48px 24px;
  color: #fff;
}
.mv-coll-hero__title {
  font-family: var(--font-family-display, serif);
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 300;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.mv-coll-hero__desc {
  font-size: 15px;
  max-width: 560px;
  margin: 0 auto 8px;
  opacity: 0.9;
  line-height: 1.5;
}
.mv-coll-hero__count {
  font-size: 13px;
  opacity: 0.7;
  letter-spacing: 0.04em;
}
</style>
