<script setup>
defineProps({ blok: Object });
const { el: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });
</script>

<template>
  <section ref="sectionRef" v-editable="blok" class="mv-dual-image" :class="{ 'mv-dual-image--visible': isVisible }">
    <div class="mv-dual-image__grid">
      <div class="mv-dual-image__item mv-dual-image__item--left">
        <img
          v-if="blok.image_left?.filename"
          :src="blok.image_left.filename + '/m/960x0'"
          :alt="blok.image_left.alt || ''"
          class="mv-dual-image__img"
          loading="lazy"
        />
        <img
          v-else-if="blok.image_left_url"
          :src="blok.image_left_url"
          alt=""
          class="mv-dual-image__img"
          loading="lazy"
        />
      </div>
      <div class="mv-dual-image__item mv-dual-image__item--right">
        <img
          v-if="blok.image_right?.filename"
          :src="blok.image_right.filename + '/m/960x0'"
          :alt="blok.image_right.alt || ''"
          class="mv-dual-image__img"
          loading="lazy"
        />
        <img
          v-else-if="blok.image_right_url"
          :src="blok.image_right_url"
          alt=""
          class="mv-dual-image__img"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-dual-image__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}
.mv-dual-image__item {
  overflow: hidden;
}
.mv-dual-image__item--left,
.mv-dual-image__item--right {
  opacity: 0;
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.mv-dual-image__item--left {
  transform: translateX(-40px);
}
.mv-dual-image__item--right {
  transform: translateX(40px);
  transition-delay: 0.15s;
}
.mv-dual-image--visible .mv-dual-image__item--left,
.mv-dual-image--visible .mv-dual-image__item--right {
  opacity: 1;
  transform: translateX(0);
}
.mv-dual-image__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  aspect-ratio: 1;
  transition: transform 0.6s ease;
}
.mv-dual-image__item:hover .mv-dual-image__img {
  transform: scale(1.03);
}
@media (max-width: 640px) {
  .mv-dual-image__grid { grid-template-columns: 1fr; }
  .mv-dual-image__item--left { transform: translateY(30px); }
  .mv-dual-image__item--right { transform: translateY(30px); }
  .mv-dual-image--visible .mv-dual-image__item--left,
  .mv-dual-image--visible .mv-dual-image__item--right {
    transform: translateY(0);
  }
}
</style>
