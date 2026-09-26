<script setup>
const props = defineProps({ blok: Object });
const href = computed(() => storyblokHref(props.blok?.link));
</script>

<template>
  <section v-editable="blok" class="mv-size-guide">
    <div class="mv-size-guide__inner">
      <p v-if="blok.eyebrow" class="mv-size-guide__eyebrow">{{ blok.eyebrow }}</p>
      <h2 v-if="blok.headline" class="mv-size-guide__headline">{{ blok.headline }}</h2>
      <p v-if="blok.intro" class="mv-size-guide__intro">{{ blok.intro }}</p>
      <dl v-if="blok.rows?.length" class="mv-size-guide__table">
        <div v-for="row in blok.rows" :key="row._uid" v-editable="row" class="mv-size-guide__row">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
        </div>
      </dl>
      <a
        v-if="href && blok.link_label"
        :href="href"
        class="mv-size-guide__link"
        :target="blok.link?.target || undefined"
        :rel="blok.link?.target === '_blank' ? 'noopener' : undefined"
      >
        {{ blok.link_label }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.mv-size-guide {
  background: #fff;
  border-top: 1px solid #e6e6e6;
}
.mv-size-guide__inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 56px 24px 64px;
}
.mv-size-guide__eyebrow {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6b6b6b;
  margin: 0 0 10px;
}
.mv-size-guide__headline {
  font-family: var(--font-family-display, 'Cormorant Garamond', Georgia, serif);
  font-size: 36px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #1a1a1a;
  margin: 0 0 22px;
}
.mv-size-guide__intro {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 15px;
  line-height: 1.6;
  color: #1a1a1a;
  margin: 0 0 22px;
}
.mv-size-guide__table { margin: 0; }
.mv-size-guide__row {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 24px;
  padding: 14px 0;
  border-top: 1px solid #e6e6e6;
}
.mv-size-guide__row:last-child { border-bottom: 1px solid #e6e6e6; }
.mv-size-guide__row dt,
.mv-size-guide__row dd {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 14px;
  line-height: 1.4;
  color: #1a1a1a;
  margin: 0;
}
.mv-size-guide__row dd { text-align: right; color: #3a3a3a; }
.mv-size-guide__link {
  display: inline-block;
  margin-top: 22px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a1a1a;
  text-decoration: none;
  border-bottom: 1px solid #1a1a1a;
  padding-bottom: 2px;
}
</style>
