export async function useDesignTokens() {
  const tokens = useState('designTokens', () => ({}));

  if (Object.keys(tokens.value).length) return tokens;

  try {
    const storyblokApi = useStoryblokApi();
    const { data } = await storyblokApi.get('cdn/datasource_entries', {
      datasource: 'design-tokens',
      per_page: 50,
    });

    const map = {};
    for (const entry of data.datasource_entries) {
      map[entry.name] = entry.value;
    }
    tokens.value = map;

    if (import.meta.client) {
      applyTokensToDOM(map);
    }
  } catch (e) {
    console.warn('Design tokens fetch failed, using defaults:', e);
    tokens.value = {
      brand_gold: '#c4a265',
      brand_cream: '#faf8f5',
      brand_dark: '#1a1a1a',
      font_display: 'Cormorant Garamond',
      font_body: 'Work Sans',
      spacing_section: '64px',
      spacing_component: '32px',
      border_color: '#e0ddd6',
    };
  }

  return tokens;
}

function applyTokensToDOM(tokens) {
  const root = document.documentElement;
  if (tokens.brand_gold) root.style.setProperty('--mv-brand-gold', tokens.brand_gold);
  if (tokens.brand_cream) root.style.setProperty('--mv-brand-cream', tokens.brand_cream);
  if (tokens.brand_dark) root.style.setProperty('--mv-brand-dark', tokens.brand_dark);
  if (tokens.font_display) root.style.setProperty('--font-family-display', `'${tokens.font_display}', serif`);
  if (tokens.font_body) root.style.setProperty('--font-family-body', `'${tokens.font_body}', sans-serif`);
  if (tokens.spacing_section) root.style.setProperty('--mv-spacing-section', tokens.spacing_section);
  if (tokens.spacing_component) root.style.setProperty('--mv-spacing-component', tokens.spacing_component);
  if (tokens.border_color) root.style.setProperty('--mv-border-color', tokens.border_color);
}
