const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

function isRtlCode(code) {
  if (!code || code === 'default') return false;
  return RTL_LANGUAGES.some(rtl => code === rtl || code.startsWith(`${rtl}-`));
}

export function useDirection() {
  const route = useRoute();
  const forceRtl = useState('forceRtl', () => false);

  const isRTL = computed(() => {
    if (forceRtl.value) return true;

    // Market folder wins (ar/guides/… must stay RTL even if VE language = Default)
    const pathHead
      = route.params.slug?.[0]
      || (typeof route.query.path === 'string' ? route.query.path.split('/')[0] : '')
      || '';
    if (isRtlCode(pathHead)) return true;

    // Field-level language only when not already in a market folder path
    const q = route.query._storyblok_lang || route.query.language || '';
    const fromQuery = Array.isArray(q) ? q[0] : q;
    return isRtlCode(fromQuery);
  });

  const dir = computed(() => (isRTL.value ? 'rtl' : 'ltr'));

  if (import.meta.client) {
    watch(isRTL, (val) => {
      document.documentElement.setAttribute('dir', val ? 'rtl' : 'ltr');
    }, { immediate: true });
  }

  return { isRTL, dir, forceRtl };
}
