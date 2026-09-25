export function useScrollReveal(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px' } = options;
  const el = ref(null);
  const isVisible = ref(false);

  if (import.meta.client) {
    onMounted(() => {
      if (!el.value) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isVisible.value = true;
            observer.disconnect();
          }
        },
        { threshold, rootMargin }
      );
      observer.observe(el.value.$el || el.value);
      onUnmounted(() => observer.disconnect());
    });
  }

  return { el, isVisible };
}
