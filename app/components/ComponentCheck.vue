<script setup>
defineProps({ blok: Object, index: Number });
const componentExists = component =>
  typeof resolveComponent(component) !== 'string';

const visibilityClass = computed(() => {
  const classes = [];
  if (arguments[0]?.blok?.hide_on_mobile) classes.push('mv-hide-mobile');
  if (arguments[0]?.blok?.hide_on_desktop) classes.push('mv-hide-desktop');
  return classes.join(' ');
});
</script>

<template>
  <div
    v-if="componentExists(blok.component)"
    :class="{ 'mv-hide-mobile': blok.hide_on_mobile, 'mv-hide-desktop': blok.hide_on_desktop }"
  >
    <StoryblokComponent
      :blok="blok"
      :index="index"
    />
  </div>
  <div v-else class="container flex justify-center">
    <div
      class="my-16 inline-flex items-center justify-center space-x-2 rounded-lg bg-primary-background p-8 text-xl text-primary-dark"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="size-12 shrink-0 text-yellow-600"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      Component named
      <span class="font-semibold">{{ blok.component }}&nbsp;</span>
      is not defined in your frontend framework yet.
    </div>
  </div>
</template>

<style>
@media (max-width: 768px) {
  .mv-hide-mobile { display: none !important; }
}
@media (min-width: 769px) {
  .mv-hide-desktop { display: none !important; }
}
</style>
