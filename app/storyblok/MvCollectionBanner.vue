<script setup>
defineProps({ blok: Object });
</script>

<template>
  <component
    :is="blok.link ? 'a' : 'section'"
    v-editable="blok"
    class="mv-collection-banner"
    :href="blok.link || undefined"
  >
    <div class="mv-collection-banner__inner">
      <h2 v-if="blok.headline" class="mv-collection-banner__headline">{{ blok.headline }}</h2>
      <p v-if="blok.subheadline" class="mv-collection-banner__sub">{{ blok.subheadline }}</p>
    </div>
  </component>
</template>

<style scoped>
.mv-collection-banner {
  display: block;
  background: #faf8f5;
  padding: 72px 28px;
  text-align: left;
  text-decoration: none;
  color: inherit;
  border-top: 1px solid #e6e6e6;
}
.mv-collection-banner__inner {
  max-width: 1480px;
  margin: 0 auto;
}
.mv-collection-banner__headline {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 300;
  line-height: 1.1;
  color: #1a1a1a;
  letter-spacing: -0.01em;
  margin: 0 0 16px;
}
.mv-collection-banner__sub {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 400;
  line-height: 1.5;
  color: #1a1a1a;
  margin: 0;
}
@media (max-width: 768px) {
  .mv-collection-banner { padding: 56px 20px; }
}
</style>
