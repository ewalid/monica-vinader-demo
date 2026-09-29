<script setup>
import {
  pickBreakpointField,
  useViewportBreakpoint,
} from '~/composables/useViewportBreakpoint';

const props = defineProps({ blok: Object });
const breakpoint = useViewportBreakpoint();

const cards = computed(() => {
  const list = pickBreakpointField(props.blok, 'cards', breakpoint.value);
  return Array.isArray(list) ? list : [];
});
</script>

<template>
  <section v-editable="blok" class="mv-three-cards">
    <div class="mv-three-cards__grid">
      <StoryblokComponent
        v-for="card in cards"
        :key="card._uid"
        :blok="card"
      />
    </div>
  </section>
</template>

<style scoped>
.mv-three-cards {
  position: relative;
  z-index: 1;
  background: #fff;
  padding: 60px 28px;
}
.mv-three-cards__grid {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 1023px) {
  .mv-three-cards__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .mv-three-cards__grid { grid-template-columns: 1fr; gap: 32px; }
  .mv-three-cards { padding: 40px 20px; }
}
</style>
