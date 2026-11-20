// GTA VI trophy guide and tracker: a checklist over the 55 official trophies with
// progress saved in localStorage, export/import, filters by grade/kind/status, text
// search, a spoiler setting, a roadmap and a missables list. All data is local.
const KEY = 'gta6-trophy-checklist';
const SPOILER_KEY = 'gta6-trophy-spoiler';
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

const $ = (id) => document.getElementById(id);
const listEl = $('list');
const missableEl = $('missableList');

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let spoiler = localStorage.getItem(SPOILER_KEY) !== '0';
$('spoiler').checked = spoiler;

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = {
  story: 'Story', collectible: 'Collectible', activity: 'Activity', combat: 'Combat & heists',
  exploration: 'Exploration', grind: 'Grind & money', choice: 'Choice & missable', platinum: 'Platinum',
};

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function gradeIcon(grade) {
  return { platinum: '◆', gold: '●', silver: '●', bronze: '●' }[grade] ?? '●';
}

function trophyCard(t) {
  const isEarned = earned.has(t.name);
  // Spoiler hiding follows the official hidden flag, not the kind: 28 trophies
  // are hidden on PSN (story and chapter trophies, contact-strand finales,
  // choice trophies, and the deliberately cryptic one-liners), and several of
  // them are activities or combat, not story.
  const hidden = spoiler && t.hidden && !isEarned;
  const card = document.createElement('article');
  card.className = 'card' + (isEarned ? ' earned' : '');
  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    save();
    render();
  });
  const title = document.createElement('div');
  const name = document.createElement('h3');
  name.textContent = hidden ? 'Hidden trophy — earn it to reveal' : t.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'A hidden trophy. Its name and description stay hidden until you earn it.' : t.description;
  title.append(name, desc);
  const badge = document.createElement('span');
  badge.className = 'grade grade-' + t.grade;
  badge.textContent = gradeIcon(t.grade) + ' ' + GRADE_LABEL[t.grade];
  head.append(box, title, badge);
  card.append(head);
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = KIND_LABEL[t.kind] + (t.missable ? ' · ⚠ Missable — do before the final mission' : '')
    + (t.hidden && !isEarned ? ' · Hidden on PSN' : '');
  card.append(meta);
  const guide = document.createElement('p');
  guide.className = 'guide';
  const guideLabel = document.createElement('strong');
  guideLabel.textContent = 'Guide: ';
  guide.append(guideLabel, document.createTextNode(hidden ? 'Hidden until earned.' : t.guide));
  card.append(guide);
  const src = document.createElement('p');
  src.className = 'source';
  src.textContent = 'Source: ' + t.source;
  card.append(src);
  return card;
}

// Per-grade progress detail: earned/total and a small bar for each grade, so
// the player can see at a glance which grade is holding the platinum back.
function renderGradeDetail(byGrade) {
  const el = $('gradeDetail');
  if (!el) return;
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  el.replaceChildren(...['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const row = document.createElement('div');
    row.className = 'grade-row';
    const label = document.createElement('span');
    label.className = 'grade-row-label';
    label.textContent = GRADE_LABEL[g];
    const bar = document.createElement('span');
    bar.className = 'grade-row-bar';
    const fill = document.createElement('span');
    fill.className = 'grade-row-fill grade-' + g;
    fill.style.width = ((byGrade[g] ?? 0) / totals[g]) * 100 + '%';
    bar.append(fill);
    const count = document.createElement('span');
    count.className = 'grade-row-count';
    count.textContent = (byGrade[g] ?? 0) + '/' + totals[g];
    row.append(label, bar, count);
    return row;
  }));
}

// Roadmap phase progress: each phase is a slice of the trophy list, so the
// roadmap can show earned/total per phase and mark the first unfinished one
// as the phase to work on now.
const PHASES = [
  { n: 1, title: 'Story', match: (t) => t.kind === 'story' },
  { n: 2, title: 'Missables', match: (t) => t.missable },
  { n: 3, title: 'Activities', match: (t) => t.kind === 'activity' },
  { n: 4, title: 'Collectibles & exploration', match: (t) => t.kind === 'collectible' || t.kind === 'exploration' },
  { n: 5, title: 'Combat, heists & money', match: (t) => t.kind === 'combat' || t.kind === 'grind' },
  { n: 6, title: 'Platinum', match: (t) => t.kind === 'platinum' },
];

function renderPhaseProgress() {
  const el = $('phaseProgress');
  if (!el) return;
  const firstOpen = PHASES.find((p) => trophies.some((t) => p.match(t) && !earned.has(t.name)));
  el.replaceChildren(...PHASES.map((p) => {
    const inPhase = trophies.filter(p.match);
    const done = inPhase.filter((t) => earned.has(t.name)).length;
    const item = document.createElement('div');
    item.className = 'phase' + (done === inPhase.length ? ' phase-done' : '')
      + (firstOpen && p.n === firstOpen.n ? ' phase-current' : '');
    const num = document.createElement('span');
    num.className = 'phase-num';
    num.textContent = done === inPhase.length ? '✓' : String(p.n);
    const body = document.createElement('div');
    body.className = 'phase-body';
    const title = document.createElement('strong');
    title.textContent = 'Phase ' + p.n + ' — ' + p.title;
    const bar = document.createElement('span');
    bar.className = 'phase-bar';
    const fill = document.createElement('span');
    fill.style.width = (done / inPhase.length) * 100 + '%';
    bar.append(fill);
    const count = document.createElement('span');
    count.className = 'phase-count';
    count.textContent = done + '/' + inPhase.length + ' earned'
      + (firstOpen && p.n === firstOpen.n ? ' · work on this now' : '');
    body.append(title, bar, count);
    item.append(num, body);
    return item;
  }));
}

function filtered() {
  const q = $('search').value.trim().toLowerCase();
  const g = $('grade').value;
  const k = $('kind').value;
  const s = $('status').value;
  return trophies.filter((t) => {
    if (g !== 'all' && t.grade !== g) return false;
    if (k !== 'all' && t.kind !== k) return false;
    if (s === 'earned' && !earned.has(t.name)) return false;
    if (s === 'unearned' && earned.has(t.name)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function render() {
  const shown = filtered();
  listEl.replaceChildren(...shown.map(trophyCard));
  $('count').textContent = shown.length + ' of ' + trophies.length + ' trophies shown';
  const total = trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  $('progressText').textContent = n + ' of ' + total + ' earned';
  $('ringText').textContent = pct + '%';
  $('ring').style.setProperty('--pct', pct + '%');
  $('barFill').style.width = pct + '%';
  const byGrade = {};
  for (const t of trophies) if (earned.has(t.name)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  $('gradeText').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => (byGrade[g] ?? 0) + ' ' + g).join(' · ');
  renderGradeDetail(byGrade);
  // Per-kind progress, so the player can see which part of the game is left.
  let kindLine = document.getElementById('kindText');
  if (!kindLine) {
    kindLine = document.createElement('p');
    kindLine.id = 'kindText';
    kindLine.className = 'muted';
    $('gradeText').after(kindLine);
  }
  const kindTotals = {};
  const kindEarned = {};
  for (const t of trophies) {
    kindTotals[t.kind] = (kindTotals[t.kind] ?? 0) + 1;
    if (earned.has(t.name)) kindEarned[t.kind] = (kindEarned[t.kind] ?? 0) + 1;
  }
  kindLine.textContent = Object.keys(kindTotals)
    .map((k) => KIND_LABEL[k] + ' ' + (kindEarned[k] ?? 0) + '/' + kindTotals[k]).join(' · ');
  const next = trophies.find((t) => !earned.has(t.name) && t.missable)
    ?? trophies.find((t) => !earned.has(t.name));
  $('nextUp').textContent = next
    ? 'Next up: ' + next.name + (next.missable ? ' (missable — do it soon)' : '')
    : 'All 55 earned — the platinum is yours.';
  missableEl.replaceChildren(...trophies.filter((t) => t.missable).map(trophyCard));
  renderPhaseProgress();
}

document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tabpage').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + btn.dataset.tab));
  });
});

for (const id of ['search', 'grade', 'kind', 'status']) $(id).addEventListener('input', render);
$('spoiler').addEventListener('change', (e) => {
  spoiler = e.target.checked;
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
  render();
});
$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned])], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const names = JSON.parse(await file.text());
  earned = new Set(names.filter((n) => trophies.some((t) => t.name === n)));
  save();
  render();
});
$('reset').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies?')) return;
  earned = new Set();
  save();
  render();
});
render();
