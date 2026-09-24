<script setup>
const props = defineProps({ blok: Object });

const bgClass = computed(() => ({
  cream: 'mv-trust--cream',
  gold: 'mv-trust--gold',
  white: 'mv-trust--white',
}[props.blok.background_color] || 'mv-trust--cream'));
</script>

<template>
  <section v-editable="blok" class="mv-trust page-section" :class="bgClass">
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
  padding: 48px 0;
}
.mv-trust--cream { background: #f5f3ef; }
.mv-trust--gold { background: #c4a265; color: #fff; }
.mv-trust--white { background: #fff; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }

.mv-trust__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.mv-trust__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  text-align: center;
}
</style>
