<script setup>
import { getBloomreachSegments, resolveBloomreachSegment } from '~/composables/ecommerce/bloomreach-mock';

const props = defineProps({ blok: Object });

const segments = getBloomreachSegments();
const activeSegment = ref(props.blok.default_segment || 'new-visitor');
const resolution = ref(null);
const showDebug = ref(true);

function selectSegment(key) {
  activeSegment.value = key;
  resolution.value = resolveBloomreachSegment(key);
}

onMounted(() => {
  resolution.value = resolveBloomreachSegment(activeSegment.value);
});

const visibleVariants = computed(() => {
  if (!props.blok.variants?.length) return [];
  const matchingVariant = props.blok.variants.find(
    v => v.segment === activeSegment.value
  );
  const defaultVariant = props.blok.variants.find(v => v.segment === 'default' || !v.segment);
  return matchingVariant ? [matchingVariant] : defaultVariant ? [defaultVariant] : [props.blok.variants[0]];
});
</script>

<template>
  <section v-editable="blok" class="mv-bloom">
    <!-- Debug overlay -->
    <div v-if="showDebug" class="mv-bloom__debug">
      <div class="mv-bloom__debug-header">
        <div class="mv-bloom__debug-brand">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#00B4D8" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="#00B4D8"/>
          </svg>
          <span>Bloomreach Engagement</span>
        </div>
        <button class="mv-bloom__debug-close" @click="showDebug = false">&times;</button>
      </div>

      <div class="mv-bloom__debug-segments">
        <button
          v-for="seg in segments"
          :key="seg.key"
          class="mv-bloom__debug-seg"
          :class="{ 'mv-bloom__debug-seg--active': activeSegment === seg.key }"
          @click="selectSegment(seg.key)"
        >
          <span class="mv-bloom__debug-seg-name">{{ seg.name }}</span>
          <span class="mv-bloom__debug-seg-size">{{ (seg.audience_size / 1000).toFixed(1) }}k users</span>
        </button>
      </div>

      <div v-if="resolution" class="mv-bloom__debug-meta">
        <div class="mv-bloom__debug-row">
          <span>Segment</span>
          <span>{{ resolution.segment.name }}</span>
        </div>
        <div class="mv-bloom__debug-row">
          <span>Resolution</span>
          <span>{{ resolution.resolution_layer }}</span>
        </div>
        <div class="mv-bloom__debug-row">
          <span>SDK</span>
          <span>v{{ resolution.sdk_version }}</span>
        </div>
        <div class="mv-bloom__debug-row">
          <span>Request ID</span>
          <span class="mv-bloom__debug-mono">{{ resolution.request_id }}</span>
        </div>
      </div>
    </div>

    <!-- Reopen debug button -->
    <button v-if="!showDebug" class="mv-bloom__debug-reopen" @click="showDebug = true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#00B4D8" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="#00B4D8"/>
      </svg>
      Bloomreach
    </button>

    <!-- Rendered content variant -->
    <div v-for="variant in visibleVariants" :key="variant._uid" class="mv-bloom__variant">
      <StoryblokComponent
        v-for="childBlok in variant.content"
        :key="childBlok._uid"
        :blok="childBlok"
      />
    </div>
  </section>
</template>

<style scoped>
.mv-bloom {
  position: relative;
}

/* Debug panel */
.mv-bloom__debug {
  position: relative;
  z-index: 10;
  margin: 0 28px 24px;
  max-width: 1384px;
  background: #0a1628;
  border: 1px solid #1a3050;
  border-radius: 8px;
  overflow: hidden;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
}
.mv-bloom__debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #0d1f3c;
  border-bottom: 1px solid #1a3050;
}
.mv-bloom__debug-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #00B4D8;
  letter-spacing: 0.04em;
}
.mv-bloom__debug-close {
  background: none;
  border: none;
  color: #556;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.mv-bloom__debug-close:hover { color: #fff; }

.mv-bloom__debug-segments {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.mv-bloom__debug-segments::-webkit-scrollbar { display: none; }
.mv-bloom__debug-seg {
  flex-shrink: 0;
  padding: 8px 14px;
  background: #12283e;
  border: 1px solid #1e3a56;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  transition: all 0.15s;
}
.mv-bloom__debug-seg:hover {
  border-color: #00B4D8;
}
.mv-bloom__debug-seg--active {
  border-color: #00B4D8;
  background: #0d2847;
  box-shadow: 0 0 0 1px #00B4D8;
}
.mv-bloom__debug-seg-name {
  font-size: 12px;
  font-weight: 500;
  color: #e0e6ed;
}
.mv-bloom__debug-seg-size {
  font-size: 10px;
  color: #5a7a94;
}

.mv-bloom__debug-meta {
  padding: 10px 16px 14px;
  border-top: 1px solid #1a3050;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.mv-bloom__debug-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mv-bloom__debug-row span:first-child {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4a6a84;
}
.mv-bloom__debug-row span:last-child {
  font-size: 12px;
  color: #c0d0e0;
}
.mv-bloom__debug-mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px !important;
}

/* Reopen button */
.mv-bloom__debug-reopen {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #0a1628;
  border: 1px solid #1a3050;
  border-radius: 6px;
  color: #00B4D8;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
}
.mv-bloom__debug-reopen:hover { border-color: #00B4D8; }

/* Variant wrapper */
.mv-bloom__variant {
  position: relative;
}
</style>
