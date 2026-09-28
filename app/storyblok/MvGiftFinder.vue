<script setup>
import {
  fetchConstructorResults,
  getPriceFacetTests,
} from '~/composables/ecommerce/constructor-mock';
import { countryFromSlug, marketFromSlug } from '~/utils/markets';

const props = defineProps({ blok: Object });
const route = useRoute();

const PHASE = {
  QUIZ: 'quiz',
  EMAIL: 'email',
  RESULTS: 'results',
};

const phase = ref(PHASE.QUIZ);
const stepIndex = ref(0);
const answers = ref({}); // questionUid -> answer blok
const showProducts = ref(true);
const email = ref('');
const consent = ref(true);
const products = ref([]);
const loading = ref(false);
const requestMeta = ref(null);

function pageSlug() {
  if (route.query.path) return String(route.query.path).split('/').filter(Boolean);
  return route.params.slug || [];
}

const market = computed(() => marketFromSlug(pageSlug()));
const country = computed(() => countryFromSlug(pageSlug()));
const locale = computed(() => {
  const map = { uk: 'en-GB', us: 'en-US', ar: 'ar-AE', de: 'de-DE', es: 'es-ES', 'fr-be': 'fr-BE' };
  return map[market.value] || 'en-GB';
});

const questions = computed(() => props.blok?.questions || []);
const totalSteps = computed(() => {
  // quiz questions + optional email gate
  const emailOn = props.blok?.show_email_step !== false;
  return questions.value.length + (emailOn ? 1 : 0);
});
const isEmailStep = computed(() => {
  const emailOn = props.blok?.show_email_step !== false;
  return emailOn && stepIndex.value === questions.value.length;
});
const currentQuestion = computed(() => questions.value[stepIndex.value] || null);
const progressFilled = computed(() => {
  if (phase.value === PHASE.RESULTS) return totalSteps.value;
  return Math.min(stepIndex.value + 1, totalSteps.value);
});
const stepLabel = computed(() => {
  if (phase.value === PHASE.RESULTS) return '';
  return `STEP ${progressFilled.value} OF ${totalSteps.value}`;
});

const selectedChips = computed(() =>
  questions.value
    .map((q) => answers.value[q._uid])
    .filter(Boolean)
    .map((a) => ({
      uid: a._uid,
      label: a.label,
      questionUid: Object.keys(answers.value).find((k) => answers.value[k]?._uid === a._uid),
    })),
);

function hay(product) {
  return `${product.materialText || ''} ${product.title || ''} ${product.productType || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
}

function materialTest(value) {
  const map = {
    '14k-gold': (p) => /14k|14ct|solid gold/.test(hay(p)),
    'gold-vermeil': (p) => /vermeil/.test(hay(p)),
    'sterling-silver': (p) => /sterling silver|\bsilver\b/.test(hay(p)) && !/vermeil/.test(hay(p)),
    'rose-gold': (p) => /rose/.test(hay(p)),
  };
  return map[value] || (() => true);
}

function styleTest(value) {
  const map = {
    minimal: (p) => /slim|thin|stack|essential|simple|minimal|chain/.test(hay(p)),
    sparkle: (p) => /diamond|pav[eé]|sparkle|crystal/.test(hay(p)),
    gemstone: (p) => /gemstone|pearl|moonstone|turquoise|colour|color|keshi/.test(hay(p)),
    bold: (p) => /bold|statement|cuff|large|chunky|wide/.test(hay(p)),
  };
  return map[value] || ((p) => hay(p).includes(String(value).toLowerCase()));
}

function personalTest(value) {
  const map = {
    engraving: (p) => /engrav|locket|id bracelet/.test(hay(p)),
    'zodiac-initial': (p) => /zodiac|birthstone|initial|letter|charm/.test(hay(p)),
    classic: () => true,
  };
  return map[value] || (() => true);
}

function stoneTest(value) {
  const map = {
    diamond: (p) => /diamond/.test(hay(p)),
    pearl: (p) => /pearl/.test(hay(p)),
    'no-stone': (p) => !/diamond|pearl|gemstone|moonstone/.test(hay(p)),
  };
  return map[value] || (() => true);
}

function keywordTest(value) {
  const v = String(value || '').toLowerCase();
  if (!v) return () => true;
  return (p) => hay(p).includes(v);
}

function priceTestFor(value, currency) {
  const bands = getPriceFacetTests(currency);
  const found = bands.find((b) => b.value === value);
  if (found) return found.test;
  // Gift-finder specific bands
  const giftBands = {
    'under-120': (p) => Number(p.price) < 120,
    '120-180': (p) => Number(p.price) >= 120 && Number(p.price) <= 180,
    '180-300': (p) => Number(p.price) >= 180 && Number(p.price) <= 300,
    'over-300': (p) => Number(p.price) > 300,
    'under-100': (p) => Number(p.price) < 100,
    '100-250': (p) => Number(p.price) >= 100 && Number(p.price) <= 250,
    '250-500': (p) => Number(p.price) >= 250 && Number(p.price) <= 500,
    'over-500': (p) => Number(p.price) > 500,
  };
  return giftBands[value] || (() => true);
}

function buildFacetTests(currency) {
  const selected = Object.values(answers.value).filter(Boolean);
  const tests = [];
  for (const answer of selected) {
    if (answer.skip_filter) continue;
    const key = String(answer.facet_key || '').trim().toLowerCase();
    const value = String(answer.facet_value || '').trim();
    if (!key || !value) continue;
    if (key === 'price') tests.push(priceTestFor(value, currency));
    else if (key === 'material') tests.push(materialTest(value));
    else if (key === 'style') tests.push(styleTest(value));
    else if (key === 'personal') tests.push(personalTest(value));
    else if (key === 'stone') tests.push(stoneTest(value));
    else if (key === 'tags' || key === 'keyword') tests.push(keywordTest(value));
    else if (key === 'collection') tests.push((p) => hay(p).includes(value.toLowerCase()));
    else if (key === 'occasion') continue; // display chip only — catalogue rarely tagged
    else tests.push(keywordTest(value));
  }
  return tests;
}

const currency = computed(() => (
  requestMeta.value?.currency
  || products.value[0]?.priceCurrency
  || (country.value === 'AE' ? 'AED' : country.value === 'US' ? 'USD' : 'GBP')
));

const visibleProducts = computed(() => {
  const max = Math.min(parseInt(props.blok?.max_products, 10) || 36, 36);
  const tests = buildFacetTests(currency.value);
  let list = products.value;
  if (tests.length) {
    list = list.filter((p) => tests.every((t) => t(p)));
  }
  // Soft fallback: if filters wipe the list, show unfiltered catalogue
  if (!list.length && products.value.length && tests.length) {
    list = products.value;
  }
  return list.slice(0, max);
});

function formatPrice(amount, currencyCode) {
  try {
    return new Intl.NumberFormat(locale.value || 'en-GB', {
      style: 'currency',
      currency: currencyCode || 'GBP',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  }
  catch {
    return `${currencyCode || ''} ${amount}`;
  }
}

function productHref(slug) {
  const prefix = market.value ? `/${market.value}` : '';
  return `${prefix}/products/${slug}`;
}

async function loadProducts() {
  loading.value = true;
  try {
    const handle = props.blok.collection_handle || '';
    const max = Math.min(parseInt(props.blok.max_products, 10) || 36, 36);
    const result = await fetchConstructorResults(handle, {
      maxProducts: Math.max(max, 40),
      country: country.value,
      market: market.value,
      locale: locale.value,
    });
    products.value = result.response.results;
    requestMeta.value = result.meta;
  }
  catch (e) {
    console.error('Gift finder catalogue error:', e);
  }
  finally {
    loading.value = false;
  }
}

function selectAnswer(answer) {
  const q = currentQuestion.value;
  if (!q) return;
  answers.value = { ...answers.value, [q._uid]: answer };
  // Advance after short delay for selection feedback
  setTimeout(() => {
    if (stepIndex.value < questions.value.length - 1) {
      stepIndex.value += 1;
    }
    else if (props.blok?.show_email_step !== false) {
      stepIndex.value = questions.value.length;
    }
    else {
      finishQuiz();
    }
  }, 180);
}

function goBack() {
  if (phase.value === PHASE.RESULTS) {
    phase.value = PHASE.QUIZ;
    stepIndex.value = Math.max(questions.value.length - 1, 0);
    return;
  }
  if (stepIndex.value > 0) stepIndex.value -= 1;
}

function skipEmail() {
  finishQuiz();
}

function submitEmail() {
  finishQuiz();
}

async function finishQuiz() {
  phase.value = PHASE.RESULTS;
  showProducts.value = true;
  if (!products.value.length) await loadProducts();
}

function retake() {
  answers.value = {};
  stepIndex.value = 0;
  email.value = '';
  phase.value = PHASE.QUIZ;
  showProducts.value = true;
}

function removeChip(chip) {
  if (!chip.questionUid) return;
  const next = { ...answers.value };
  delete next[chip.questionUid];
  answers.value = next;
}

onMounted(() => {
  // Prefetch catalogue so results feel instant
  loadProducts();
});
</script>

<template>
  <section v-editable="blok" class="mv-gf">
    <!-- QUIZ / EMAIL -->
    <div v-if="phase !== PHASE.RESULTS" class="mv-gf__quiz">
      <div class="mv-gf__top">
        <button
          v-if="stepIndex > 0"
          type="button"
          class="mv-gf__back"
          @click="goBack"
        >
          ← BACK
        </button>
        <div class="mv-gf__progress-wrap">
          <p class="mv-gf__step">{{ stepLabel }}</p>
          <div class="mv-gf__bar" :style="{ '--steps': totalSteps }">
            <span
              v-for="n in totalSteps"
              :key="n"
              class="mv-gf__bar-seg"
              :class="{ 'is-filled': n <= progressFilled }"
            />
          </div>
        </div>
      </div>

      <div class="mv-gf__intro">
        <h2 class="mv-gf__title">{{ blok.title || 'The Gift Finder' }}</h2>
        <p class="mv-gf__subtitle">
          {{ blok.subtitle || "Answer five quick questions and we'll curate a shortlist of jewellery they'll love." }}
        </p>
      </div>

      <!-- Question step -->
      <div v-if="!isEmailStep && currentQuestion" class="mv-gf__body">
        <h3 class="mv-gf__question">{{ currentQuestion.question }}</h3>
        <div
          class="mv-gf__options"
          :class="{ 'mv-gf__options--three': (currentQuestion.answers || []).length === 3 }"
        >
          <button
            v-for="answer in (currentQuestion.answers || [])"
            :key="answer._uid"
            type="button"
            class="mv-gf__option"
            :class="{ 'is-selected': answers[currentQuestion._uid]?._uid === answer._uid }"
            @click="selectAnswer(answer)"
          >
            <span>{{ answer.label }}</span>
            <span
              v-if="answer.tooltip"
              class="mv-gf__tip"
              :title="answer.tooltip"
              @click.stop
            >?</span>
          </button>
        </div>
      </div>

      <!-- Email gate -->
      <div v-else-if="isEmailStep" class="mv-gf__body mv-gf__email">
        <h3 class="mv-gf__question">{{ blok.email_title || "Let's keep in touch" }}</h3>
        <input
          v-model="email"
          type="email"
          class="mv-gf__input"
          :placeholder="blok.email_placeholder || 'Your email address'"
        />
        <label class="mv-gf__consent">
          <input v-model="consent" type="checkbox" />
          <span>{{ blok.email_consent || 'I agree to receive marketing emails, and understand that I can unsubscribe at any time from the bottom of any email.' }}</span>
        </label>
        <div class="mv-gf__email-actions">
          <button type="button" class="mv-gf__btn mv-gf__btn--solid" @click="submitEmail">SUBMIT</button>
          <button type="button" class="mv-gf__btn mv-gf__btn--outline" @click="skipEmail">SKIP</button>
        </div>
      </div>
    </div>

    <!-- RESULTS -->
    <div v-else class="mv-gf__results">
      <h2 class="mv-gf__results-title">{{ blok.results_title || 'The Results Are In' }}</h2>
      <p class="mv-gf__results-sub">
        {{ blok.results_subtitle || 'Here are your personalised recommendations:' }}
      </p>

      <div class="mv-gf__chips">
        <button
          v-for="chip in selectedChips"
          :key="chip.uid"
          type="button"
          class="mv-gf__chip"
          @click="removeChip(chip)"
        >
          <span>{{ chip.label }}</span>
          <span class="mv-gf__chip-x" aria-hidden="true">×</span>
        </button>
      </div>

      <div class="mv-gf__controls">
        <button type="button" class="mv-gf__btn mv-gf__btn--solid" @click="retake">
          {{ blok.retake_label || 'RETAKE QUIZ' }}
        </button>
        <label class="mv-gf__toggle">
          <span>{{ blok.show_products_label || 'SHOW PRODUCTS' }}</span>
          <button
            type="button"
            class="mv-gf__switch"
            :class="{ 'is-on': showProducts }"
            role="switch"
            :aria-checked="showProducts"
            @click="showProducts = !showProducts"
          >
            <span class="mv-gf__switch-knob" />
          </button>
        </label>
      </div>

      <div v-if="showProducts" class="mv-gf__grid-wrap">
        <p v-if="loading" class="mv-gf__loading">Loading recommendations…</p>
        <div v-else class="mv-gf__grid">
          <a
            v-for="product in visibleProducts"
            :key="product.id"
            :href="productHref(product.slug)"
            class="mv-gf__card"
          >
            <div class="mv-gf__card-img-wrap">
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.title"
                class="mv-gf__card-img"
                loading="lazy"
              />
            </div>
            <h3 class="mv-gf__card-title">{{ product.title }}</h3>
            <p class="mv-gf__card-meta">
              {{ product.materialText || product.productType || formatPrice(product.price, product.priceCurrency || currency) }}
            </p>
            <p class="mv-gf__card-price">
              {{ formatPrice(product.price, product.priceCurrency || currency) }}
            </p>
          </a>
        </div>
        <p v-if="!loading && !visibleProducts.length" class="mv-gf__empty">
          No matching products — try removing a filter chip.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-gf {
  background: #f9f7f2;
  padding: 48px 24px 80px;
  min-height: 70vh;
}
.mv-gf__quiz,
.mv-gf__results {
  max-width: 720px;
  margin: 0 auto;
}
.mv-gf__results {
  max-width: 1200px;
}
.mv-gf__top {
  position: relative;
  margin-bottom: 40px;
  min-height: 48px;
}
.mv-gf__back {
  position: absolute;
  left: 0;
  top: 0;
  border: none;
  background: none;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: #666;
  cursor: pointer;
  padding: 4px 0;
}
.mv-gf__progress-wrap {
  text-align: center;
  max-width: 280px;
  margin: 0 auto;
}
.mv-gf__step {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: #666;
  margin: 0 0 10px;
}
.mv-gf__bar {
  display: grid;
  grid-template-columns: repeat(var(--steps, 6), 1fr);
  gap: 4px;
  height: 2px;
}
.mv-gf__bar-seg {
  background: #ddd9d2;
  display: block;
}
.mv-gf__bar-seg.is-filled {
  background: #1a1a1a;
}
.mv-gf__intro {
  text-align: center;
  margin-bottom: 40px;
}
.mv-gf__title {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 14px;
}
.mv-gf__subtitle {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 14px;
  line-height: 1.5;
  color: #1a1a1a;
  margin: 0 auto;
  max-width: 420px;
}
.mv-gf__body {
  text-align: center;
}
.mv-gf__question {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 28px;
}
.mv-gf__options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  max-width: 560px;
  margin: 0 auto;
}
.mv-gf__options--three {
  grid-template-columns: 1fr 1fr;
}
.mv-gf__options--three .mv-gf__option:last-child {
  grid-column: 1 / -1;
  max-width: calc(50% - 6px);
  justify-self: center;
  width: 100%;
}
.mv-gf__option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 64px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #d9d5ce;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.mv-gf__option:hover,
.mv-gf__option.is-selected {
  border-color: #1a1a1a;
  border-width: 1.5px;
}
.mv-gf__tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #c8c4bc;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}
.mv-gf__input {
  display: block;
  width: 100%;
  max-width: 480px;
  margin: 0 auto 16px;
  padding: 16px 18px;
  border: 1px solid #d9d5ce;
  background: #fff;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 14px;
}
.mv-gf__consent {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  text-align: left;
  max-width: 480px;
  margin: 0 auto 28px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 12px;
  line-height: 1.45;
  color: #333;
}
.mv-gf__consent input {
  margin-top: 2px;
  accent-color: #2563eb;
}
.mv-gf__email-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  max-width: 480px;
  margin: 0 auto;
}
.mv-gf__btn {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 14px 28px;
  cursor: pointer;
  border: 1px solid #1a1a1a;
  transition: background 0.2s, color 0.2s;
}
.mv-gf__btn--solid {
  background: #2a2a2a;
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.mv-gf__btn--solid:hover {
  background: #000;
}
.mv-gf__btn--outline {
  background: #fff;
  color: #1a1a1a;
}
.mv-gf__results-title {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 400;
  text-align: center;
  margin: 0 0 12px;
  color: #1a1a1a;
}
.mv-gf__results-sub {
  text-align: center;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 14px;
  margin: 0 0 28px;
  color: #1a1a1a;
}
.mv-gf__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 28px;
}
.mv-gf__chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #d0ccc4;
  border-radius: 999px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a1a1a;
  cursor: pointer;
}
.mv-gf__chip-x {
  color: #999;
  font-size: 16px;
  line-height: 1;
}
.mv-gf__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}
.mv-gf__toggle {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1a1a1a;
  cursor: pointer;
}
.mv-gf__switch {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: none;
  background: #c8c4bc;
  position: relative;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}
.mv-gf__switch.is-on {
  background: #3a3a3a;
}
.mv-gf__switch-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}
.mv-gf__switch.is-on .mv-gf__switch-knob {
  transform: translateX(20px);
}
.mv-gf__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px 20px;
}
.mv-gf__card {
  text-decoration: none;
  color: inherit;
}
.mv-gf__card-img-wrap {
  aspect-ratio: 1;
  background: #f0eeeb;
  overflow: hidden;
  margin-bottom: 12px;
}
.mv-gf__card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}
.mv-gf__card:hover .mv-gf__card-img {
  transform: scale(1.04);
}
.mv-gf__card-title {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
}
.mv-gf__card-meta,
.mv-gf__card-price {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 13px;
  color: #666;
  margin: 0;
}
.mv-gf__card-price {
  margin-top: 4px;
  color: #1a1a1a;
}
.mv-gf__loading,
.mv-gf__empty {
  text-align: center;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  color: #666;
  padding: 40px 0;
}

@media (max-width: 900px) {
  .mv-gf__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .mv-gf__options { grid-template-columns: 1fr; }
  .mv-gf__options--three .mv-gf__option:last-child {
    grid-column: auto;
    max-width: none;
  }
  .mv-gf__grid { grid-template-columns: 1fr 1fr; gap: 16px; }
  .mv-gf__email-actions { grid-template-columns: 1fr; }
}
</style>
