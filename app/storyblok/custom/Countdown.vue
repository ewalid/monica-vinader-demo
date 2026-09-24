<script setup>
/**
 * Campaign countdown timer. The editor sets an end date/time and a label;
 * the front end shows a live ticking display. Change the date in the Visual
 * Editor and the countdown reflects it instantly — a clean demo of editor-
 * controlled dynamic content.
 *
 * Storyblok schema (expected fields on the Countdown component):
 *   - end_date         : datetime — target date/time
 *   - label            : text — heading above the countdown
 *   - expired_text     : text — shown when the countdown reaches zero
 *   - accent_color     : option (color token from datasource, default primary-highlight)
 *   - background_color : option (color token from datasource)
 *   - dark_mode        : boolean — light text for dark backgrounds
 */
const props = defineProps({ blok: { type: Object, required: true } });

const end = computed(() => {
  const raw = props.blok.end_date;
  if (!raw) {
    return null;
  }
  const d = new Date(raw.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
});

const now = ref(Date.now());
let timer = null;
onMounted(() => {
  now.value = Date.now();
  timer = setInterval(() => (now.value = Date.now()), 1000);
});
onBeforeUnmount(() => timer && clearInterval(timer));

const parts = computed(() => {
  if (!end.value) {
    return null;
  }
  let diff = Math.floor((end.value.getTime() - now.value) / 1000);
  if (diff <= 0) {
    return { done: true };
  }
  const days = Math.floor(diff / 86400);
  diff -= days * 86400;
  const hours = Math.floor(diff / 3600);
  diff -= hours * 3600;
  const mins = Math.floor(diff / 60);
  const secs = diff - mins * 60;
  const pad = n => String(n).padStart(2, '0');
  return {
    done: false,
    cells: [
      { v: String(days), l: days === 1 ? 'day' : 'days' },
      { v: pad(hours), l: 'hrs' },
      { v: pad(mins), l: 'min' },
      { v: pad(secs), l: 'sec' },
    ],
  };
});

const accent = computed(() => getColorVar(props.blok.accent_color || 'primary-highlight'));
</script>

<template>
  <section
    v-editable="blok"
    class="cd page-section"
    :style="{ '--sb-bg': getColorVar(blok.background_color), '--cd-accent': accent }"
    :class="{ 'cd--dark': blok.dark_mode }"
  >
    <div class="cd__inner container">
      <p v-if="blok.label" class="cd__label">
        {{ blok.label }}
      </p>
      <div v-if="parts && !parts.done" class="cd__grid">
        <div v-for="(c, i) in parts.cells" :key="i" class="cd__cell">
          <span class="cd__num">{{ c.v }}</span>
          <span class="cd__unit">{{ c.l }}</span>
        </div>
      </div>
      <p v-else-if="parts && parts.done" class="cd__done">
        {{ blok.expired_text || 'Offer ended' }}
      </p>
    </div>
  </section>
</template>

<style scoped>
@reference "~/assets/css/tailwind.css";

.cd {
  background-color: var(--sb-bg, #fff);
  color: var(--primary-dark, #1a1a2e);
}
.cd--dark {
  color: #fff;
}
.cd__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}
.cd__label {
  font-family: var(--font-family-display, inherit);
  font-weight: 800;
  font-size: clamp(18px, 2.2vw, 26px);
  margin: 0;
}
.cd__grid {
  display: flex;
  gap: clamp(10px, 2vw, 20px);
}
.cd__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 72px;
  padding: 14px 10px;
  border-radius: var(--rounded_lg, 10px);
  background: var(--cd-accent, var(--primary-highlight, #333));
  color: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14);
}
.cd__num {
  font-family: var(--font-family-display, inherit);
  font-weight: 800;
  font-size: clamp(26px, 4vw, 40px);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.cd__unit {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.9;
}
.cd__done {
  font-weight: 700;
  font-size: 20px;
}
</style>
