<script setup>
import { isStoryblokImage, resolveMedia } from '~/utils/sirenMedia';

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  // Resize width for Storyblok image-service URLs; ignored for anything else.
  width: { type: Number, default: 0 },
  lazy: { type: Boolean, default: false },
});

const media = computed(() => resolveMedia(props.src));
const imageFailed = ref(false);
watch(() => props.src, () => { imageFailed.value = false; });

const kind = computed(() => (
  media.value.kind === 'unknown' ? (imageFailed.value ? 'video' : 'image') : media.value.kind
));
const imageSrc = computed(() => (
  props.width && isStoryblokImage(media.value.src) ? `${media.value.src}/m/${props.width}x0` : media.value.src
));

function onImageError() {
  if (media.value.kind === 'unknown') { imageFailed.value = true; }
}

// A server-rendered <img> can fail before hydration attaches @error.
const imgEl = ref(null);
onMounted(() => {
  if (imgEl.value?.complete && !imgEl.value.naturalWidth) { onImageError(); }
});
</script>

<template>
  <iframe
    v-if="kind === 'embed'"
    :src="media.src"
    :title="alt || 'Video'"
    allow="autoplay; encrypted-media; picture-in-picture"
    allowfullscreen
    class="mv-media mv-media--embed"
  ></iframe>
  <video
    v-else-if="kind === 'video'"
    :src="media.src"
    :aria-label="alt || undefined"
    class="mv-media"
    autoplay
    muted
    loop
    playsinline
  ></video>
  <img
    v-else-if="kind === 'image'"
    ref="imgEl"
    :src="imageSrc"
    :alt="alt"
    :loading="lazy ? 'lazy' : undefined"
    class="mv-media"
    @error="onImageError"
  />
</template>

<style scoped>
.mv-media--embed {
  border: 0;
}
</style>
