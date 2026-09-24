<script setup>
const props = defineProps({ blok: Object });
</script>

<template>
  <section v-editable="blok" class="mv-trust">
    <div class="mv-trust__container">
      <div class="mv-trust__grid">
        <StoryblokComponent
          v-for="item in (blok.items || [])"
          :key="item._uid"
          :blok="item"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-trust {
  background: #f5f3ef;
  padding: 20px 0;
  border-top: 1px solid #e8e4dc;
  border-bottom: 1px solid #e8e4dc;
}
.mv-trust__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px;
}
.mv-trust__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  text-align: center;
}
</style>
