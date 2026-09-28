<script setup>
import { marketFromSlug } from '~/utils/markets';

const props = defineProps({
  config: { type: Object, default: () => ({}) },
});

const route = useRoute();

const MARKETS = {
  'uk': { flag: '🇬🇧', label: 'UK (GBP)' },
  'us': { flag: '🇺🇸', label: 'US (USD)' },
  'ar': { flag: '🇦🇪', label: 'UAE (AED)' },
  'de': { flag: '🇩🇪', label: 'DE (EUR)' },
  'es': { flag: '🇪🇸', label: 'ES (EUR)' },
  'fr-be': { flag: '🇧🇪', label: 'BE (EUR)' },
};
const market = computed(() => {
  const fromQuery = route.query.path ? String(route.query.path).split('/').filter(Boolean) : [];
  const slug = fromQuery.length ? fromQuery : (route.params.slug || []);
  return MARKETS[marketFromSlug(slug)] || MARKETS.uk;
});

// storyblokHref leaves url-type links like "uk/collections/new-in" relative to the current page.
function href(link) {
  const value = storyblokHref(link);
  if (!value || /^(?:https?:|mailto:|tel:|#|\/)/.test(value)) {
    return value;
  }
  return `/${value}`;
}

function column(headline, items) {
  return { headline, items: (items || []).filter(item => item?.label) };
}

const leftColumns = computed(() => [
  column(props.config.footer_nav_1_headline, props.config.footer_nav_1),
  column(props.config.footer_nav_2_headline, props.config.footer_nav_2),
].filter(col => col.items.length));

const connect = computed(() => column(props.config.footer_nav_3_headline, props.config.footer_nav_3));

const SOCIAL = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['pinterest', 'Pinterest'],
  ['x', 'Twitter'],
  ['youtube', 'YouTube'],
];
const social = computed(() => SOCIAL
  .map(([key, label]) => ({ key, label, href: href(props.config[key]) }))
  .filter(item => item.href));

const payments = computed(() => (props.config.payment_icons || []).filter(asset => asset?.filename));
const legal = computed(() => (props.config.legal_links || []).filter(item => item?.label));
const privacyHref = computed(() => href(props.config.newsletter_privacy_link));

const email = ref('');
const joined = ref(false);
function join() {
  joined.value = true;
  email.value = '';
}
</script>

<template>
  <footer class="mv-footer">
    <section v-if="config.newsletter_headline" class="mv-footer__newsletter">
      <p class="mv-footer__nl-headline">
        {{ config.newsletter_headline }}
      </p>
      <form v-if="!joined" class="mv-footer__nl-form" @submit.prevent="join">
        <label class="sr-only" for="mv-footer-email">Email address</label>
        <input
          id="mv-footer-email"
          v-model="email"
          type="email"
          required
          placeholder="Email address"
          class="mv-footer__nl-input"
        />
        <button type="submit" class="mv-footer__nl-button">
          {{ config.newsletter_button || 'Join now' }}
          <svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.2" /></svg>
        </button>
      </form>
      <p v-else class="mv-footer__nl-thanks" role="status">
        Thank you — you're on the list.
      </p>
      <p v-if="config.newsletter_note" class="mv-footer__nl-note">
        {{ config.newsletter_note }}<template v-if="privacyHref">
          - <a :href="privacyHref">Privacy Policy</a>.
        </template>
      </p>
    </section>

    <div class="mv-footer__main">
      <nav v-for="col in leftColumns" :key="col.headline" class="mv-footer__col" :aria-label="col.headline">
        <h6 class="mv-footer__heading">
          {{ col.headline }}
        </h6>
        <ul>
          <li v-for="item in col.items" :key="item._uid" v-editable="item">
            <a :href="href(item.link)">{{ item.label }}</a>
          </li>
        </ul>
      </nav>

      <div class="mv-footer__centre">
        <img
          v-if="config.footer_logo?.filename"
          :src="config.footer_logo.filename"
          :alt="config.footer_logo.alt || 'Monica Vinader'"
          class="mv-footer__logo"
        />
        <span v-else class="mv-footer__wordmark">MONICA VINADER</span>
        <p class="mv-footer__market">
          <span aria-hidden="true">{{ market.flag }}</span> {{ market.label }}
        </p>
        <ul v-if="payments.length" class="mv-footer__payments" aria-label="Payment methods">
          <li v-for="asset in payments" :key="asset.id">
            <img :src="asset.filename" :alt="asset.alt || asset.title || ''" width="35" height="20" />
          </li>
        </ul>
      </div>

      <nav v-if="connect.items.length" class="mv-footer__col" :aria-label="connect.headline">
        <h6 class="mv-footer__heading">
          {{ connect.headline }}
        </h6>
        <ul>
          <li v-for="item in connect.items" :key="item._uid" v-editable="item">
            <a :href="href(item.link)">{{ item.label }}</a>
          </li>
        </ul>
      </nav>

      <nav v-if="social.length" class="mv-footer__col" :aria-label="config.footer_social_headline || 'Social'">
        <h6 class="mv-footer__heading">
          {{ config.footer_social_headline || 'Social' }}
        </h6>
        <ul>
          <li v-for="item in social" :key="item.key">
            <a :href="item.href" target="_blank" rel="noopener">{{ item.label }}</a>
          </li>
        </ul>
      </nav>
    </div>

    <div v-if="legal.length || config.copyright" class="mv-footer__legal">
      <ul>
        <li v-for="item in legal" :key="item._uid" v-editable="item">
          <a :href="href(item.link)">{{ item.label }}</a>
        </li>
      </ul>
      <p v-if="config.copyright">
        {{ config.copyright }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.mv-footer {
  background: #fff;
  color: #000;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
}

.mv-footer__newsletter {
  background: #181818;
  color: #f7f2e6;
  padding: 72px 24px 64px;
  text-align: center;
}
.mv-footer__nl-headline {
  margin: 0 auto 36px;
  max-width: 900px;
  font-family: 'Libre Caslon Text', 'Times New Roman', serif;
  font-size: 27px;
  font-style: italic;
  line-height: 1.3;
  text-wrap: balance;
}
.mv-footer__nl-form {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
.mv-footer__nl-input {
  width: 178px;
  height: 34px;
  margin-block: 5px;
  padding: 0 12px;
  border: 0;
  background: #fff;
  color: #000;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.mv-footer__nl-input::placeholder {
  color: #5c5c5c;
}
.mv-footer__nl-input:focus {
  outline: 2px solid #f7f2e6;
  outline-offset: 2px;
}
.mv-footer__nl-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 143px;
  height: 44px;
  border: 1px solid #f7f2e6;
  background: transparent;
  color: #f7f2e6;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.mv-footer__nl-button svg {
  width: 18px;
  height: 10px;
}
.mv-footer__nl-button:hover {
  background: #f7f2e6;
  color: #181818;
}
.mv-footer__nl-thanks {
  margin: 0;
  font-size: 13px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.mv-footer__nl-note {
  margin: 36px 0 0;
  font-size: 11px;
  letter-spacing: 0.6px;
}
.mv-footer__nl-note a {
  color: inherit;
  text-decoration: underline;
}

.mv-footer__main {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 1fr 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 52px 40px 56px;
}
.mv-footer__heading {
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.9px;
  text-transform: uppercase;
}
.mv-footer__col ul {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.mv-footer__col a {
  color: #000;
  font-size: 12px;
  font-weight: 300;
  letter-spacing: 1.5px;
  line-height: 14px;
  text-decoration: none;
}
.mv-footer__col a:hover {
  text-decoration: underline;
}

.mv-footer__centre {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  text-align: center;
}
.mv-footer__logo {
  width: 152px;
  height: auto;
}
.mv-footer__wordmark {
  font-size: 15px;
  letter-spacing: 0.25em;
}
.mv-footer__market {
  margin: 0;
  font-size: 11px;
  letter-spacing: 1.2px;
}
.mv-footer__payments {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.mv-footer__payments img {
  display: block;
  width: 35px;
  height: 20px;
  object-fit: contain;
}

.mv-footer__legal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 32px;
  padding: 12px 40px;
  background: #f0efeb;
  color: #5c5c5c;
  font-size: 11px;
  letter-spacing: 1.35px;
}
.mv-footer__legal ul {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 32px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.mv-footer__legal a {
  color: inherit;
  text-decoration: none;
}
.mv-footer__legal a:hover {
  text-decoration: underline;
}
.mv-footer__legal p {
  margin: 0;
}

@media (max-width: 900px) {
  .mv-footer__main {
    grid-template-columns: 1fr 1fr;
    gap: 36px 24px;
    padding: 40px 20px;
  }
  .mv-footer__centre {
    grid-column: 1 / -1;
    order: -1;
  }
  .mv-footer__newsletter {
    padding: 48px 20px;
  }
  .mv-footer__nl-headline {
    font-size: 22px;
  }
  .mv-footer__legal {
    padding: 16px 20px;
  }
}
</style>
