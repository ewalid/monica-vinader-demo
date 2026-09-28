<script setup>
defineProps({
  logo: Object,
  nav: Object,
  buttons: Object,
  light: Boolean,
  enableCart: Boolean,
  announcement: { type: Object, default: null },
  searchPlaceholder: { type: String, default: 'Search for a product or finish' },
});

defineEmits(['toggleMobileNav']);

const scrolled = ref(false);
const { query } = useRoute();
const inEditor = computed(() => !!query._storyblok);

// Set by a full-height hero that asks for a transparent nav over itself.
const heroHeader = useState('mv-hero-header', () => null);
const overHero = computed(() => !!heroHeader.value?.transparent && !scrolled.value);
const overHeroLight = computed(() => overHero.value && heroHeader.value?.tone === 'light');

onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 10; };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
});

function getNavUrl(item) {
  const link = item.link;
  if (!link) { return '#'; }
  if (link.linktype === 'story') {
    const slug = link.story?.full_slug || link.cached_url || '';
    return slug.startsWith('/') ? slug : `/${slug}`;
  }
  if (link.url) { return link.url; }
  const cached = link.cached_url || '';
  return cached.startsWith('/') ? cached : `/${cached}`;
}
</script>

<template>
  <div
    class="mv-hdr-wrap"
    :class="{
      'mv-hdr-wrap--over-hero': overHero,
      'mv-hdr-wrap--over-hero-light': overHeroLight,
      'mv-hdr-wrap--scrolled': scrolled,
    }"
  >
    <StoryblokComponent
      v-if="announcement?.component"
      :blok="announcement"
    />
    <div
      v-else
      class="mv-announce mv-announce--fallback"
    >
      <span>Up to 25% Off Everything | <u>Online Only</u></span>
    </div>

    <header class="mv-hdr">
      <div class="mv-hdr__inner">
        <NuxtLink
          :to="inEditor ? '' : '/'"
          class="mv-hdr__logo"
          aria-label="Monica Vinader Home"
        >
          MONICA VINADER
        </NuxtLink>

        <nav class="mv-hdr__nav">
          <NuxtLink
            v-for="item in nav"
            :key="item._uid"
            v-editable="item"
            :to="inEditor ? '' : getNavUrl(item)"
            class="mv-hdr__link"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="mv-hdr__actions">
          <div class="mv-hdr__search" role="search">
            <span class="mv-hdr__search-placeholder">{{ searchPlaceholder }}</span>
            <svg class="mv-hdr__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
          </div>

          <button class="mv-hdr__icon" aria-label="Wishlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>

          <button class="mv-hdr__icon" aria-label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>

          <div v-if="enableCart" class="mv-hdr__cart">
            <EcommerceHeaderCart :light="overHeroLight" />
          </div>
          <button v-else class="mv-hdr__icon" aria-label="Shopping bag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>

        <button
          class="mv-hdr__burger"
          aria-label="Open menu"
          @click="$emit('toggleMobileNav')"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  </div>
</template>

<style scoped>
.mv-hdr-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.mv-announce--fallback {
  background: #0e3d3d;
  color: #fff;
  text-align: center;
  padding: 7px 16px;
  font-size: 13px;
  font-family: var(--font-family-body, sans-serif);
  letter-spacing: 0.01em;
  line-height: 1.3;
}
.mv-announce--fallback u {
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  cursor: pointer;
}

.mv-hdr {
  background: #fff;
  border-bottom: 1px solid #eaeaea;
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s, color 0.3s;
}
.mv-hdr-wrap--scrolled .mv-hdr {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

/* Transparent over a full-bleed home hero — solid again once sticky/scrolled. */
.mv-hdr-wrap--over-hero .mv-hdr {
  background: transparent;
  border-bottom-color: transparent;
  box-shadow: none;
}
.mv-hdr-wrap--over-hero-light .mv-hdr {
  color: #fff;
}
.mv-hdr-wrap--over-hero-light .mv-hdr__logo,
.mv-hdr-wrap--over-hero-light .mv-hdr__link,
.mv-hdr-wrap--over-hero-light .mv-hdr__icon,
.mv-hdr-wrap--over-hero-light .mv-hdr__search-icon {
  color: #fff;
}
.mv-hdr-wrap--over-hero-light .mv-hdr__search {
  background: rgba(255, 255, 255, 0.18);
}
.mv-hdr-wrap--over-hero-light .mv-hdr__search-placeholder {
  color: rgba(255, 255, 255, 0.75);
}
.mv-hdr-wrap--over-hero-light .mv-hdr__burger span {
  background: #fff;
}

.mv-hdr__inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  align-items: center;
  height: 56px;
}

.mv-hdr__logo {
  font-family: var(--font-family-body, sans-serif);
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #1a1a1a;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  margin-right: 28px;
  transition: color 0.3s;
}

.mv-hdr__nav {
  display: flex;
  align-items: center;
  gap: 22px;
}
.mv-hdr__link {
  font-size: 13px;
  font-weight: 400;
  color: #1a1a1a;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.2s, color 0.3s;
  font-family: var(--font-family-body, sans-serif);
}
.mv-hdr__link:hover { opacity: 0.55; }

.mv-hdr__actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
}

.mv-hdr__search {
  display: flex;
  align-items: center;
  background: #f5f3ef;
  border-radius: 24px;
  padding: 7px 14px 7px 16px;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.mv-hdr__search:hover { background: #ece8e0; }
.mv-hdr-wrap--over-hero-light .mv-hdr__search:hover {
  background: rgba(255, 255, 255, 0.28);
}
.mv-hdr__search-placeholder {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  font-family: var(--font-family-body, sans-serif);
}
.mv-hdr__search-icon {
  width: 16px;
  height: 16px;
  color: #1a1a1a;
  flex-shrink: 0;
  transition: color 0.3s;
}

.mv-hdr__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #1a1a1a;
  padding: 2px;
  transition: color 0.3s;
}
.mv-hdr__icon svg {
  width: 22px;
  height: 22px;
}

.mv-hdr__cart {
  display: flex;
  align-items: center;
}

.mv-hdr__burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 26px;
  height: 26px;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
  padding: 0;
}
.mv-hdr__burger span {
  display: block;
  height: 1.5px;
  background: #1a1a1a;
  border-radius: 1px;
  transition: background 0.3s;
}

@media (max-width: 1200px) {
  .mv-hdr__search-placeholder { display: none; }
  .mv-hdr__search { padding: 7px 10px; }
}
@media (max-width: 768px) {
  .mv-hdr__nav { display: none; }
  .mv-hdr__search { display: none; }
  .mv-hdr__actions { gap: 10px; }
  .mv-hdr__burger { display: flex; }
}
</style>
