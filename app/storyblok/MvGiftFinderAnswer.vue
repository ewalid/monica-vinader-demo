<script setup>
/**
 * Nestable answer option for Gift Finder quiz.
 * Maps to Constructor facet via facet_key + facet_value.
 * Set skip_filter=true for soft answers like "They don't mind".
 */
defineProps({ blok: Object });
</script>

<template>
  <div v-editable="blok" class="mv-gf-answer-stub" />
</template>
