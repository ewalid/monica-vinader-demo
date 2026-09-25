const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function useDirection() {
  const route = useRoute();

  const isRTL = computed(() => {
    const lang = route.query.language || route.params.slug?.[0] || '';
    return RTL_LANGUAGES.some(rtl => lang === rtl || lang.startsWith(rtl + '-'));
  });

  const dir = computed(() => isRTL.value ? 'rtl' : 'ltr');

  if (import.meta.client) {
    watch(isRTL, (val) => {
      document.documentElement.setAttribute('dir', val ? 'rtl' : 'ltr');
    }, { immediate: true });
  }

  return { isRTL, dir };
}
