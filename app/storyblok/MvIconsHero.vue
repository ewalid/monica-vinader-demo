<script setup>
defineProps({ blok: Object });
</script>

<template>
  <section v-editable="blok" class="mv-icons-hero">
    <div class="mv-icons-hero__container">
      <h1 class="mv-icons-hero__headline">{{ blok.headline || 'Seven Icons. A New Chapter.' }}</h1>
      <p v-if="blok.subheadline" class="mv-icons-hero__sub">{{ blok.subheadline }}</p>
    </div>
  </section>
</template>

<style scoped>
.mv-icons-hero {
  background: #faf8f5;
  padding: 80px 40px 60px;
  text-align: center;
}
.mv-icons-hero__container {
  max-width: 720px;
  margin: 0 auto;
}
.mv-icons-hero__headline {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 300;
  line-height: 1.1;
  color: #1a1a1a;
  letter-spacing: -0.01em;
  margin-bottom: 20px;
}
.mv-icons-hero__sub {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 300;
  font-style: italic;
  line-height: 1.5;
  color: #555;
  max-width: 560px;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .mv-icons-hero { padding: 60px 20px 40px; }
}
</style>
