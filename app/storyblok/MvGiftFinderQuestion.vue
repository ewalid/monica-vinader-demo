<script setup>
/** Nestable question for Gift Finder quiz. */
defineProps({ blok: Object });
</script>

<template>
  <div v-editable="blok" class="mv-gf-question-stub" />
</template>
