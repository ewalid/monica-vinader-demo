<script setup>
const props = defineProps({ blok: Object, uuid: String });

const forceRtl = useState('forceRtl', () => false);
watch(
  () => props.blok?.force_rtl,
  (value) => { forceRtl.value = Boolean(value); },
  { immediate: true },
);
onBeforeUnmount(() => { forceRtl.value = false; });
</script>

<template>
  <div v-editable="blok">
    <ComponentCheck
      v-for="(currentBlok, index) in blok.body"
      :key="currentBlok._uid"
      :blok="currentBlok"
      :index="index"
    />
  </div>
</template>
