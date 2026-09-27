<script setup>
const props = defineProps({ blok: Object });

const paragraphs = computed(() => {
  const raw = String(props.blok?.text || '').trim();
  if (!raw) return [];
  if (raw.includes('<p')) return [raw];
  return raw.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean);
});
const html = computed(() => String(props.blok?.text || '').includes('<p'));
</script>

<template>
  <section
    v-editable="blok"
    class="mv-large-text"
    :class="{ 'mv-large-text--dark': blok.dark_bg }"
  >
    <div class="mv-large-text__container">
      <div v-if="html" class="mv-large-text__content" v-html="blok.text" />
      <p v-for="(paragraph, index) in paragraphs" v-else :key="index">{{ paragraph }}</p>
    </div>
  </section>
</template>

<style scoped>
.mv-large-text {
  position: relative;
  z-index: 1;
  background: #fff;
  color: #000;
  padding: 90px 40px;
}
.mv-large-text--dark {
  background: #1a1a1a;
  color: #fff;
}
.mv-large-text__container {
  max-width: none;
}
.mv-large-text__content :deep(p),
.mv-large-text__container > p {
  margin: 0 0 20px;
  font-family: "Libre Caslon Text", "Times New Roman", serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 50px;
  color: inherit;
}
.mv-large-text__container > p:last-child,
.mv-large-text__content :deep(p:last-child) {
  margin-bottom: 0;
}
@media (max-width: 768px) {
  .mv-large-text { padding: 48px 20px; }
  .mv-large-text__content :deep(p),
  .mv-large-text__container > p {
    font-size: 28px;
    line-height: 36px;
  }
}
</style>
