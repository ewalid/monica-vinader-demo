<script setup>
const props = defineProps({ blok: Object });

const bgClass = computed(() => ({
  white: 'mv-catgrid--white',
  cream: 'mv-catgrid--cream',
  light: 'mv-catgrid--light',
}[props.blok.background_color] || 'mv-catgrid--white'));

const colClass = computed(() => ({
  '3': 'mv-catgrid--cols-3',
  '4': 'mv-catgrid--cols-4',
  '5': 'mv-catgrid--cols-5',
}[props.blok.columns] || 'mv-catgrid--cols-4'));
</script>

<template>
  <section v-editable="blok" class="mv-catgrid page-section" :class="bgClass">
    <div class="mv-catgrid__container">
      <h2 v-if="blok.headline" class="mv-catgrid__headline">{{ blok.headline }}</h2>
      <p v-if="blok.subheadline" class="mv-catgrid__sub">{{ blok.subheadline }}</p>
      <div class="mv-catgrid__grid" :class="colClass">
        <StoryblokComponent
          v-for="card in (blok.cards || [])"
          :key="card._uid"
          :blok="card"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-catgrid__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.mv-catgrid--cream { background: #f5f3ef; }
.mv-catgrid--light { background: #fafafa; }
.mv-catgrid__headline {
  font-family: var(--font-family-display, serif);
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 300;
  text-align: center;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  color: #1a1a1a;
}
.mv-catgrid__sub {
  font-size: 15px;
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}
.mv-catgrid__headline + .mv-catgrid__grid {
  margin-top: 40px;
}
.mv-catgrid__grid {
  display: grid;
  gap: 24px;
}
.mv-catgrid--cols-3 { .mv-catgrid__grid { grid-template-columns: repeat(3, 1fr); } }
.mv-catgrid--cols-4 { .mv-catgrid__grid { grid-template-columns: repeat(4, 1fr); } }
.mv-catgrid--cols-5 { .mv-catgrid__grid { grid-template-columns: repeat(5, 1fr); } }
@media (max-width: 768px) {
  .mv-catgrid__grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px; }
}
</style>
