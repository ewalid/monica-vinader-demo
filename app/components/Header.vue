<script setup>
defineProps({
  logo: Object,
  nav: Object,
  buttons: Object,
  light: Boolean,
  enableCart: Boolean,
});

defineEmits(['toggleMobileNav']);

const scrolled = ref(false);

const { query } = useRoute();
const inEditor = computed(() => !!query._storyblok);

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 10;
  });
});

function getNavUrl(item) {
  const link = item.link;
  if (!link) return '#';
  if (link.linktype === 'story') {
    const slug = link.story?.full_slug || link.cached_url || '';
    return slug.startsWith('/') ? slug : `/${slug}`;
  }
  if (link.url) return link.url;
  const cached = link.cached_url || '';
  return cached.startsWith('/') ? cached : `/${cached}`;
}
</script>

<template>
  <div class="mv-hdr-wrap">
    <div class="mv-announce">
      <span>Up to 25% Off Everything | <u>Online Only</u></span>
    </div>

    <header class="mv-hdr" :class="{ 'mv-hdr--scrolled': scrolled }">
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
            <span class="mv-hdr__search-placeholder">Search for a product or finish</span>
            <svg class="mv-hdr__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
          </div>

          <button class="mv-hdr__icon" aria-label="Wishlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>

          <button class="mv-hdr__icon" aria-label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>

          <div v-if="enableCart" class="mv-hdr__cart">
            <EcommerceHeaderCart :light="false" />
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

/* ── Announcement strip ── */
.mv-announce {
  background: #0e3d3d;
  color: #fff;
  text-align: center;
  padding: 7px 16px;
  font-size: 13px;
  font-family: var(--font-family-body, sans-serif);
  letter-spacing: 0.01em;
  line-height: 1.3;
}
.mv-announce u {
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  cursor: pointer;
}

/* ── Main header bar ── */
.mv-hdr {
  background: #fff;
  border-bottom: 1px solid #eaeaea;
  transition: box-shadow 0.3s;
}
.mv-hdr--scrolled {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}
.mv-hdr__inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  align-items: center;
  height: 56px;
}

/* ── Logo ── */
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
}

/* ── Nav ── */
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
  transition: opacity 0.2s;
  font-family: var(--font-family-body, sans-serif);
}
.mv-hdr__link:hover { opacity: 0.55; }

/* ── Right-side actions ── */
.mv-hdr__actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
}

/* Search pill */
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
}

/* Icon buttons */
.mv-hdr__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #1a1a1a;
  padding: 2px;
}
.mv-hdr__icon svg {
  width: 22px;
  height: 22px;
}

.mv-hdr__cart {
  display: flex;
  align-items: center;
}

/* ── Mobile hamburger ── */
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
