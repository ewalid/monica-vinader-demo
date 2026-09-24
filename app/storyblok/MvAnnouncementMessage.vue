<script setup>
defineProps({ blok: Object });
</script>

<template>
  <span v-editable="blok" class="mv-announcement-msg">
    <span>{{ blok.text }}</span>
    <a
      v-if="blok.link?.cached_url && blok.link_text"
      :href="blok.link.cached_url"
      class="mv-announcement-msg__link"
    >
      {{ blok.link_text }}
    </a>
  </span>
</template>

<style scoped>
.mv-announcement-msg {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.mv-announcement-msg__link {
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.85;
  transition: opacity 0.2s;
}
.mv-announcement-msg__link:hover {
  opacity: 1;
}
</style>
