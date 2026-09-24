<script setup>
defineProps({ blok: Object });
</script>

<template>
  <span v-editable="blok">{{ blok.label }}</span>
</template>
