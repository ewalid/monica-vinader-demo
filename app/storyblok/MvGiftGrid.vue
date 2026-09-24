<script setup>
defineProps({ blok: Object });
</script>

<template>
  <section v-editable="blok" class="mv-gift-grid">
    <div v-if="blok.headline" class="mv-gift-grid__header">
      <h1 class="mv-gift-grid__headline" v-html="blok.headline" />
    </div>
    <div class="mv-gift-grid__grid">
      <StoryblokComponent
        v-for="card in blok.cards"
        :key="card._uid"
        :blok="card"
      />
    </div>
  </section>
</template>

<style scoped>
.mv-gift-grid {
  background: #faf8f5;
  padding: 60px 0;
}
.mv-gift-grid__header {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px 40px;
}
.mv-gift-grid__headline {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 300;
  line-height: 1.2;
  color: #1a1a1a;
}
.mv-gift-grid__headline :deep(em) {
  font-style: italic;
}
.mv-gift-grid__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}
@media (max-width: 640px) {
  .mv-gift-grid__grid { grid-template-columns: 1fr; }
  .mv-gift-grid { padding: 40px 0; }
}
</style>
