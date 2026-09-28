<script setup>
import { iconAnchorId } from '~/utils/iconStrip';

const props = defineProps({ blok: Object });

const scroller = ref(null);
const dragging = ref(false);
const didDrag = ref(false);
const hoverByIndex = ref([]);
const anchorByIndex = ref([]);

const DRAG_THRESHOLD = 12;

let startX = 0;
let startScroll = 0;
let activePointerId = null;
let observer;

function mediaSrc(item) {
  return item?.image?.filename || item?.image_url || '';
}

function itemHoverSrc(item, index) {
  return (
    item?.hover_image?.filename
    || item?.hover_image_url
    || hoverByIndex.value[index]
    || ''
  );
}

function normalizeAnchor(value) {
  return String(value || '').trim().replace(/^#/, '');
}

function itemAnchor(item, index) {
  const fromCms = normalizeAnchor(item?.scroll_to);
  if (fromCms) { return fromCms; }
  return (
    anchorByIndex.value[index]
    || iconAnchorId({ label: item?.label, uid: item?._uid })
    || ''
  );
}

function resolveTarget(item, index) {
  if (!import.meta.client) { return null; }
  const anchor = itemAnchor(item, index);
  if (anchor) {
    const byId = document.getElementById(anchor);
    if (byId) { return byId; }
  }
  // Fall back to the Nth showcase on the page — same order as the strip.
  return document.querySelectorAll('.mv-icon-showcase')[index] || null;
}

function itemHref(item, index) {
  const anchor = itemAnchor(item, index);
  if (anchor) { return `#${anchor}`; }
  const cached = item?.link?.cached_url;
  if (cached) { return `/${String(cached).replace(/^\//, '')}`; }
  const url = item?.link?.url;
  return url || undefined;
}

function syncFromShowcases() {
  if (!import.meta.client) { return; }
  const nodes = [...document.querySelectorAll('.mv-icon-showcase')];
  hoverByIndex.value = nodes.map(node => node.getAttribute('data-icon-hover') || '');
  anchorByIndex.value = nodes.map(node => (
    node.getAttribute('data-icon-anchor') || node.id || ''
  ));
}

function scrollToItem(item, index) {
  const target = resolveTarget(item, index);
  if (!target) { return false; }
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const id = target.id || itemAnchor(item, index);
  if (id) {
    history.replaceState(null, '', `#${id}`);
  }
  return true;
}

function onPointerDown(event) {
  if (event.button !== 0 || !scroller.value) { return; }
  dragging.value = true;
  didDrag.value = false;
  activePointerId = event.pointerId;
  startX = event.clientX;
  startScroll = scroller.value.scrollLeft;
  // Do NOT capture yet — capturing on every press swallows real clicks.
}

function onPointerMove(event) {
  if (!dragging.value || !scroller.value) { return; }
  if (activePointerId != null && event.pointerId !== activePointerId) { return; }
  const delta = event.clientX - startX;
  if (!didDrag.value && Math.abs(delta) >= DRAG_THRESHOLD) {
    didDrag.value = true;
    try {
      scroller.value.setPointerCapture(event.pointerId);
    }
    catch {
      // Older browsers / lost pointer — ignore.
    }
  }
  if (!didDrag.value) { return; }
  scroller.value.scrollLeft = startScroll - delta;
}

function onPointerUp(event) {
  if (activePointerId != null && event.pointerId !== activePointerId) { return; }
  dragging.value = false;
  activePointerId = null;
}

function onWheel(event) {
  if (!scroller.value) { return; }
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) { return; }
  scroller.value.scrollLeft += event.deltaY;
  event.preventDefault();
}

function onCardClick(event, item, index) {
  if (didDrag.value) {
    event.preventDefault();
    didDrag.value = false;
    return;
  }
  if (scrollToItem(item, index)) {
    event.preventDefault();
  }
}

onMounted(() => {
  scroller.value?.addEventListener('wheel', onWheel, { passive: false });
  syncFromShowcases();
  observer = new MutationObserver(syncFromShowcases);
  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-icon-hover', 'data-icon-anchor', 'id'],
    childList: true,
  });
});

onBeforeUnmount(() => {
  scroller.value?.removeEventListener('wheel', onWheel);
  observer?.disconnect();
});
</script>

<template>
  <section v-editable="blok" class="mv-icon-strip">
    <div
      ref="scroller"
      class="mv-icon-strip__scroller"
      :class="{ 'mv-icon-strip__scroller--dragging': dragging && didDrag }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <a
        v-for="(item, i) in blok.items"
        :key="item._uid || i"
        :href="itemHref(item, i)"
        class="mv-icon-strip__card"
        :class="{ 'mv-icon-strip__card--has-hover': !!itemHoverSrc(item, i) }"
        draggable="false"
        @click="onCardClick($event, item, i)"
      >
        <span class="mv-icon-strip__media">
          <img
            v-if="mediaSrc(item)"
            class="mv-icon-strip__img mv-icon-strip__img--default"
            :src="mediaSrc(item)"
            :alt="item.label || ''"
            draggable="false"
          />
          <img
            v-if="itemHoverSrc(item, i)"
            class="mv-icon-strip__img mv-icon-strip__img--hover"
            :src="itemHoverSrc(item, i)"
            alt=""
            aria-hidden="true"
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
  touch-action: pan-y;
}
.mv-icon-strip__scroller::-webkit-scrollbar { display: none; }
.mv-icon-strip__scroller--dragging {
  cursor: grabbing;
  user-select: none;
}
.mv-icon-strip__card {
  flex: 0 0 clamp(148px, 13vw, 240px);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
.mv-icon-strip__media {
  display: block;
  position: relative;
  aspect-ratio: 1;
  background: #eceae6;
  overflow: hidden;
}
.mv-icon-strip__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  transition: opacity 0.35s ease;
}
.mv-icon-strip__img--default {
  object-fit: contain;
  opacity: 1;
}
.mv-icon-strip__img--hover {
  opacity: 0;
}
.mv-icon-strip__card--has-hover:hover .mv-icon-strip__img--default,
.mv-icon-strip__card--has-hover:focus-visible .mv-icon-strip__img--default {
  opacity: 0;
}
.mv-icon-strip__card--has-hover:hover .mv-icon-strip__img--hover,
.mv-icon-strip__card--has-hover:focus-visible .mv-icon-strip__img--hover {
  opacity: 1;
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
@media (hover: none) {
  .mv-icon-strip__card--has-hover:hover .mv-icon-strip__img--default { opacity: 1; }
  .mv-icon-strip__card--has-hover:hover .mv-icon-strip__img--hover { opacity: 0; }
}
</style>
