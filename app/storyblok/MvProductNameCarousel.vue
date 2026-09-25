<script setup>
defineProps({ blok: Object });

const scroller = ref(null);
const dragging = ref(false);
let startX = 0;
let startScroll = 0;

function mediaSrc(item) {
  return item?.image?.filename || item?.image_url || '';
}

function onPointerDown(event) {
  if (event.button !== 0 || !scroller.value) return;
  dragging.value = true;
  startX = event.clientX;
  startScroll = scroller.value.scrollLeft;
  scroller.value.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (!dragging.value || !scroller.value) return;
  scroller.value.scrollLeft = startScroll - (event.clientX - startX);
}

function onPointerUp() {
  dragging.value = false;
}

function onWheel(event) {
  if (!scroller.value) return;
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  scroller.value.scrollLeft += event.deltaY;
  event.preventDefault();
}

onMounted(() => {
  scroller.value?.addEventListener('wheel', onWheel, { passive: false });
});
onBeforeUnmount(() => {
  scroller.value?.removeEventListener('wheel', onWheel);
});
</script>

<template>
  <section v-editable="blok" class="mv-icon-strip">
    <div
      ref="scroller"
      class="mv-icon-strip__scroller"
      :class="{ 'mv-icon-strip__scroller--dragging': dragging }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <a
        v-for="(item, i) in blok.items"
        :key="item._uid || i"
        :href="item.link?.cached_url ? '/' + item.link.cached_url : undefined"
        class="mv-icon-strip__card"
        draggable="false"
      >
        <span class="mv-icon-strip__media">
          <img
            v-if="mediaSrc(item)"
            :src="mediaSrc(item)"
            :alt="item.label || ''"
            draggable="false"
          />
        </span>
        <span v-if="item.label" class="mv-icon-strip__label">{{ item.label }}</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.mv-icon-strip {
  background: #faf8f5;
  padding: 8px 0 48px;
}
.mv-icon-strip__scroller {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 0 28px 8px;
  cursor: grab;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.mv-icon-strip__scroller::-webkit-scrollbar { display: none; }
.mv-icon-strip__scroller--dragging {
  cursor: grabbing;
  user-select: none;
}
.mv-icon-strip__card {
  flex: 0 0 148px;
  text-decoration: none;
  color: inherit;
}
.mv-icon-strip__media {
  display: block;
  aspect-ratio: 1;
  background: #eceae6;
  overflow: hidden;
}
.mv-icon-strip__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
.mv-icon-strip__label {
  display: block;
  margin-top: 12px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.35;
  color: #1a1a1a;
}
@media (max-width: 768px) {
  .mv-icon-strip__card { flex-basis: 120px; }
  .mv-icon-strip__scroller { padding: 0 16px 8px; }
}
</style>
