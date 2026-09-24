<script setup>
defineProps({ blok: Object });
</script>

<template>
  <section v-editable="blok" class="mv-dual-image">
    <div class="mv-dual-image__grid">
      <div class="mv-dual-image__item">
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
      <div class="mv-dual-image__item">
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
.mv-dual-image__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  aspect-ratio: 1;
}
@media (max-width: 640px) {
  .mv-dual-image__grid { grid-template-columns: 1fr; }
}
</style>
