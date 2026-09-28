<script setup>
const props = defineProps({ blok: Object });

const index = ref(0);
let timer;

const messages = computed(() => (props.blok?.messages || []).filter(Boolean));
const current = computed(() => messages.value[index.value] || null);

const bg = computed(() => {
  const map = {
    black: '#0e3d3d',
    gold: 'var(--mv-brand-gold, #c4a265)',
    white: '#ffffff',
    cream: 'var(--mv-brand-cream, #faf8f5)',
  };
  return map[props.blok?.background_color] || map.black;
});

const lightText = computed(() => {
  const c = props.blok?.background_color;
  return c !== 'white' && c !== 'cream';
});

function startRotate() {
  stopRotate();
  if (!props.blok?.auto_rotate || messages.value.length < 2) { return; }
  timer = setInterval(() => {
    index.value = (index.value + 1) % messages.value.length;
  }, 5000);
}

function stopRotate() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

watch(messages, () => {
  index.value = 0;
  startRotate();
}, { deep: true });

onMounted(startRotate);
onBeforeUnmount(stopRotate);
</script>

<template>
  <div
    v-if="messages.length"
    v-editable="blok"
    class="mv-announce"
    :class="{ 'mv-announce--light': !lightText }"
    :style="{ background: bg }"
  >
    <StoryblokComponent v-if="current" :blok="current" />
  </div>
</template>

<style scoped>
.mv-announce {
  color: #fff;
  text-align: center;
  padding: 7px 16px;
  font-size: 13px;
  font-family: var(--font-family-body, sans-serif);
  letter-spacing: 0.01em;
  line-height: 1.3;
}
.mv-announce--light {
  color: #1a1a1a;
}
</style>
