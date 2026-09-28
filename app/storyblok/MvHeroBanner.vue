<script setup>
import { mediaUrl, resolveMedia } from '~/utils/sirenMedia';

const props = defineProps({ blok: Object });
const route = useRoute();
const heroHeader = useState('mv-hero-header', () => null);

const desktopSrc = computed(() => mediaUrl(props.blok?.image));
const mobileSrc = computed(() => mediaUrl(props.blok?.mobile_image));
const hasMobile = computed(() => !!mobileSrc.value);

const textPosition = computed(() => {
  const raw = String(props.blok?.text_position || 'left');
  if (raw === 'left' || raw === 'center' || raw === 'right') {
    return `middle-${raw}`;
  }
  return raw;
});

const textColor = computed(() => props.blok?.text_color || 'light');

const BACKGROUNDS = {
  'champagne-light': '#f9f6f2',
  champagne: '#f7f2ec',
  cream: '#faf8f5',
  white: '#ffffff',
  dark: '#1a1a1a',
};
const background = computed(() => {
  const custom = String(props.blok?.background_custom || '').trim();
  if (props.blok?.background_color === 'custom' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(custom)) {
    return custom;
  }
  if (props.blok?.background_color && BACKGROUNDS[props.blok.background_color]) {
    return BACKGROUNDS[props.blok.background_color];
  }
  return '';
});

const desktopWidth = computed(() => (
  resolveMedia(desktopSrc.value).kind === 'image' ? 1920 : 0
));
const mobileWidth = computed(() => (
  resolveMedia(mobileSrc.value).kind === 'image' ? 750 : 0
));

const buttons = computed(() => (props.blok?.buttons || []).filter(b => b?.label));
const legacyCta = computed(() => {
  if (buttons.value.length) { return null; }
  if (!props.blok?.cta_text || !props.blok?.cta_link?.cached_url) { return null; }
  return {
    label: props.blok.cta_text,
    href: hrefFromLink(props.blok.cta_link),
    style: 'solid',
  };
});

const secondaryCta = computed(() => {
  if (buttons.value.length) { return null; }
  if (!props.blok?.cta_2_text || !props.blok?.cta_2_link?.cached_url) { return null; }
  return {
    label: props.blok.cta_2_text,
    href: hrefFromLink(props.blok.cta_2_link),
    style: props.blok?.cta_2_style || 'solid',
  };
});

function hrefFromLink(link) {
  if (!link) { return '#'; }
  if (link.linktype === 'url' && link.url) { return link.url; }
  const cached = link.cached_url || link.url || '';
  if (!cached) { return '#'; }
  if (/^https?:\/\//i.test(cached)) { return cached; }
  return `/${String(cached).replace(/^\//, '')}`;
}

function buttonHref(btn) {
  return hrefFromLink(btn?.link);
}

function buttonStyle(btn) {
  if (btn?.style === 'ghost') { return 'ghost'; }
  return 'solid';
}

function isRichText(value) {
  return value?.type === 'doc';
}

function headlinePlain(value) {
  if (!value) { return ''; }
  if (typeof value === 'string') { return value; }
  if (!isRichText(value)) { return ''; }
  const parts = [];
  const walk = (node) => {
    if (!node) { return; }
    if (node.type === 'text' && node.text) { parts.push(node.text); }
    if (node.type === 'hard_break') { parts.push(' '); }
    (node.content || []).forEach(walk);
  };
  walk(value);
  return parts.join('').replace(/\s+/g, ' ').trim();
}

const hasHeadline = computed(() => {
  const h = props.blok?.headline;
  if (!h) { return false; }
  if (typeof h === 'string') { return !!h.trim(); }
  return isRichText(h) && !!headlinePlain(h);
});

const headlineAlt = computed(() => headlinePlain(props.blok?.headline));

// Transparent header only on home, only while full-height hero is active, not after scroll.
const isHome = computed(() => {
  const slug = Array.isArray(route.params.slug) ? route.params.slug.filter(Boolean) : [];
  const path = String(route.query.path || '').split('/').filter(Boolean);
  const parts = slug.length ? slug : path;
  if (!parts.length) { return true; }
  return parts.length === 1 && ['home', 'uk', 'us', 'de', 'es', 'fr-be', 'ar'].includes(parts[0]);
});

const wantsTransparentHeader = computed(() => (
  !!props.blok?.full_height
  && !!props.blok?.transparent_header
  && isHome.value
));

watch(
  [wantsTransparentHeader, textColor],
  () => {
    if (wantsTransparentHeader.value) {
      heroHeader.value = {
        transparent: true,
        tone: textColor.value === 'light' || textColor.value === 'cream' ? 'light' : 'dark',
      };
    }
    else if (heroHeader.value) {
      heroHeader.value = null;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (heroHeader.value) { heroHeader.value = null; }
});
</script>

<template>
  <section
    v-editable="blok"
    class="mv-hero"
    :class="[
      `mv-hero--pos-${textPosition}`,
      `mv-hero--${textColor}`,
      {
        'mv-hero--full': blok.full_height,
        'mv-hero--has-mobile': hasMobile,
        'mv-hero--under-header': wantsTransparentHeader,
      },
    ]"
    :style="background ? { background } : undefined"
  >
    <div v-if="desktopSrc" class="mv-hero__media mv-hero__media--desktop">
      <MvMedia
        :src="desktopSrc"
        :alt="blok.image?.alt || headlineAlt || ''"
        :width="desktopWidth"
        class="mv-hero__asset"
      />
    </div>
    <div v-if="mobileSrc" class="mv-hero__media mv-hero__media--mobile">
      <MvMedia
        :src="mobileSrc"
        :alt="blok.mobile_image?.alt || headlineAlt || ''"
        :width="mobileWidth"
        class="mv-hero__asset"
      />
    </div>

    <div class="mv-hero__overlay">
      <div class="mv-hero__content">
        <div
          v-if="hasHeadline"
          class="mv-hero__headline"
          role="heading"
          aria-level="1"
        >
          <StoryblokRichText v-if="isRichText(blok.headline)" :document="blok.headline" />
          <template v-else>{{ blok.headline }}</template>
        </div>
        <p v-if="blok.subheadline" class="mv-hero__sub">{{ blok.subheadline }}</p>

        <div
          v-if="buttons.length || legacyCta || secondaryCta"
          class="mv-hero__actions"
        >
          <template v-if="buttons.length">
            <a
              v-for="btn in buttons"
              :key="btn._uid"
              v-editable="btn"
              :href="buttonHref(btn)"
              class="mv-hero__cta"
              :class="`mv-hero__cta--${buttonStyle(btn)}`"
            >
              {{ btn.label }}
            </a>
          </template>
          <template v-else>
            <a
              v-if="legacyCta"
              :href="legacyCta.href"
              class="mv-hero__cta"
              :class="`mv-hero__cta--${legacyCta.style}`"
            >
              {{ legacyCta.label }}
            </a>
            <a
              v-if="secondaryCta"
              :href="secondaryCta.href"
              class="mv-hero__cta"
              :class="`mv-hero__cta--${secondaryCta.style}`"
            >
              {{ secondaryCta.label }}
            </a>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-hero {
  position: relative;
  width: 100%;
  min-height: 560px;
  overflow: hidden;
  display: flex;
}
.mv-hero--full {
  min-height: calc(100vh - 92px);
}
/* Pull under the fixed header so media fills the first viewport like the live site. */
.mv-hero--full.mv-hero--under-header {
  min-height: 100vh;
  margin-top: -6rem; /* body pt-24 */
  padding-top: 6rem;
}

.mv-hero__media {
  position: absolute;
  inset: 0;
}
.mv-hero__media--mobile {
  display: none;
}
@media (max-width: 768px) {
  .mv-hero--has-mobile .mv-hero__media--desktop { display: none; }
  .mv-hero--has-mobile .mv-hero__media--mobile { display: block; }
}

.mv-hero__asset,
.mv-hero__media :deep(.mv-media) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.mv-hero__media :deep(.mv-media--embed) {
  border: 0;
  pointer-events: none;
}

.mv-hero__overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 72px clamp(28px, 5vw, 80px);
  display: flex;
  min-height: inherit;
  box-sizing: border-box;
}

.mv-hero__content {
  max-width: 560px;
}

.mv-hero--pos-top-left .mv-hero__overlay,
.mv-hero--pos-middle-left .mv-hero__overlay,
.mv-hero--pos-bottom-left .mv-hero__overlay {
  justify-content: flex-start;
  text-align: left;
}
.mv-hero--pos-top-center .mv-hero__overlay,
.mv-hero--pos-middle-center .mv-hero__overlay,
.mv-hero--pos-bottom-center .mv-hero__overlay {
  justify-content: center;
  text-align: center;
}
.mv-hero--pos-top-center .mv-hero__content,
.mv-hero--pos-middle-center .mv-hero__content,
.mv-hero--pos-bottom-center .mv-hero__content {
  max-width: 680px;
}
.mv-hero--pos-top-right .mv-hero__overlay,
.mv-hero--pos-middle-right .mv-hero__overlay,
.mv-hero--pos-bottom-right .mv-hero__overlay {
  justify-content: flex-end;
  text-align: right;
}

.mv-hero--pos-top-left .mv-hero__overlay,
.mv-hero--pos-top-center .mv-hero__overlay,
.mv-hero--pos-top-right .mv-hero__overlay {
  align-items: flex-start;
}
.mv-hero--pos-middle-left .mv-hero__overlay,
.mv-hero--pos-middle-center .mv-hero__overlay,
.mv-hero--pos-middle-right .mv-hero__overlay {
  align-items: center;
}
.mv-hero--pos-bottom-left .mv-hero__overlay,
.mv-hero--pos-bottom-center .mv-hero__overlay,
.mv-hero--pos-bottom-right .mv-hero__overlay {
  align-items: flex-end;
}

.mv-hero--pos-top-center .mv-hero__actions,
.mv-hero--pos-middle-center .mv-hero__actions,
.mv-hero--pos-bottom-center .mv-hero__actions {
  justify-content: center;
}
.mv-hero--pos-top-right .mv-hero__actions,
.mv-hero--pos-middle-right .mv-hero__actions,
.mv-hero--pos-bottom-right .mv-hero__actions {
  justify-content: flex-end;
}

.mv-hero--light { color: #fff; }
.mv-hero--dark { color: #1a1a1a; }
.mv-hero--gold { color: var(--mv-brand-gold, #c4a265); }
.mv-hero--cream { color: var(--mv-brand-cream, #faf8f5); }

.mv-hero__headline {
  font-family: var(--font-family-display, serif);
  font-size: clamp(32px, 4.2vw, 52px);
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: 0.01em;
  margin: 0 0 14px;
}
.mv-hero__headline :deep(p) {
  margin: 0;
}
.mv-hero__headline :deep(p + p) {
  margin-top: 0;
}
.mv-hero__headline :deep(br) {
  display: block;
  content: '';
}
.mv-hero__sub {
  font-size: clamp(15px, 1.4vw, 18px);
  font-weight: 400;
  line-height: 1.45;
  margin: 0 0 28px;
  opacity: 0.92;
}

.mv-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.mv-hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 148px;
  padding: 14px 28px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.mv-hero__cta--solid {
  background: #1a1a1a;
  color: #fff;
  border: 1px solid #1a1a1a;
}
.mv-hero__cta--solid:hover {
  background: #000;
  border-color: #000;
}
.mv-hero__cta--ghost {
  background: transparent;
  color: inherit;
  border: 1px solid currentColor;
}
.mv-hero__cta--ghost:hover {
  background: currentColor;
  color: #fff;
}
.mv-hero--light .mv-hero__cta--ghost:hover,
.mv-hero--cream .mv-hero__cta--ghost:hover {
  color: #1a1a1a;
}
.mv-hero--light .mv-hero__cta--solid,
.mv-hero--cream .mv-hero__cta--solid {
  background: #fff;
  color: #1a1a1a;
  border-color: #fff;
}
.mv-hero--light .mv-hero__cta--solid:hover,
.mv-hero--cream .mv-hero__cta--solid:hover {
  background: #f5f5f5;
  border-color: #f5f5f5;
}

@media (max-width: 768px) {
  .mv-hero { min-height: 440px; }
  .mv-hero--full.mv-hero--under-header {
    min-height: 100svh;
  }
  .mv-hero__overlay { padding: 48px 20px; }
  .mv-hero__cta { min-width: 0; flex: 1 1 auto; }
}
</style>
