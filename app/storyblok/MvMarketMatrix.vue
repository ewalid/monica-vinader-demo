<script setup>
const props = defineProps({ blok: Object });

const MASTER = 'uk';
const MARKETS = [
  { slug: 'uk', label: 'UK', note: 'Global master' },
  { slug: 'us', label: 'US', note: 'Variant' },
  { slug: 'ar', label: 'Arabic', note: 'Variant · RTL' },
  { slug: 'de', label: 'German', note: 'Language' },
  { slug: 'fr-be', label: 'French (BE)', note: 'Language' },
];
// Stories that are infrastructure, not pages a market would localise.
const IGNORED = [/\/site-config$/, /^uk\/tools\//];

const storyblokApi = useStoryblokApi();
const loading = ref(true);
const error = ref('');
const stories = ref([]);
const loadedAt = ref(null);
const showAll = ref(Boolean(props.blok?.show_all));

// One unfiltered read of the whole space. A `starts_with: 'ar/'` filter would be read as the
// field-level language `ar` (which shares its code with the folder) and return UK pages as ar/uk/….
async function fetchSpace() {
  const all = [];
  for (let page = 1; page < 50; page++) {
    const response = await storyblokApi.get('cdn/stories', {
      version: 'draft',
      per_page: 100,
      page,
      cv: Date.now(),
    });
    const batch = response.data.stories;
    all.push(...batch);
    if (all.length >= Number(response.total || 0) || batch.length < 100) {
      break;
    }
  }
  const folders = MARKETS.map(m => m.slug);
  return all.filter(story => folders.includes(story.full_slug.split('/')[0]));
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    stories.value = await fetchSpace();
    loadedAt.value = new Date();
  }
  catch (e) {
    error.value = e?.message || 'Could not read Storyblok';
  }
  finally {
    loading.value = false;
  }
}
onMounted(load);

// Component tree, in order, so a shorter page or swapped tiles reads as a different structure.
function structure(node, out = []) {
  if (Array.isArray(node)) {
    node.forEach(item => structure(item, out));
  }
  else if (node && typeof node === 'object') {
    if (node.component) {
      out.push(node.component);
    }
    // Sorted keys: a clone can return the same slots in a different key order.
    Object.keys(node).sort().forEach((key) => {
      const value = node[key];
      if (Array.isArray(value) || (value && typeof value === 'object')) {
        structure(value, out);
      }
    });
  }
  return out;
}
const countBlocks = story => structure(story.content).length - 1;
const time = value => (value ? new Date(value).getTime() : 0);
const lastChange = story => Math.max(time(story.published_at), time(story.updated_at));
const tags = story => (Array.isArray(story.tag_list) ? story.tag_list : []);
const sourceTag = story => tags(story).find(t => /^from-/i.test(t))?.replace(/^from-/i, '').toUpperCase() || '';

const rows = computed(() => {
  const byGroup = new Map();
  for (const story of stories.value) {
    if (!story.group_id) {
      continue;
    }
    const folder = story.full_slug.split('/')[0];
    if (!byGroup.has(story.group_id)) {
      byGroup.set(story.group_id, {});
    }
    byGroup.get(story.group_id)[folder] = story;
  }

  const list = [];
  for (const group of byGroup.values()) {
    const master = group[MASTER];
    if (!master || IGNORED.some(re => re.test(master.full_slug))) {
      continue;
    }
    const required = tags(master).includes('required-all-markets');
    const masterStructure = structure(master.content).join('>');
    const cells = MARKETS.filter(m => m.slug !== MASTER).map((market) => {
      const story = group[market.slug];
      if (!story) {
        return { market: market.slug, state: required ? 'missing' : 'none' };
      }
      const differs = structure(story.content).join('>') !== masterStructure;
      const stale = time(master.published_at) > lastChange(story);
      return {
        market: market.slug,
        state: stale ? 'stale' : differs ? 'override' : 'copy',
        story,
        blocks: countBlocks(story),
        from: sourceTag(story),
        draft: !story.published_at,
      };
    });
    list.push({
      master,
      path: master.full_slug.replace(/^uk\//, ''),
      blocks: countBlocks(master),
      required,
      cells,
      localised: cells.some(c => c.state !== 'none' && c.state !== 'missing'),
    });
  }
  return list.sort((a, b) => a.path.localeCompare(b.path));
});

const visibleRows = computed(() => (showAll.value ? rows.value : rows.value.filter(r => r.localised || r.required)));

const linkedIds = computed(() => new Set(rows.value.flatMap(r => r.cells.filter(c => c.story).map(c => c.story.id))));

const summary = computed(() => MARKETS.filter(m => m.slug !== MASTER).map((market) => {
  const cells = rows.value.map(r => r.cells.find(c => c.market === market.slug));
  const count = state => cells.filter(c => c.state === state).length;
  const inFolder = stories.value.filter(s => s.full_slug.startsWith(`${market.slug}/`) && !IGNORED.some(re => re.test(s.full_slug)));
  return {
    ...market,
    unlinked: inFolder.filter(s => !linkedIds.value.has(s.id)).length,
    versions: cells.filter(c => c.story).length,
    overrides: count('override'),
    stale: count('stale'),
    missing: count('missing'),
  };
}));

const LABELS = {
  copy: 'Follows master',
  override: 'Override',
  stale: 'Stale',
  none: 'No version',
  missing: 'Missing',
};

function ago(value) {
  if (!value) {
    return '';
  }
  const minutes = Math.round((Date.now() - time(value)) / 60000);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 48) {
    return `${hours} h ago`;
  }
  return `${Math.round(hours / 24)} days ago`;
}

function editorUrl(story) {
  return `https://app.storyblok.com/#/me/spaces/${story.space_id || '295438895232893'}/stories/0/0/${story.id}`;
}
</script>

<template>
  <section v-editable="blok" class="mv-matrix">
    <header class="mv-matrix__head">
      <div>
        <p class="mv-matrix__eyebrow">
          Market matrix
        </p>
        <h1 class="mv-matrix__title">
          {{ blok?.headline || 'Every page, every market' }}
        </h1>
        <p class="mv-matrix__lede">
          Read live from Storyblok each time this opens. Rows are UK master pages; columns are the market folders linked by Dimensions.
        </p>
      </div>
      <div class="mv-matrix__actions">
        <label class="mv-matrix__toggle">
          <input v-model="showAll" type="checkbox" />
          Show pages with no market version
        </label>
        <button type="button" class="mv-matrix__refresh" :disabled="loading" @click="load">
          {{ loading ? 'Reading…' : 'Refresh' }}
        </button>
        <span v-if="loadedAt" class="mv-matrix__stamp">Read {{ loadedAt.toLocaleTimeString() }}</span>
      </div>
    </header>

    <ul class="mv-matrix__legend">
      <li><span class="mv-chip mv-chip--copy">Follows master</span> own version (copy or translation), same blocks in the same order</li>
      <li><span class="mv-chip mv-chip--override">Override</span> own version, different blocks or order</li>
      <li><span class="mv-chip mv-chip--stale">Stale</span> master published after this version last changed</li>
      <li><span class="mv-chip mv-chip--none">No version</span> market has no copy of this page</li>
      <li><span class="mv-chip mv-chip--missing">Missing</span> page is tagged required-all-markets</li>
    </ul>

    <p v-if="error" class="mv-matrix__error">
      {{ error }}
    </p>

    <div v-else class="mv-matrix__scroll">
      <table class="mv-matrix__table">
        <thead>
          <tr>
            <th class="mv-matrix__page-col">
              Page (UK master)
            </th>
            <th v-for="market in summary" :key="market.slug">
              <span class="mv-matrix__market">{{ market.label }}</span>
              <span class="mv-matrix__market-note">{{ market.note }}</span>
              <span class="mv-matrix__market-count">
                {{ market.versions }} versions · {{ market.overrides }} overrides
                <strong v-if="market.stale" class="mv-matrix__warn">· {{ market.stale }} stale</strong>
                <strong v-if="market.missing" class="mv-matrix__warn">· {{ market.missing }} missing</strong>
              </span>
              <span v-if="market.unlinked" class="mv-matrix__market-note" :title="`Stories in /${market.slug}/ that Dimensions does not link to any UK page. Link them under Config → Alternative versions.`">
                {{ market.unlinked }} not linked to a UK page
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !rows.length">
            <td :colspan="summary.length + 1" class="mv-matrix__empty">
              Reading every market folder…
            </td>
          </tr>
          <tr v-for="row in visibleRows" :key="row.master.uuid">
            <th class="mv-matrix__page-col" scope="row">
              <a :href="editorUrl(row.master)" target="_blank" rel="noopener" class="mv-matrix__page">{{ row.master.name }}</a>
              <span class="mv-matrix__path">/{{ row.path }}</span>
              <span class="mv-matrix__meta">
                {{ row.blocks }} blocks ·
                {{ row.master.published_at ? `published ${ago(row.master.published_at)}` : 'never published' }}
              </span>
            </th>
            <td v-for="cell in row.cells" :key="cell.market">
              <a
                v-if="cell.story"
                :href="editorUrl(cell.story)"
                target="_blank"
                rel="noopener"
                class="mv-chip"
                :class="`mv-chip--${cell.state}`"
              >{{ LABELS[cell.state] }}</a>
              <span v-else class="mv-chip" :class="`mv-chip--${cell.state}`">{{ LABELS[cell.state] }}</span>
              <span v-if="cell.story" class="mv-matrix__meta">
                {{ cell.blocks }} blocks · changed {{ ago(Math.max(time(cell.story.published_at), time(cell.story.updated_at))) }}
                <template v-if="cell.from"> · from {{ cell.from }}</template>
                <template v-if="cell.draft"> · never published</template>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mv-matrix__foot">
      Stale compares the master's last publish with the market version's last change. Lineage comes from a <code>from-&lt;market&gt;</code> tag on the market story.
    </p>
  </section>
</template>

<style scoped>
.mv-matrix {
  max-width: 1320px;
  margin: 0 auto;
  padding: 48px 24px 72px;
  font-family: var(--font-family-body, 'Work Sans', sans-serif);
  color: #1a1a1a;
}
.mv-matrix__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 24px;
}
.mv-matrix__eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6b6b6b;
}
.mv-matrix__title {
  margin: 0 0 8px;
  font-family: 'Libre Caslon Text', Georgia, serif;
  font-size: 34px;
  font-weight: 400;
}
.mv-matrix__lede {
  margin: 0;
  max-width: 62ch;
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}
.mv-matrix__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  font-size: 13px;
}
.mv-matrix__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.mv-matrix__refresh {
  padding: 9px 20px;
  border: 1px solid #1a1a1a;
  background: #1a1a1a;
  color: #fff;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}
.mv-matrix__refresh:disabled {
  opacity: 0.5;
  cursor: progress;
}
.mv-matrix__stamp {
  color: #6b6b6b;
  font-variant-numeric: tabular-nums;
}
.mv-matrix__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  margin: 0 0 20px;
  padding: 0;
  list-style: none;
  font-size: 12px;
  color: #555;
}
.mv-matrix__legend li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.mv-matrix__error {
  padding: 16px;
  background: #fdecea;
  color: #8a1c1c;
}
.mv-matrix__scroll {
  overflow-x: auto;
  border: 1px solid #e6e2dc;
}
.mv-matrix__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.mv-matrix__table th,
.mv-matrix__table td {
  padding: 14px 16px;
  border-bottom: 1px solid #efebe5;
  text-align: left;
  vertical-align: top;
}
.mv-matrix__table thead th {
  position: sticky;
  top: 0;
  background: #f9f6f2;
  font-weight: 400;
}
.mv-matrix__page-col {
  min-width: 240px;
}
.mv-matrix__market {
  display: block;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.mv-matrix__market-note,
.mv-matrix__market-count,
.mv-matrix__path,
.mv-matrix__meta {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #6b6b6b;
  font-variant-numeric: tabular-nums;
}
.mv-matrix__warn {
  color: #9a5b00;
  font-weight: 600;
}
.mv-matrix__page {
  color: #1a1a1a;
  font-weight: 600;
  text-decoration: none;
}
.mv-matrix__page:hover {
  text-decoration: underline;
}
.mv-matrix__empty {
  color: #6b6b6b;
  text-align: center;
}
.mv-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-decoration: none;
  white-space: nowrap;
}
.mv-chip--copy {
  background: #e7f0ea;
  color: #245c3a;
}
.mv-chip--override {
  background: #e6ecf7;
  color: #22427a;
}
.mv-chip--stale {
  background: #fdf0d8;
  color: #8a5300;
}
.mv-chip--none {
  background: #f1efec;
  color: #7a756e;
}
.mv-chip--missing {
  background: #fbe3e1;
  color: #8a1c1c;
}
.mv-matrix__foot {
  margin: 16px 0 0;
  font-size: 12px;
  color: #6b6b6b;
}
</style>
