<script setup>
const props = defineProps({ blok: Object });

const email = ref('');
const joined = ref(false);

const theme = computed(() => {
  const value = String(props.blok?.theme || 'warm-sand').toLowerCase();
  if (value === 'dark' || value === 'black') return 'dark';
  return 'warm-sand';
});

const headline = computed(() =>
  props.blok?.headline
  || 'Join MV Circle – our free membership programme – and get 10% off your first order.',
);

const placeholder = computed(() =>
  props.blok?.placeholder || 'EMAIL ADDRESS',
);

const buttonLabel = computed(() =>
  props.blok?.button_label || 'JOIN NOW',
);

const note = computed(() =>
  props.blok?.note
  || "We'll update you by email + SMS and you can unsubscribe at any time",
);

const privacyLabel = computed(() =>
  props.blok?.privacy_label || 'Privacy Policy',
);

const privacyHref = computed(() => {
  const link = props.blok?.privacy_link;
  if (!link) return '#';
  const raw = link.cached_url || link.url || '';
  if (!raw) return '#';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  return `/${raw}`;
});

function join() {
  joined.value = true;
  email.value = '';
}
</script>

<template>
  <section
    v-editable="blok"
    class="mv-newsletter"
    :class="`mv-newsletter--${theme}`"
  >
    <p class="mv-newsletter__headline">
      {{ headline }}
    </p>

    <form
      v-if="!joined"
      class="mv-newsletter__form"
      @submit.prevent="join"
    >
      <label class="sr-only" for="mv-newsletter-email">Email address</label>
      <input
        id="mv-newsletter-email"
        v-model="email"
        type="email"
        required
        :placeholder="placeholder"
        class="mv-newsletter__input"
      />
      <button type="submit" class="mv-newsletter__button">
        {{ buttonLabel }}
        <svg viewBox="0 0 24 12" aria-hidden="true">
          <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.2" />
        </svg>
      </button>
    </form>
    <p v-else class="mv-newsletter__thanks" role="status">
      Thank you — you're on the list.
    </p>

    <p class="mv-newsletter__note">
      {{ note }}
      <template v-if="privacyHref && privacyHref !== '#'">
        - <a :href="privacyHref">{{ privacyLabel }}</a>.
      </template>
      <template v-else>
        - <span class="mv-newsletter__privacy">{{ privacyLabel }}</span>.
      </template>
    </p>
  </section>
</template>

<style scoped>
.mv-newsletter {
  padding: 72px 24px 64px;
  text-align: center;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
}
.mv-newsletter--warm-sand {
  background: #f1eee4;
  color: #1a1a1a;
  border-top: 1px solid #1a1a1a;
}
.mv-newsletter--dark {
  background: #181818;
  color: #f7f2e6;
}

.mv-newsletter__headline {
  margin: 0 auto 36px;
  max-width: 900px;
  font-family: 'Libre Caslon Text', 'Cormorant Garamond', 'Times New Roman', serif;
  font-size: clamp(22px, 2.4vw, 27px);
  font-style: italic;
  font-weight: 400;
  line-height: 1.35;
  text-wrap: balance;
}

.mv-newsletter__form {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 8px;
  flex-wrap: wrap;
}

.mv-newsletter__input {
  width: min(280px, 100%);
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  background: #fff;
  color: #1a1a1a;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-family: inherit;
}
.mv-newsletter__input::placeholder {
  color: #8a8a8a;
}
.mv-newsletter--warm-sand .mv-newsletter__input:focus {
  outline: 2px solid #1a1a1a;
  outline-offset: 2px;
}
.mv-newsletter--dark .mv-newsletter__input:focus {
  outline: 2px solid #f7f2e6;
  outline-offset: 2px;
}

.mv-newsletter__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-width: 143px;
  min-height: 44px;
  padding: 0 18px;
  background: transparent;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, color 0.2s;
}
.mv-newsletter--warm-sand .mv-newsletter__button {
  border: 1px solid #1a1a1a;
  color: #1a1a1a;
}
.mv-newsletter--warm-sand .mv-newsletter__button:hover {
  background: #1a1a1a;
  color: #fff;
}
.mv-newsletter--dark .mv-newsletter__button {
  border: 1px solid #f7f2e6;
  color: #f7f2e6;
}
.mv-newsletter--dark .mv-newsletter__button:hover {
  background: #f7f2e6;
  color: #181818;
}
.mv-newsletter__button svg {
  width: 18px;
  height: 10px;
}

.mv-newsletter__thanks {
  margin: 0;
  font-size: 13px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.mv-newsletter__note {
  margin: 36px 0 0;
  font-size: 11px;
  letter-spacing: 0.4px;
  line-height: 1.5;
}
.mv-newsletter__note a,
.mv-newsletter__privacy {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 560px) {
  .mv-newsletter {
    padding: 56px 20px 48px;
  }
  .mv-newsletter__form {
    flex-direction: column;
    align-items: stretch;
    max-width: 320px;
    margin: 0 auto;
  }
  .mv-newsletter__input,
  .mv-newsletter__button {
    width: 100%;
  }
}
</style>
