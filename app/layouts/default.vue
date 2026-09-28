<script setup>
const defaultFontFamilies = {
  '--font-family-display': '"Cormorant Garamond", Georgia, serif',
  '--font-family-body': '"Work Sans", -apple-system, sans-serif',
};

const defaultColors = {
  '--primary-highlight': '#c4a265',
  '--highlight-1': '#b8956a',
  '--highlight-2': '#8b7355',
  '--highlight-3': '#d4c5a0',
  '--primary-background': '#faf8f5',
  '--background-1': '#f5f3ef',
  '--background-2': '#ebe7df',
  '--background-3': '#fff9f0',
  '--background-4': '#f0ece4',
  '--background-5': '#e8e4dc',
  '--background-6': '#fdf6ee',
  '--background-7': '#f7f4ef',
  '--background-8': '#fff5eb',
  '--background-9': '#fef0e6',
  '--background-10': '#f5f0ea',
  '--primary-dark': '#1a1a1a',
};

const defaultBorderRadiuses = {
  '--rounded_sm': '4px',
  '--rounded_default': '6px',
  '--rounded_md': '8px',
  '--rounded_lg': '10px',
  '--rounded_xl': '15px',
  '--rounded_2xl': '20px',
  '--rounded_3xl': '25px',
  '--rounded_full': '9999px',
};

const siteConfig = await getSiteConfig();

await useDesignTokens();
const { dir } = useDirection();

const cssVariables = computed(() => {
  if (!siteConfig.value) {
    return {
      ...defaultFontFamilies,
      ...defaultColors,
      ...defaultBorderRadiuses,
    };
  }

  const theme = {
    ...defaultFontFamilies,
    ...defaultColors,
    ...defaultBorderRadiuses,
  };

  if (siteConfig.value.content.use_custom_fonts) {
    if (siteConfig.value.content.custom_font_display) {
      theme['--font-family-display']
        = siteConfig.value.content.custom_font_display;
    }
    if (siteConfig.value.content.custom_font_body) {
      theme['--font-family-body'] = siteConfig.value.content.custom_font_body;
    }
  }
  else {
    Object.assign(theme, defaultFontFamilies);
  }
  if (siteConfig.value.content.use_custom_colors) {
    theme['--primary-highlight'] = siteConfig.value.content.primary_highlight_color?.color;
    theme['--highlight-1'] = siteConfig.value.content.highlight_1_color?.color;
    theme['--highlight-2'] = siteConfig.value.content.highlight_2_color?.color;
    theme['--highlight-3'] = siteConfig.value.content.highlight_3_color?.color;
    theme['--primary-background'] = siteConfig.value.content.primary_background_color?.color;
    theme['--background-1'] = siteConfig.value.content.background_1_color?.color;
    theme['--background-2'] = siteConfig.value.content.background_2_color?.color;
    theme['--background-3'] = siteConfig.value.content.background_3_color?.color;
    theme['--background-4'] = siteConfig.value.content.background_4_color?.color;
    theme['--background-5'] = siteConfig.value.content.background_5_color?.color;
    theme['--background-6'] = siteConfig.value.content.background_6_color?.color;
    theme['--background-7'] = siteConfig.value.content.background_7_color?.color;
    theme['--background-8'] = siteConfig.value.content.background_8_color?.color;
    theme['--background-9'] = siteConfig.value.content.background_9_color?.color;
    theme['--background-10'] = siteConfig.value.content.background_10_color?.color;
    theme['--primary-dark'] = siteConfig.value.content.primary_dark_color?.color;
    if (siteConfig.value.content.colored_headlines) {
      theme['--headline-color'] = siteConfig.value.content.primary_highlight_color?.color;
    }
    else {
      theme['--headline-color'] = siteConfig.value.content.primary_dark_color?.color;
    }
  }
  else {
    // TODO: enable colored headlines without changing colors
    Object.assign(theme, defaultColors);
    if (siteConfig.value.content.colored_headlines) {
      theme['--headline-color'] = defaultColors['--primary'];
    }
    else {
      theme['--headline-color'] = defaultColors['--dark'];
    }
  }
  if (siteConfig.value.content.disable_rounded_corners) {
    for (const key in theme) {
      if (key.startsWith('--rounded_')) {
        theme[key] = 0;
      }
    }
  }
  else {
    Object.assign(theme, defaultBorderRadiuses);
  }
  const formattedVariables = Object.entries(theme)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');

  return `:root {\n${formattedVariables}\n}`;
});

const viewingSiteConfig = useState('viewingSiteConfig');
const { customParent } = useRuntimeConfig().public;

onMounted(() => {
  useStoryblokBridge(
    siteConfig.value.id,
    evStory => (siteConfig.value = evStory),
    {
      preventClicks: true,
      customParent,
    },
  );
});

const headConfig = computed(() => ({
  style: [
    cssVariables.value,
  ],
  htmlAttrs: {
    lang: 'en',
    dir: dir.value,
  },
}));

useHead(headConfig);

const mobileNavOpen = ref(false);

const route = useRoute();
const currentSection = computed(() =>
  route.params.slug?.[0] || route.query.path?.split('/')[0] || '',
);

/**
 * The layout persists across client-side navigation, so re-resolve the
 * site-config (theme + nav) whenever the top-level section changes. Reuses
 * getSiteConfig so the nearest-ancestor walk, language, and release handling
 * stay identical to the initial load.
 */
watch(currentSection, async () => {
  siteConfig.value = (await getSiteConfig()).value;
});

watch(route, () => {
  mobileNavOpen.value = false;
});
</script>

<template>
  <main>
    <Header
      :logo="siteConfig.content.header_logo"
      :nav="siteConfig.content.header_nav"
      :buttons="siteConfig.content.header_buttons"
      :light="siteConfig.content.header_light"
      :enable-cart="siteConfig.content.enable_cart"
      @toggle-mobile-nav="mobileNavOpen = !mobileNavOpen"
    />
    <MobileNav
      :mobile-nav="siteConfig.content.header_nav"
      :mobile-nav-open="mobileNavOpen"
      :enable-cart="siteConfig.content.enable_cart"
    />
    <div
      v-if="viewingSiteConfig && siteConfig.content.use_custom_colors"
      class="container py-12"
    >
      <h2 class="mb-8 text-4xl font-black text-(--headline-color)">Color Preview</h2>
      <div
        class="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <ColorPreview color="primary-highlight" />
        <ColorPreview color="highlight-1" />
        <ColorPreview color="highlight-2" />
        <ColorPreview color="highlight-3" />
        <ColorPreview color="primary-background" />
        <ColorPreview color="background-1" />
        <ColorPreview color="background-2" />
        <ColorPreview color="background-3" />
        <ColorPreview color="background-4" />
        <ColorPreview color="background-5" />
        <ColorPreview color="background-6" />
        <ColorPreview color="background-7" />
        <ColorPreview color="background-8" />
        <ColorPreview color="background-9" />
        <ColorPreview color="background-10" />
        <ColorPreview color="primary-dark" />
      </div>
    </div>
    <div
      v-if="viewingSiteConfig && siteConfig.content.use_custom_fonts"
      class="container py-12 text-primary-dark"
    >
      <h2 class="mb-4 text-4xl font-black text-(--headline-color)">Typography Preview</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>
    </div>
    <slot></slot>
    <Footer :config="siteConfig.content" />
  </main>
</template>

<style>
@reference "~/assets/css/tailwind.css";

:root {
  --nav-background-color: #ffffff;
  --mv-brand-gold: #c4a265;
  --mv-brand-cream: #faf8f5;
  --mv-brand-dark: #1a1a1a;
  --mv-spacing-section: 64px;
  --mv-spacing-component: 32px;
  --mv-border-color: #e0ddd6;
}

body {
  @apply pt-24 text-primary-dark font-body;
}

section.page-section {
  @apply py-10 sm:py-12 md:py-14 lg:py-16;
}

section.page-section.bg-white + section.page-section.bg-white,
section.page-section.bg-primary-background + section.page-section.bg-primary-background {
  @apply pt-0;
}
section.page-section.contact-form-section:last-child {
  /* Tailwind 4 removed the screen() function; lg is 64rem. */
  @media not all and (width >= 64rem) {
    @apply pb-0;
  }
}
</style>
