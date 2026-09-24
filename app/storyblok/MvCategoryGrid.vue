<script setup>
const props = defineProps({ blok: Object });
const track = ref(null);

function scrollTrack(dir) {
  if (!track.value) return;
  const card = track.value.querySelector('.mv-catcard');
  const w = card ? card.offsetWidth + 20 : 260;
  track.value.scrollBy({ left: dir * w * 2, behavior: 'smooth' });
}
</script>

<template>
  <section v-editable="blok" class="mv-catgrid page-section">
    <div class="mv-catgrid__container">
      <div class="mv-catgrid__header">
        <h2 class="mv-catgrid__headline">{{ blok.headline || 'SHOP BY CATEGORY' }}</h2>
        <div class="mv-catgrid__arrows">
          <button class="mv-catgrid__arrow" aria-label="Previous" @click="scrollTrack(-1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5m0 0 5-5m-5 5 5 5"/></svg>
          </button>
          <button class="mv-catgrid__arrow" aria-label="Next" @click="scrollTrack(1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14m0 0-5-5m5 5-5 5"/></svg>
          </button>
        </div>
      </div>

      <div ref="track" class="mv-catgrid__track">
        <StoryblokComponent
          v-for="card in (blok.cards || [])"
          :key="card._uid"
          :blok="card"
        />
      </div>

      <a v-if="blok.shop_all_link" :href="blok.shop_all_link.cached_url || '#'" class="mv-catgrid__shop-all">
        SHOP ALL <span class="mv-catgrid__shop-arrow">&rarr;</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.mv-catgrid { background: #fff; }
.mv-catgrid__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px;
}

.mv-catgrid__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.mv-catgrid__headline {
  font-family: var(--font-family-body, sans-serif);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a1a1a;
}
.mv-catgrid__arrows {
  display: flex;
  gap: 8px;
}
.mv-catgrid__arrow {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  color: #1a1a1a;
  padding: 0;
  transition: opacity 0.2s;
}
.mv-catgrid__arrow:hover { opacity: 0.5; }
.mv-catgrid__arrow svg { width: 20px; height: 20px; }

.mv-catgrid__track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.mv-catgrid__track::-webkit-scrollbar { display: none; }

.mv-catgrid__shop-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
  padding: 10px 24px;
  border: 1px solid #1a1a1a;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: #1a1a1a;
  font-family: var(--font-family-body, sans-serif);
  transition: all 0.25s;
}
.mv-catgrid__shop-all:hover {
  background: #1a1a1a;
  color: #fff;
}
.mv-catgrid__shop-arrow { font-size: 14px; }
</style>
