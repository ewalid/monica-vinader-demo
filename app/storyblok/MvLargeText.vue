<script setup>
defineProps({ blok: Object });
</script>

<template>
  <section v-editable="blok" class="mv-large-text" :class="{ 'mv-large-text--dark': blok.dark_bg }">
    <div class="mv-large-text__container">
      <p class="mv-large-text__content" v-html="blok.text" />
    </div>
  </section>
</template>

<style scoped>
.mv-large-text {
  background: #faf8f5;
  padding: 80px 40px;
}
.mv-large-text--dark {
  background: #1a1a1a;
  color: #fff;
}
.mv-large-text__container {
  max-width: 800px;
  margin: 0 auto;
}
.mv-large-text__content {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(24px, 3.5vw, 36px);
  font-weight: 300;
  line-height: 1.35;
  color: inherit;
}
.mv-large-text__content :deep(em),
.mv-large-text__content :deep(i) {
  font-style: italic;
}
@media (max-width: 768px) {
  .mv-large-text { padding: 60px 20px; }
}
</style>
