<script setup>
defineProps({ blok: Object, uuid: String });

const sections = [
  { key: 'CategoryCarousel' },
  { key: 'GiftQuizz' },
  { key: 'InspirationGrid' },
  { key: 'body' },
];
</script>

<template>
  <div v-editable="blok" class="guide-page">
    <template v-for="section in sections" :key="section.key">
      <ComponentCheck
        v-for="(currentBlok, index) in (blok[section.key] || [])"
        :key="currentBlok._uid"
        :blok="currentBlok"
        :index="index"
      />
    </template>
  </div>
</template>
