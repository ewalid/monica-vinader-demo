<script setup>
defineProps({ blok: Object });
</script>

<template>
  <section
    v-editable="blok"
    class="mv-icon-showcase"
    :class="{ 'mv-icon-showcase--reversed': blok.image_position === 'right' }"
  >
    <div class="mv-icon-showcase__container">
      <div class="mv-icon-showcase__media">
        <img
          v-if="blok.image?.filename"
          :src="blok.image.filename + '/m/900x0'"
          :alt="blok.product_name || ''"
          class="mv-icon-showcase__img"
          loading="lazy"
        />
        <img
          v-else-if="blok.image_url"
          :src="blok.image_url"
          :alt="blok.product_name || ''"
          class="mv-icon-showcase__img"
          loading="lazy"
        />
      </div>
      <div class="mv-icon-showcase__content">
        <h3 v-if="blok.product_name" class="mv-icon-showcase__name">
          {{ blok.product_name }}
        </h3>
        <p v-if="blok.subtitle" class="mv-icon-showcase__subtitle">
          {{ blok.subtitle }}
        </p>
        <p v-if="blok.price" class="mv-icon-showcase__price">
          {{ blok.price }}
        </p>
        <p v-if="blok.description" class="mv-icon-showcase__desc" v-html="blok.description" />
        <div class="mv-icon-showcase__actions">
          <a
            v-if="blok.read_more_link?.cached_url"
            :href="'/' + blok.read_more_link.cached_url"
            class="mv-icon-showcase__btn mv-icon-showcase__btn--outline"
          >
            Read More
          </a>
          <button
            class="mv-icon-showcase__btn mv-icon-showcase__btn--solid"
          >
            Add to Cart &nbsp;&rarr;
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mv-icon-showcase {
  background: #faf8f5;
  padding: 60px 0;
  border-top: 1px solid #ece9e3;
}
.mv-icon-showcase__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}
.mv-icon-showcase--reversed .mv-icon-showcase__container {
  direction: rtl;
}
.mv-icon-showcase--reversed .mv-icon-showcase__container > * {
  direction: ltr;
}
.mv-icon-showcase__media {
  overflow: hidden;
}
.mv-icon-showcase__img {
  width: 100%;
  height: auto;
  display: block;
}
.mv-icon-showcase__name {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.mv-icon-showcase__subtitle {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  color: #666;
  margin-bottom: 6px;
}
.mv-icon-showcase__price {
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 15px;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 24px;
}
.mv-icon-showcase__desc {
  font-family: var(--font-family-display, 'Cormorant Garamond', serif);
  font-size: clamp(24px, 3.5vw, 36px);
  font-weight: 300;
  line-height: 1.25;
  color: #1a1a1a;
  margin-bottom: 32px;
}
.mv-icon-showcase__desc :deep(em),
.mv-icon-showcase__desc :deep(i) {
  font-style: italic;
}
.mv-icon-showcase__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.mv-icon-showcase__btn {
  display: inline-flex;
  align-items: center;
  padding: 14px 32px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
.mv-icon-showcase__btn--outline {
  background: transparent;
  border: 1px solid #1a1a1a;
  color: #1a1a1a;
}
.mv-icon-showcase__btn--outline:hover {
  background: #1a1a1a;
  color: #fff;
}
.mv-icon-showcase__btn--solid {
  background: #1a1a1a;
  border: 1px solid #1a1a1a;
  color: #fff;
}
.mv-icon-showcase__btn--solid:hover {
  background: #333;
}
@media (max-width: 768px) {
  .mv-icon-showcase__container {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 0 20px;
  }
  .mv-icon-showcase--reversed .mv-icon-showcase__container {
    direction: ltr;
  }
  .mv-icon-showcase { padding: 40px 0; }
}
</style>
