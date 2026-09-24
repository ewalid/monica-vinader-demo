<script setup>
defineProps({ blok: Object });
</script>

<template>
  <div
    v-editable="blok"
    class="mv-announcement-bar"
    :class="`mv-announcement-bar--${blok.background_color || 'black'}`"
  >
    <div class="mv-announcement-bar__inner">
      <template v-for="(msg, i) in (blok.messages || [])" :key="msg._uid">
        <StoryblokComponent :blok="msg" />
        <span v-if="i < (blok.messages || []).length - 1" class="mv-announcement-bar__sep">|</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.mv-announcement-bar {
  width: 100%;
  padding: 10px 16px;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: var(--font-family-body, sans-serif);
  position: relative;
  z-index: 50;
}
.mv-announcement-bar--black {
  background: #1a1a1a;
  color: #fff;
}
.mv-announcement-bar--gold {
  background: #c4a265;
  color: #fff;
}
.mv-announcement-bar--white {
  background: #fff;
  color: #1a1a1a;
  border-bottom: 1px solid #e5e5e5;
}
.mv-announcement-bar__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.mv-announcement-bar__sep {
  opacity: 0.3;
}
</style>
