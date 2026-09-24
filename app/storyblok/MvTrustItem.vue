<script setup>
defineProps({ blok: Object });
</script>

<template>
  <div v-editable="blok" class="mv-trust-item">
    <img
      v-if="blok.icon?.filename"
      :src="blok.icon.filename + '/m/40x40'"
      :alt="blok.headline"
      class="mv-trust-item__icon"
    />
    <h4 class="mv-trust-item__headline">{{ blok.headline }}</h4>
    <p v-if="blok.description" class="mv-trust-item__desc">{{ blok.description }}</p>
  </div>
</template>

<style scoped>
.mv-trust-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.mv-trust-item__icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-bottom: 4px;
}
.mv-trust-item__headline {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.mv-trust-item__desc {
  font-size: 12px;
  color: #888;
  line-height: 1.4;
}
</style>
