<script setup>
defineProps({ blok: Object });
</script>

<template>
  <section v-editable="blok" class="mv-name-carousel">
    <div class="mv-name-carousel__track">
      <a
        v-for="(item, i) in blok.items"
        :key="item._uid || i"
        :href="item.link?.cached_url ? '/' + item.link.cached_url : '#'"
        class="mv-name-carousel__item"
        :class="{ 'mv-name-carousel__item--active': i === 0 }"
      >
        {{ item.label }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.mv-name-carousel {
  background: #faf8f5;
  padding: 20px 0 40px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mv-name-carousel::-webkit-scrollbar { display: none; }
.mv-name-carousel__track {
  display: flex;
  gap: 40px;
  padding: 0 40px;
  max-width: 1200px;
  margin: 0 auto;
  justify-content: center;
  flex-wrap: wrap;
}
.mv-name-carousel__item {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #999;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.3s;
  padding: 8px 0;
}
.mv-name-carousel__item:hover,
.mv-name-carousel__item--active {
  color: #1a1a1a;
  border-bottom: 1px solid #1a1a1a;
}
</style>
