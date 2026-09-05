/* =====================================================================
   app.js — クイズの進行
   ===================================================================== */

const QUESTION_COUNT = 10;
const CHOICE_COUNT = 5;
const STORE_KEY = 'green-quiz.v1';

const $ = (id) => document.getElementById(id);

const el = {
  body: document.body,
  screens: {
    title: $('screen-title'),
    quiz: $('screen-quiz'),
    result: $('screen-result'),
    final: $('screen-final'),
  },
  best: $('best'),
  counter: $('q-counter'),
  score: $('q-score'),
  bar: $('q-bar'),
  image: $('q-image'),
  credit: $('q-credit'),
  caption: $('q-caption'),
  choices: $('q-choices'),
  feedback: $('q-feedback'),
  fbMark: $('fb-mark'),
  fbTitle: $('fb-title'),
  fbLatin: $('fb-latin'),
  fbFact: $('fb-fact'),
  next: $('btn-next'),
  rScore: $('r-score'),
  rRank: $('r-rank'),
  rComment: $('r-comment'),
  rReview: $('r-review'),
  rList: $('r-list'),
  btnFinal: $('btn-final'),
  btnRetry: $('btn-retry'),
  fEmblem: $('f-emblem'),
  fTitle: $('f-title'),
  fComment: $('f-comment'),
  fName: $('f-name'),
  fLatin: $('f-latin'),
  fFact: $('f-fact'),
};

const state = {
  questions: [],
  index: 0,
  score: 0,
  answered: false,
  misses: [],
  phase: 'title', // title | quiz | final
  finalQ: null,
};

/* ---------- 汎用 ---------- */

const byId = (id) => PLANTS.find((p) => p.id === id);

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function store(patch) {
  try {
    const cur = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    const next = { ...cur, ...patch };
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    return next;
  } catch (_) {
    return patch;
  }
}

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  } catch (_) {
    return {};
  }
}

/* ---------- 画面切り替え ---------- */

function show(name) {
  for (const [key, node] of Object.entries(el.screens)) node.hidden = key !== name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- 出題づくり ---------- */

function buildQuestions() {
  const picked = shuffle(PLANTS).slice(0, QUESTION_COUNT);
  return picked.map((plant) => {
    // 「間違えやすい植物」を優先してダミーを集める
    const near = shuffle((plant.near || []).map(byId).filter((p) => p && p.id !== plant.id));
    const rest = shuffle(PLANTS.filter((p) => p.id !== plant.id && !near.includes(p)));
    const wrong = [...near, ...rest].slice(0, CHOICE_COUNT - 1);
    const options = shuffle([plant, ...wrong]);
    return { plant, options, answer: options.indexOf(plant), picked: null };
  });
}

/* ---------- 描画 ---------- */

const COMMONS_SRC = (file, w = 900) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;
const COMMONS_PAGE = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`;

const photoURL = (item) => item.photo || (item.file ? COMMONS_SRC(item.file) : null);

/** 写真を表示。読み込みに失敗したら内蔵イラストへ切り替える。 */
function setImage(item) {
  const src = photoURL(item);
  el.credit.hidden = true;
  el.credit.innerHTML = '';

  if (!src) {
    el.image.classList.remove('is-loading');
    el.image.innerHTML = renderArt(item.id, item.tint);
    return;
  }

  el.image.innerHTML = '';
  el.image.classList.add('is-loading');
  const img = new Image();
  img.alt = '観葉植物の写真';
  img.decoding = 'async';
  img.addEventListener('load', () => el.image.classList.remove('is-loading'));
  img.addEventListener('error', () => {
    el.image.classList.remove('is-loading');
    el.image.innerHTML = renderArt(item.id, item.tint);
    item.photoFailed = true;
  });
  img.src = src;
  el.image.appendChild(img);
}

/** 出題中はファイル名が答えになるため、回答後にだけクレジットを出す */
function showCredit(item) {
  if (item.photoFailed) {
    el.credit.textContent = '写真を読み込めなかったため、イラストを表示しています';
    el.credit.hidden = false;
    return;
  }
  if (!item.file) return;
  el.credit.innerHTML =
    `写真: <a href="${COMMONS_PAGE(item.file)}" target="_blank" rel="noopener">` +
    `${item.file.replace(/_/g, ' ')}</a> — Wikimedia Commons`;
  el.credit.hidden = false;
}

/** 次の問題の写真を先読みしておく */
function preload(item) {
  const src = item && photoURL(item);
  if (src) new Image().src = src;
}

function renderQuestion() {
  const q = state.questions[state.index];
  state.answered = false;

  el.counter.textContent = `第 ${state.index + 1} 問 / ${QUESTION_COUNT}`;
  el.score.textContent = `正解 ${state.score}`;
  el.bar.style.width = `${(state.index / QUESTION_COUNT) * 100}%`;
  setImage(q.plant);
  el.caption.textContent = 'この観葉植物の名前は？';
  preload(state.questions[state.index + 1] && state.questions[state.index + 1].plant);
  el.feedback.hidden = true;

  el.choices.innerHTML = q.options
    .map((p, i) => choiceHTML(i, p.name))
    .join('');
  bindChoices((i) => answer(i));
}

function choiceHTML(i, label) {
  return (
    `<button class="choice" type="button" data-i="${i}">` +
    `<span class="key">${i + 1}</span>` +
    `<span class="choice-label">${label}</span>` +
    `</button>`
  );
}

function bindChoices(handler) {
  el.choices.querySelectorAll('.choice').forEach((btn) => {
    btn.addEventListener('click', () => handler(Number(btn.dataset.i)));
  });
}

function markChoices(answerIdx, pickedIdx) {
  el.choices.querySelectorAll('.choice').forEach((btn) => {
    const i = Number(btn.dataset.i);
    btn.disabled = true;
    if (i === answerIdx) btn.classList.add('is-ok');
    else if (i === pickedIdx) btn.classList.add('is-ng');
    else btn.classList.add('is-dim');
  });
}

/* ---------- 回答 ---------- */

function answer(i) {
  if (state.answered) return;
  state.answered = true;

  const q = state.questions[state.index];
  q.picked = i;
  const correct = i === q.answer;
  if (correct) state.score += 1;
  else state.misses.push({ plant: q.plant, chosen: q.options[i] });

  markChoices(q.answer, i);
  showCredit(q.plant);
  el.score.textContent = `正解 ${state.score}`;
  el.bar.style.width = `${((state.index + 1) / QUESTION_COUNT) * 100}%`;

  el.fbMark.textContent = correct ? '◎' : '×';
  el.fbMark.className = `fb-mark ${correct ? 'ok' : 'ng'}`;
  el.fbTitle.textContent = correct ? `正解！ ${q.plant.name}` : `正解は ${q.plant.name}`;
  el.fbLatin.textContent = q.plant.latin;
  el.fbFact.textContent = q.plant.fact;
  el.next.textContent = state.index === QUESTION_COUNT - 1 ? '結果を見る' : '次の問題へ';
  el.feedback.hidden = false;
  el.next.focus({ preventScroll: true });
}

function nextQuestion() {
  if (state.index < QUESTION_COUNT - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    showResult();
  }
}

/* ---------- 結果 ---------- */

const RANKS = [
  { min: 10, rank: 'パーフェクト！', comment: '全問正解です。ここからは本気の1問、ファイナル問題へどうぞ。' },
  { min: 8,  rank: 'グリーンマスター', comment: 'かなりの目利き。あと少しで全問正解、もう一度挑戦してみては？' },
  { min: 6,  rank: '観葉植物ずき', comment: 'よく知っています。間違えた植物を覚えれば一気に上級者。' },
  { min: 3,  rank: 'グリーン見習い', comment: 'ここからが伸びしろ。葉の形に注目すると見分けやすくなります。' },
  { min: 0,  rank: 'これから育てよう', comment: 'まずは葉の形と全体のシルエットから覚えていきましょう。' },
];

function showResult() {
  const perfect = state.score === QUESTION_COUNT;
  const r = RANKS.find((x) => state.score >= x.min);

  el.rScore.textContent = String(state.score);
  el.rRank.textContent = r.rank;
  el.rComment.textContent = r.comment;

  if (state.misses.length) {
    el.rList.innerHTML = state.misses
      .map((m) =>
        `<li>${m.plant.name}<br><span class="yours">あなたの回答：${m.chosen.name}</span> ` +
        `→ <span class="right">正解</span></li>`)
      .join('');
    el.rReview.hidden = false;
  } else {
    el.rReview.hidden = true;
  }

  el.btnFinal.hidden = !perfect;
  if (perfect) FINALS.forEach(preload);
  el.btnRetry.textContent = perfect ? 'ファイナルに挑まずやり直す' : 'もう一度あそぶ';

  const saved = loadStore();
  if (!saved.best || state.score > saved.best) store({ best: state.score });
  show('result');
}

function renderBest() {
  const saved = loadStore();
  const parts = [];
  if (typeof saved.best === 'number') parts.push(`ベストスコア ${saved.best} / ${QUESTION_COUNT}`);
  if (saved.master) parts.push('称号：観葉植物マスター 🏆');
  if (parts.length) {
    el.best.textContent = parts.join('　/　');
    el.best.hidden = false;
  }
}

/* ---------- ファイナル問題 ---------- */

function startFinal() {
  state.phase = 'final';
  state.answered = false;
  state.finalQ = FINALS[Math.floor(Math.random() * FINALS.length)];
  const q = state.finalQ;

  el.body.classList.add('final-mode');
  el.counter.textContent = 'FINAL QUESTION';
  el.score.textContent = '難易度：★★★';
  el.bar.style.width = '100%';
  setImage(q);
  el.caption.innerHTML =
    `<span class="final-badge">FINAL</span><br>この植物の名前は？` +
    `<span class="hint">ヒント：${q.hint}</span>`;
  el.feedback.hidden = true;
  el.choices.innerHTML = q.choices.map((label, i) => choiceHTML(i, label)).join('');
  bindChoices((i) => answerFinal(i));
  show('quiz');
}

function answerFinal(i) {
  if (state.answered) return;
  state.answered = true;

  const q = state.finalQ;
  const correct = i === q.answer;
  markChoices(q.answer, i);
  showCredit(q);

  el.fbMark.textContent = correct ? '◎' : '×';
  el.fbMark.className = `fb-mark ${correct ? 'ok' : 'ng'}`;
  el.fbTitle.textContent = correct ? `正解！ ${q.name}` : `正解は ${q.name}`;
  el.fbLatin.textContent = q.latin;
  el.fbFact.textContent = q.fact;
  el.next.textContent = '結果を見る';
  el.feedback.hidden = false;
  el.next.focus({ preventScroll: true });

  state.finalCorrect = correct;
  if (correct) store({ master: true });
}

function showFinalResult() {
  const q = state.finalQ;
  const win = state.finalCorrect;

  el.fEmblem.textContent = win ? '🏆' : '🌿';
  el.fTitle.textContent = win ? '称号「観葉植物マスター」獲得！' : 'おしい！ あと一歩';
  el.fComment.textContent = win
    ? '全11問パーフェクト。植物園でも堂々と語れるレベルです。'
    : '本編は全問正解、ファイナルだけ不正解でした。この1種を覚えれば次は完全制覇です。';
  el.fName.textContent = q.name;
  el.fLatin.textContent = q.latin;
  el.fFact.textContent = q.fact;

  el.body.classList.remove('final-mode');
  show('final');
}

/* ---------- 開始・リセット ---------- */

function startQuiz() {
  state.questions = buildQuestions();
  state.index = 0;
  state.score = 0;
  state.misses = [];
  state.phase = 'quiz';
  state.finalQ = null;
  state.finalCorrect = false;
  el.body.classList.remove('final-mode');
  renderQuestion();
  show('quiz');
}

function goTitle() {
  el.body.classList.remove('final-mode');
  renderBest();
  show('title');
}

/* ---------- イベント ---------- */

$('btn-start').addEventListener('click', startQuiz);
$('btn-retry').addEventListener('click', startQuiz);
$('btn-final').addEventListener('click', startFinal);
$('btn-restart').addEventListener('click', startQuiz);
el.next.addEventListener('click', () => {
  if (state.phase === 'final') showFinalResult();
  else nextQuestion();
});

document.addEventListener('keydown', (e) => {
  if (el.screens.quiz.hidden) return;
  if (!state.answered && e.key >= '1' && e.key <= String(CHOICE_COUNT)) {
    const btn = el.choices.querySelector(`.choice[data-i="${Number(e.key) - 1}"]`);
    if (btn) btn.click();
  } else if (state.answered && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    el.next.click();
  }
});

renderBest();
