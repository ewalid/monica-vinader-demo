<script setup>
defineProps({ blok: Object });
</script>

<template>
  <section v-editable="blok" class="mv-three-cards">
    <div class="mv-three-cards__grid">
      <a
        v-for="card in blok.cards"
        :key="card._uid"
        :href="card.link?.cached_url ? '/' + card.link.cached_url : '#'"
        class="mv-three-cards__card"
      >
        <div class="mv-three-cards__img-wrap">
          <img
            v-if="card.image?.filename"
            :src="card.image.filename + '/m/600x600'"
            :alt="card.title || ''"
            class="mv-three-cards__img"
            loading="lazy"
          />
          <img
            v-else-if="card.image_url"
            :src="card.image_url"
            :alt="card.title || ''"
            class="mv-three-cards__img"
            loading="lazy"
          />
        </div>
        <span v-if="card.title" class="mv-three-cards__title">{{ card.title }}</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.mv-three-cards {
  background: #faf8f5;
  padding: 60px 28px;
}
.mv-three-cards__grid {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.mv-three-cards__card {
  text-decoration: none;
  display: block;
}
.mv-three-cards__img-wrap {
  overflow: hidden;
  aspect-ratio: 4/5;
  margin-bottom: 16px;
}
.mv-three-cards__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.mv-three-cards__card:hover .mv-three-cards__img {
  transform: scale(1.03);
}
.mv-three-cards__title {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1a1a1a;
  border-bottom: 1px solid #1a1a1a;
  padding-bottom: 4px;
}
@media (max-width: 768px) {
  .mv-three-cards__grid { grid-template-columns: 1fr; gap: 32px; }
  .mv-three-cards { padding: 40px 20px; }
}
</style>
