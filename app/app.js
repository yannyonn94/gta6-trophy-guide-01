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
  const hidden = spoiler && t.kind === 'story' && !isEarned;
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
  desc.textContent = hidden ? 'A story trophy. Its name and description stay hidden until you earn it.' : t.description;
  title.append(name, desc);
  const badge = document.createElement('span');
  badge.className = 'grade grade-' + t.grade;
  badge.textContent = gradeIcon(t.grade) + ' ' + GRADE_LABEL[t.grade];
  head.append(box, title, badge);
  card.append(head);
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = KIND_LABEL[t.kind] + (t.missable ? ' · ⚠ Missable — do before the final mission' : '');
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
