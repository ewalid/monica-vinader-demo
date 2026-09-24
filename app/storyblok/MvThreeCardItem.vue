<script setup>
defineProps({ blok: Object });
</script>

<template>
  <span v-editable="blok">{{ blok.title }}</span>
</template>
