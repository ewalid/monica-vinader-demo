<script setup>
defineProps({ blok: Object });
</script>

<template>
  <div v-editable="blok">
    <StoryblokComponent
      v-for="childBlok in blok.content"
      :key="childBlok._uid"
      :blok="childBlok"
    />
  </div>
</template>
