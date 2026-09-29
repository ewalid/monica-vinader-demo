/**
 * Viewport breakpoint for Siren-style responsive CMS fields.
 * mobile < 768 ≤ tablet < 1024 ≤ desktop
 */
export function useViewportBreakpoint() {
  const breakpoint = ref('desktop');

  function measure() {
    if (!import.meta.client) {
      breakpoint.value = 'desktop';
      return;
    }
    const w = window.innerWidth;
    if (w < 768) breakpoint.value = 'mobile';
    else if (w < 1024) breakpoint.value = 'tablet';
    else breakpoint.value = 'desktop';
  }

  if (import.meta.client) {
    onMounted(() => {
      measure();
      window.addEventListener('resize', measure, { passive: true });
    });
    onBeforeUnmount(() => {
      window.removeEventListener('resize', measure);
    });
  }

  return breakpoint;
}

function richtextHasContent(doc) {
  const nodes = doc?.content;
  if (!Array.isArray(nodes) || !nodes.length) return false;
  return nodes.some((node) => {
    if (node.type === 'paragraph' || node.type === 'heading') {
      return Array.isArray(node.content) && node.content.some(n => n.text?.trim());
    }
    return true;
  });
}

/** True when a CMS value is intentionally set (not empty fallback). */
export function isBreakpointValueFilled(value) {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'boolean' || typeof value === 'number') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    if (value.filename !== undefined || value.fieldtype === 'asset') {
      return Boolean(value.filename);
    }
    if (value.linktype || value.fieldtype === 'multilink') {
      return Boolean(value.cached_url || value.url || value.id);
    }
    if (value.type === 'doc') return richtextHasContent(value);
    return Object.keys(value).length > 0;
  }
  return String(value).trim().length > 0;
}

/**
 * Pick desktop / tablet / mobile field. Empty tablet|mobile falls back to desktop.
 * Desktop field name is `base`; overrides are `${base}_tablet` / `${base}_mobile`.
 */
export function pickBreakpointField(blok, base, breakpoint = 'desktop') {
  if (!blok) return undefined;
  if (breakpoint === 'mobile' && isBreakpointValueFilled(blok[`${base}_mobile`])) {
    return blok[`${base}_mobile`];
  }
  if (breakpoint === 'tablet' && isBreakpointValueFilled(blok[`${base}_tablet`])) {
    return blok[`${base}_tablet`];
  }
  return blok[base];
}

/** Boolean fields: missing override → desktop; explicit false is kept. */
export function pickBreakpointBool(blok, base, breakpoint = 'desktop', fallback = false) {
  if (!blok) return fallback;
  const key
    = breakpoint === 'mobile'
      ? `${base}_mobile`
      : breakpoint === 'tablet'
        ? `${base}_tablet`
        : base;
  if (breakpoint !== 'desktop' && Object.prototype.hasOwnProperty.call(blok, key) && typeof blok[key] === 'boolean') {
    return blok[key];
  }
  if (typeof blok[base] === 'boolean') return blok[base];
  return fallback;
}
