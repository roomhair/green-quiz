/* =====================================================================
   art.js — 観葉植物のイラスト（インラインSVG）
   ---------------------------------------------------------------------
   写真ファイル（images/*.jpg など）を用意した場合は plants.js の
   photo プロパティを設定してください。photo があればそちらが優先され、
   無い場合にここで描画するイラストが使われます。
   ===================================================================== */

const C = {
  dark:  '#1c4529',
  deep:  '#276b3c',
  mid:   '#3a8a4c',
  leaf:  '#4c9d59',
  light: '#6fba6b',
  pale:  '#9ed08a',
  lime:  '#c3dd8c',
  silver:'#9dbfa4',
  cream: '#efe7d3',
};

/* ---------- 小さなユーティリティ ---------- */

const rad = (deg) => (deg * Math.PI) / 180;

/** グループ（平行移動・回転・拡大） */
function g(inner, { x = 0, y = 0, rot = 0, scale = 1 } = {}) {
  const t = [
    `translate(${round(x)} ${round(y)})`,
    rot ? `rotate(${round(rot)})` : '',
    scale !== 1 ? `scale(${round(scale)})` : '',
  ].filter(Boolean).join(' ');
  return `<g transform="${t}">${inner}</g>`;
}

const round = (n) => Math.round(n * 100) / 100;

/** 標準的な葉（根元 0,0 から上方向へ len 伸びる） */
function leaf({ len = 60, w = 18, curve = 0, fill = C.mid, vein = true, edge = null } = {}) {
  const d =
    `M0 0 C ${w} ${-len * 0.22} ${curve + w * 0.72} ${-len * 0.74} ${curve} ${-len} ` +
    `C ${curve - w * 0.72} ${-len * 0.74} ${-w} ${-len * 0.22} 0 0 Z`;
  let s = `<path d="${d}" fill="${fill}"${edge ? ` stroke="${edge}" stroke-width="1.6"` : ''}/>`;
  if (vein) {
    s += `<path d="M0 -2 Q ${curve * 0.35} ${-len * 0.55} ${curve} ${-len + 2}" fill="none" ` +
         `stroke="rgba(255,255,255,.28)" stroke-width="1.3" stroke-linecap="round"/>`;
  }
  return s;
}

/** ハート型の葉（モンステラ幼葉・ポトス・ウンベラータなど） */
function heartLeaf({ len = 60, w = 34, curve = 0, fill = C.mid, vein = true } = {}) {
  const n = -len * 0.1; // 基部の切れ込み
  const d =
    `M0 ${n} C ${w * 0.95} ${n * 0.2} ${w * 0.98} ${-len * 0.72} ${curve} ${-len} ` +
    `C ${curve - w * 0.98} ${-len * 0.72} ${-w * 0.95} ${n * 0.2} 0 ${n} Z`;
  let s = `<path d="M0 0 L0 ${n}" stroke="${C.deep}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
  s += `<path d="${d}" fill="${fill}"/>`;
  if (vein) {
    s += `<path d="M0 ${n} Q ${curve * 0.4} ${-len * 0.6} ${curve} ${-len + 3}" fill="none" ` +
         `stroke="rgba(255,255,255,.3)" stroke-width="1.4" stroke-linecap="round"/>`;
    for (let i = 1; i <= 3; i++) {
      const t = 0.22 + i * 0.2;
      const y = n + (-len - n) * t;
      const sp = w * (0.9 - t * 0.55);
      s += `<path d="M${curve * t} ${y} l ${sp} ${-len * 0.1}" stroke="rgba(255,255,255,.22)" stroke-width="1" fill="none"/>`;
      s += `<path d="M${curve * t} ${y} l ${-sp} ${-len * 0.1}" stroke="rgba(255,255,255,.22)" stroke-width="1" fill="none"/>`;
    }
  }
  return s;
}

/** モンステラの葉（深い切れ込み＝羽状裂葉） */
function monsteraLeaf({ len = 70, w = 30, fill = C.deep } = {}) {
  let s = `<path d="M0 0 L0 ${-len}" stroke="${fill}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`;
  const n = 5;
  for (let i = 0; i < n; i++) {
    const t = 0.14 + (i * 0.62) / (n - 1);
    const y = -len * t;
    const lw = w * (1 - Math.abs(t - 0.42) * 0.85);
    const ry = len * 0.085;
    for (const sgn of [1, -1]) {
      s += g(
        `<ellipse cx="${round(lw * 0.6)}" cy="0" rx="${round(lw * 0.62)}" ry="${round(ry)}" fill="${fill}"/>`,
        { y, rot: sgn > 0 ? -22 : 202, scale: 1 }
      );
    }
  }
  // 先端の葉身
  s += g(`<path d="M0 0 C ${w * 0.7} ${-len * 0.05} ${w * 0.5} ${-len * 0.2} 0 ${-len * 0.26} ` +
         `C ${-w * 0.5} ${-len * 0.2} ${-w * 0.7} ${-len * 0.05} 0 0 Z" fill="${fill}"/>`,
         { y: -len * 0.76 });
  return s;
}

/** 掌状複葉（パキラ・シェフレラ） */
function palmate({ n = 6, len = 30, w = 9, fill = C.mid, spread = 150 } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = -spread / 2 + (spread * i) / (n - 1);
    const l = len * (1 - Math.abs(a) / 260);
    s += g(leaf({ len: l, w, fill, curve: a * 0.03 }), { rot: a });
  }
  return s;
}

/** 羽状複葉（エバーフレッシュ・テーブルヤシ・アジアンタム） */
function pinnate({ len = 60, pairs = 7, lw = 12, lh = 4.6, fill = C.leaf, bend = 18, round: rnd = false } = {}) {
  let s = `<path d="M0 0 Q ${bend * 0.3} ${-len * 0.55} ${bend} ${-len}" fill="none" stroke="${C.deep}" stroke-width="1.8" stroke-linecap="round"/>`;
  for (let i = 0; i < pairs; i++) {
    const t = 0.12 + (i * 0.85) / (pairs - 1);
    const y = -len * t;
    const x = bend * t * t;
    const k = 1 - Math.abs(t - 0.5) * 0.6;
    for (const sgn of [1, -1]) {
      s += rnd
        ? g(`<path d="M0 0 C 10 -7 ${lw * 1.3} -6 ${lw * 1.35} 3 C ${lw * 0.8} 6 6 6 0 0 Z" fill="${fill}"/>`,
            { x, y, rot: sgn > 0 ? -18 : 198 })
        : g(`<ellipse cx="${round(lw * k * 0.55)}" cy="0" rx="${round(lw * k * 0.55)}" ry="${lh}" fill="${fill}"/>`,
            { x, y, rot: sgn > 0 ? -16 : 196 });
    }
  }
  return s;
}

/* ---------- 鉢 ---------- */

const POT_STYLE = {
  terracotta: { body: '#c1734a', rim: '#a9603c', shade: '#8f4d2f' },
  white:      { body: '#e9e5df', rim: '#d7d1c8', shade: '#c3bcb1' },
  gray:       { body: '#8f9490', rim: '#7b807c', shade: '#666b68' },
  basket:     { body: '#cda36b', rim: '#b98d55', shade: '#9d7442' },
  black:      { body: '#3d423f', rim: '#2e3230', shade: '#222624' },
  bowl:       { body: '#a8836a', rim: '#8e6c54', shade: '#75563f' },
};

function pot(kind = 'terracotta', { cx = 100, top = 150, h = 42, w = 62, soil = true } = {}) {
  const p = POT_STYLE[kind] || POT_STYLE.terracotta;
  const bw = w * 0.74;
  const rimH = kind === 'bowl' ? 6 : 9;
  let s = '';
  if (soil) s += `<ellipse cx="${cx}" cy="${top + 2}" rx="${w / 2 - 3}" ry="6" fill="#4b3a2a"/>`;
  s += `<path d="M${cx - w / 2} ${top} L${cx + w / 2} ${top} L${cx + bw / 2} ${top + h} ` +
       `Q ${cx} ${top + h + 5} ${cx - bw / 2} ${top + h} Z" fill="${p.body}"/>`;
  s += `<path d="M${cx + w * 0.16} ${top} L${cx + w / 2} ${top} L${cx + bw / 2} ${top + h} ` +
       `Q ${cx + bw * 0.3} ${top + h + 3.5} ${cx + bw * 0.16} ${top + h - 0.5} Z" fill="${p.shade}" opacity=".45"/>`;
  s += `<rect x="${cx - w / 2 - 3}" y="${top - rimH}" width="${w + 6}" height="${rimH + 2}" rx="3" fill="${p.rim}"/>`;
  if (kind === 'basket') {
    for (let i = 1; i < 4; i++) {
      const y = top + (h * i) / 4;
      const ww = w - ((w - bw) * i) / 4;
      s += `<line x1="${cx - ww / 2}" y1="${y}" x2="${cx + ww / 2}" y2="${y}" stroke="${p.shade}" stroke-width="1.6" opacity=".55"/>`;
    }
  }
  return s;
}

/** 幹 */
function trunk({ x = 100, top = 70, bottom = 152, w = 9, color = '#a98d6b', color2 = '#8a7053', bend = 0 } = {}) {
  const d = `M${x - w / 2} ${bottom} C ${x - w / 2 + bend * 0.5} ${(top + bottom) / 2} ${x - w * 0.35 + bend} ${top + 10} ${x + bend} ${top} ` +
            `C ${x + w * 0.35 + bend} ${top + 10} ${x + w / 2 + bend * 0.5} ${(top + bottom) / 2} ${x + w / 2} ${bottom} Z`;
  return `<path d="${d}" fill="${color}"/>` +
         `<path d="M${x + bend * 0.5} ${bottom} C ${x + bend * 0.8} ${(top + bottom) / 2} ${x + w * 0.2 + bend} ${top + 12} ${x + bend} ${top + 2}" ` +
         `fill="none" stroke="${color2}" stroke-width="${w * 0.28}" opacity=".5"/>`;
}

/* ---------- 背景 ---------- */

function backdrop(tint = '#e7f0e3') {
  return `<rect width="200" height="200" fill="${tint}"/>` +
         `<circle cx="100" cy="96" r="74" fill="rgba(255,255,255,.55)"/>` +
         `<ellipse cx="100" cy="186" rx="70" ry="9" fill="rgba(60,80,60,.13)"/>`;
}

/* =====================================================================
   植物ごとの絵
   ===================================================================== */

const ART = {
  /* モンステラ ------------------------------------------------------ */
  monstera() {
    let s = pot('terracotta', { top: 150, h: 40, w: 60 });
    const spec = [
      { x: 100, y: 150, rot: 0,   len: 78, w: 34, f: C.deep },
      { x: 100, y: 150, rot: -38, len: 66, w: 29, f: C.mid },
      { x: 100, y: 150, rot: 38,  len: 68, w: 30, f: C.mid },
      { x: 100, y: 150, rot: -68, len: 52, w: 24, f: C.leaf },
      { x: 100, y: 150, rot: 66,  len: 54, w: 25, f: C.leaf },
    ];
    for (const l of spec) {
      s += g(`<path d="M0 0 Q ${l.rot * 0.15} -18 0 -26" stroke="${C.deep}" stroke-width="2.6" fill="none"/>` +
             g(monsteraLeaf({ len: l.len, w: l.w, fill: l.f }), { y: -26 }),
             { x: l.x, y: l.y, rot: l.rot });
    }
    return s;
  },

  /* サンスベリア ---------------------------------------------------- */
  sansevieria() {
    let s = pot('gray', { top: 150, h: 40, w: 54 });
    const blades = [
      { rot: -26, len: 96, w: 9 }, { rot: -13, len: 118, w: 10 },
      { rot: 0,   len: 128, w: 11 }, { rot: 12, len: 112, w: 10 },
      { rot: 25,  len: 88, w: 9 }, { rot: -38, len: 70, w: 8 }, { rot: 37, len: 66, w: 8 },
    ];
    for (const b of blades) {
      const inner =
        `<path d="M0 0 C ${b.w} ${-b.len * 0.3} ${b.w * 0.7} ${-b.len * 0.8} 0 ${-b.len} ` +
        `C ${-b.w * 0.7} ${-b.len * 0.8} ${-b.w} ${-b.len * 0.3} 0 0 Z" fill="${C.dark}" stroke="#cbc06a" stroke-width="2"/>` +
        [0.25, 0.42, 0.58, 0.74, 0.88].map((t) =>
          `<path d="M${-b.w * 0.62 * (1 - t)} ${-b.len * t} q ${b.w * 0.62 * (1 - t)} ${-5} ${b.w * 1.24 * (1 - t)} 0" ` +
          `fill="none" stroke="${C.silver}" stroke-width="2.4" opacity=".55"/>`).join('');
      s += g(inner, { x: 100, y: 152, rot: b.rot });
    }
    return s;
  },

  /* ポトス（吊り鉢） ------------------------------------------------ */
  pothos() {
    let s = `<path d="M62 8 L100 46 L138 8" fill="none" stroke="#8d8477" stroke-width="2"/>`;
    s += pot('white', { top: 46, h: 34, w: 56 });
    const vines = [
      { x: 78,  dir: -1, n: 5, len: 92 },
      { x: 100, dir: 1,  n: 6, len: 108 },
      { x: 122, dir: 1,  n: 4, len: 74 },
    ];
    for (const v of vines) {
      s += `<path d="M${v.x} 78 Q ${v.x + v.dir * 26} ${78 + v.len * 0.6} ${v.x + v.dir * 10} ${78 + v.len}" ` +
           `fill="none" stroke="${C.deep}" stroke-width="2"/>`;
      for (let i = 0; i < v.n; i++) {
        const t = 0.12 + (i * 0.82) / (v.n - 1);
        const x = v.x + v.dir * (26 * 2 * t * (1 - t) + 10 * t * t);
        const y = 78 + v.len * t;
        const side = i % 2 ? 1 : -1;
        const fill = i % 3 === 0 ? C.lime : C.light;
        s += g(heartLeaf({ len: 26, w: 15, fill, vein: false }), { x, y, rot: 180 + side * 52 });
      }
    }
    return s;
  },

  /* パキラ（編み込み幹） -------------------------------------------- */
  pachira() {
    let s = pot('white', { top: 150, h: 40, w: 58 });
    // 編み込み
    for (let i = 0; i < 3; i++) {
      const ph = (i * Math.PI * 2) / 3;
      let d = `M${100 + Math.sin(ph) * 8} 150`;
      for (let y = 150; y >= 92; y -= 6) {
        const t = (150 - y) / 58;
        d += ` L${round(100 + Math.sin(ph + t * 6.6) * 8 * (1 - t * 0.35))} ${y}`;
      }
      s += `<path d="${d}" fill="none" stroke="${i === 1 ? '#8a7053' : '#a98d6b'}" stroke-width="7" stroke-linecap="round"/>`;
    }
    const heads = [
      { x: 100, y: 88, r: 0, sc: 1 }, { x: 76, y: 100, r: -30, sc: .8 },
      { x: 124, y: 100, r: 28, sc: .8 }, { x: 88, y: 74, r: -14, sc: .72 },
      { x: 114, y: 76, r: 16, sc: .72 },
    ];
    for (const h of heads) {
      s += g(palmate({ n: 6, len: 34, w: 8.5, fill: h.sc > .9 ? C.mid : C.leaf, spread: 165 }),
             { x: h.x, y: h.y, rot: h.r, scale: h.sc });
    }
    return s;
  },

  /* ガジュマル ------------------------------------------------------ */
  gajumaru() {
    let s = pot('bowl', { top: 156, h: 30, w: 66 });
    // 太い気根の幹
    s += `<path d="M74 156 C 76 128 84 120 86 104 L114 104 C 116 122 124 130 126 156 Z" fill="#cbbaa2"/>`;
    s += `<path d="M84 156 C 86 134 90 126 92 108" fill="none" stroke="#b0a087" stroke-width="4" opacity=".8"/>`;
    s += `<path d="M112 156 C 114 136 118 126 120 110" fill="none" stroke="#b0a087" stroke-width="4" opacity=".8"/>`;
    s += `<path d="M86 104 q 14 -8 28 0 z" fill="#b3a289"/>`;
    // 樹冠
    const canopy = [
      [100, 70, 34], [76, 84, 24], [124, 84, 24], [86, 62, 20], [116, 62, 20], [100, 92, 22],
    ];
    for (const [cx, cy, r] of canopy) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.deep}"/>`;
    for (const [cx, cy, r] of canopy) s += `<circle cx="${cx - r * 0.2}" cy="${cy - r * 0.25}" r="${r * 0.62}" fill="${C.mid}" opacity=".85"/>`;
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const cx = 100 + Math.cos(a) * (30 + (i % 3) * 8);
      const cy = 76 + Math.sin(a) * (22 + (i % 4) * 5);
      s += `<ellipse cx="${round(cx)}" cy="${round(cy)}" rx="5.5" ry="4" fill="${i % 2 ? C.light : C.leaf}" transform="rotate(${round(a * 30)} ${round(cx)} ${round(cy)})"/>`;
    }
    return s;
  },

  /* フィカス・ウンベラータ ------------------------------------------ */
  umbellata() {
    let s = pot('basket', { top: 152, h: 40, w: 62 });
    s += trunk({ x: 100, top: 60, bottom: 152, w: 9, bend: -6 });
    const leaves = [
      { x: 78,  y: 118, rot: -58, len: 44, w: 26 },
      { x: 122, y: 110, rot: 56,  len: 46, w: 27 },
      { x: 74,  y: 92,  rot: -74, len: 40, w: 24 },
      { x: 126, y: 84,  rot: 72,  len: 42, w: 25 },
      { x: 86,  y: 66,  rot: -34, len: 48, w: 28 },
      { x: 110, y: 60,  rot: 30,  len: 50, w: 29 },
      { x: 96,  y: 50,  rot: -6,  len: 46, w: 27 },
    ];
    for (const l of leaves) {
      s += g(heartLeaf({ len: l.len, w: l.w, fill: C.leaf, curve: 0 }), { x: l.x, y: l.y, rot: l.rot });
    }
    return s;
  },

  /* ゴムの木（フィカス・エラスティカ） ------------------------------ */
  ficusElastica() {
    let s = pot('black', { top: 152, h: 40, w: 56 });
    s += trunk({ x: 100, top: 52, bottom: 152, w: 8, color: '#9c8163', color2: '#7d6549' });
    const spec = [
      { y: 138, rot: -70 }, { y: 132, rot: 74 }, { y: 116, rot: -62 }, { y: 108, rot: 66 },
      { y: 94, rot: -54 }, { y: 86, rot: 58 }, { y: 72, rot: -42 }, { y: 64, rot: 46 }, { y: 54, rot: 4 },
    ];
    for (const l of spec) {
      const len = 40 - (150 - l.y) * 0.06;
      s += g(leaf({ len, w: 15, fill: '#1f4a30', curve: 4 }), { x: 100, y: l.y, rot: l.rot });
      s += g(`<path d="M0 -4 L0 ${-len + 3}" stroke="#c46a5a" stroke-width="1.2" opacity=".7" fill="none"/>`,
             { x: 100, y: l.y, rot: l.rot });
    }
    return s;
  },

  /* アロエ ---------------------------------------------------------- */
  aloe() {
    let s = pot('terracotta', { top: 152, h: 38, w: 58 });
    const blades = [
      { rot: 0, len: 92 }, { rot: -20, len: 84 }, { rot: 20, len: 82 },
      { rot: -40, len: 70 }, { rot: 40, len: 68 }, { rot: -58, len: 54 }, { rot: 58, len: 52 },
      { rot: -74, len: 40 }, { rot: 74, len: 38 },
    ];
    for (const b of blades) {
      const w = 12 - b.len * 0.03;
      const inner =
        `<path d="M0 0 C ${w} ${-b.len * 0.35} ${w * 0.55} ${-b.len * 0.82} 0 ${-b.len} ` +
        `C ${-w * 0.55} ${-b.len * 0.82} ${-w} ${-b.len * 0.35} 0 0 Z" fill="#79a86d"/>` +
        `<path d="M0 -3 L0 ${-b.len + 4}" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>` +
        [0.3, 0.5, 0.7].map((t) =>
          `<circle cx="${round(w * 0.5 * (1 - t))}" cy="${-b.len * t}" r="1.5" fill="#e6efd6"/>` +
          `<circle cx="${round(-w * 0.5 * (1 - t))}" cy="${-b.len * t}" r="1.5" fill="#e6efd6"/>`).join('');
      s += g(inner, { x: 100, y: 154, rot: b.rot });
    }
    return s;
  },

  /* オリヅルラン ---------------------------------------------------- */
  chlorophytum() {
    let s = `<path d="M64 14 L100 44 L136 14" fill="none" stroke="#8d8477" stroke-width="2"/>`;
    s += pot('white', { top: 44, h: 32, w: 54 });
    const arcs = [
      { dir: -1, sp: 44, dy: 74 }, { dir: 1, sp: 46, dy: 78 }, { dir: -1, sp: 30, dy: 56 },
      { dir: 1, sp: 32, dy: 58 }, { dir: -1, sp: 58, dy: 40 }, { dir: 1, sp: 60, dy: 44 },
      { dir: -1, sp: 16, dy: 88 }, { dir: 1, sp: 18, dy: 90 },
    ];
    for (const a of arcs) {
      const x2 = 100 + a.dir * a.sp, y2 = 72 + a.dy;
      s += `<path d="M100 68 Q ${100 + a.dir * a.sp * 1.15} ${72 + a.dy * 0.25} ${x2} ${y2}" ` +
           `fill="none" stroke="${C.light}" stroke-width="5.5" stroke-linecap="round"/>`;
      s += `<path d="M100 68 Q ${100 + a.dir * a.sp * 1.15} ${72 + a.dy * 0.25} ${x2} ${y2}" ` +
           `fill="none" stroke="#f0f2cf" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    // ランナーと子株
    s += `<path d="M104 70 Q 152 92 150 130" fill="none" stroke="#b6c98c" stroke-width="1.8"/>`;
    for (const r of [-30, -8, 16, 40]) {
      s += g(`<path d="M0 0 Q 6 -14 2 -26" fill="none" stroke="${C.light}" stroke-width="3.4" stroke-linecap="round"/>`,
             { x: 150, y: 132, rot: r });
    }
    return s;
  },

  /* シェフレラ ------------------------------------------------------ */
  schefflera() {
    let s = pot('gray', { top: 152, h: 40, w: 56 });
    const stems = [
      { x: 100, y: 74, r: 0 }, { x: 74, y: 96, r: -26 }, { x: 126, y: 92, r: 24 },
      { x: 86, y: 62, r: -12 }, { x: 116, y: 60, r: 14 }, { x: 100, y: 110, r: 2 },
    ];
    for (const st of stems) {
      s += `<path d="M100 152 Q ${(100 + st.x) / 2} ${(152 + st.y) / 2} ${st.x} ${st.y}" fill="none" stroke="${C.deep}" stroke-width="2.4"/>`;
    }
    for (const st of stems) {
      s += g(palmate({ n: 7, len: 26, w: 8, fill: C.deep, spread: 250 }), { x: st.x, y: st.y, rot: st.r });
      s += g(palmate({ n: 7, len: 22, w: 6.4, fill: C.leaf, spread: 250 }), { x: st.x, y: st.y, rot: st.r });
    }
    return s;
  },

  /* ドラセナ・マッサンゲアナ（幸福の木） ---------------------------- */
  dracaena() {
    let s = pot('white', { top: 154, h: 38, w: 58 });
    const canes = [{ x: 90, top: 108, h: 46, w: 15 }, { x: 112, top: 84, h: 70, w: 17 }];
    for (const c of canes) {
      s += `<rect x="${c.x - c.w / 2}" y="${c.top}" width="${c.w}" height="${c.h}" rx="3" fill="#9a7b57"/>`;
      s += `<rect x="${c.x - c.w / 2}" y="${c.top}" width="${c.w * 0.35}" height="${c.h}" rx="3" fill="#7d6244" opacity=".6"/>`;
      for (let i = 1; i < 4; i++) {
        s += `<line x1="${c.x - c.w / 2}" y1="${c.top + (c.h * i) / 4}" x2="${c.x + c.w / 2}" y2="${c.top + (c.h * i) / 4}" stroke="#7d6244" stroke-width="1" opacity=".5"/>`;
      }
      const fan = [-74, -52, -30, -10, 10, 30, 52, 74];
      for (const rot of fan) {
        const len = 46 - Math.abs(rot) * 0.22;
        s += g(leaf({ len, w: 10, fill: C.mid, curve: rot * 0.12, vein: false }), { x: c.x, y: c.top, rot });
        s += g(`<path d="M0 -3 Q ${rot * 0.05} ${-len * 0.5} ${rot * 0.11} ${-len + 3}" fill="none" stroke="#dcd98a" stroke-width="2.4" opacity=".85"/>`,
               { x: c.x, y: c.top, rot });
      }
    }
    return s;
  },

  /* ザミオクルカス（ZZ） -------------------------------------------- */
  zamioculcas() {
    let s = pot('black', { top: 152, h: 40, w: 56 });
    const stems = [
      { rot: -34, len: 86 }, { rot: -16, len: 100 }, { rot: 2, len: 106 },
      { rot: 20, len: 96 }, { rot: 38, len: 80 }, { rot: -52, len: 64 }, { rot: 54, len: 62 },
    ];
    for (const st of stems) {
      const inner = pinnate({ len: st.len, pairs: 6, lw: 14, lh: 6.4, fill: '#20502f', bend: st.rot * 0.22 });
      s += g(inner, { x: 100, y: 152, rot: st.rot });
    }
    return s;
  },

  /* アジアンタム ---------------------------------------------------- */
  adiantum() {
    let s = pot('white', { top: 150, h: 38, w: 56 });
    for (let i = 0; i < 9; i++) {
      const rot = -70 + i * 17.5;
      const len = 74 - Math.abs(rot) * 0.35;
      let inner = `<path d="M0 0 Q ${rot * 0.12} ${-len * 0.6} ${rot * 0.3} ${-len}" fill="none" stroke="#3b3230" stroke-width="1.4"/>`;
      for (let k = 0; k < 8; k++) {
        const t = 0.2 + (k * 0.78) / 7;
        const x = rot * 0.3 * t * t, y = -len * t;
        for (const sgn of [1, -1]) {
          inner += g(`<path d="M0 0 C 3 -8 12 -9 13 -2 C 12 3 4 4 0 0 Z" fill="${k % 2 ? '#8cc07e' : '#a4cf8d'}"/>`,
                     { x, y, rot: sgn > 0 ? -30 : 210 });
        }
      }
      s += g(inner, { x: 100, y: 150, rot });
    }
    return s;
  },

  /* ストレリチア ---------------------------------------------------- */
  strelitzia() {
    let s = pot('basket', { top: 154, h: 38, w: 62 });
    const paddles = [
      { rot: -30, len: 108 }, { rot: -12, len: 122 }, { rot: 8, len: 118 },
      { rot: 28, len: 104 }, { rot: -48, len: 84 }, { rot: 46, len: 86 },
    ];
    for (const p of paddles) {
      const inner =
        `<path d="M0 0 L${p.rot * 0.14} ${-p.len * 0.55}" stroke="${C.deep}" stroke-width="2.6" fill="none"/>` +
        g(`<ellipse cx="0" cy="${-p.len * 0.22}" rx="17" ry="${round(p.len * 0.24)}" fill="#2d6b45"/>` +
          `<path d="M0 ${-p.len * 0.46} L0 ${round(p.len * 0.02)}" stroke="rgba(255,255,255,.3)" stroke-width="1.6"/>` +
          [-3, -1.5, 0, 1.5, 3].map((k) =>
            `<path d="M0 ${round(-p.len * 0.22 + k * 7)} l 16 ${round(3 + k)}" stroke="rgba(20,60,35,.35)" stroke-width="1"/>` +
            `<path d="M0 ${round(-p.len * 0.22 + k * 7)} l -16 ${round(3 + k)}" stroke="rgba(20,60,35,.35)" stroke-width="1"/>`).join(''),
          { y: -p.len * 0.55, rot: p.rot * 0.2 });
      s += g(inner, { x: 100, y: 154, rot: p.rot });
    }
    return s;
  },

  /* エバーフレッシュ ------------------------------------------------ */
  everfresh() {
    let s = pot('white', { top: 152, h: 40, w: 56 });
    s += trunk({ x: 100, top: 76, bottom: 152, w: 7, color: '#a3855f', color2: '#836a4a' });
    const arms = [
      { x: 100, y: 76, r: 0, sc: 1 }, { x: 78, y: 92, r: -46, sc: .85 }, { x: 124, y: 90, r: 44, sc: .85 },
      { x: 88, y: 70, r: -24, sc: .8 }, { x: 114, y: 68, r: 22, sc: .8 }, { x: 66, y: 112, r: -66, sc: .6 },
      { x: 136, y: 110, r: 64, sc: .6 },
    ];
    for (const a of arms) {
      s += g(pinnate({ len: 52, pairs: 9, lw: 11, lh: 3.4, fill: '#5da05f', bend: 8 }), { x: a.x, y: a.y, rot: a.r, scale: a.sc });
    }
    return s;
  },

  /* テーブルヤシ ---------------------------------------------------- */
  chamaedorea() {
    let s = pot('terracotta', { top: 152, h: 40, w: 56 });
    const fronds = [
      { rot: -46, len: 80 }, { rot: -22, len: 98 }, { rot: -4, len: 104 },
      { rot: 16, len: 96 }, { rot: 40, len: 82 }, { rot: -64, len: 60 }, { rot: 62, len: 58 },
    ];
    for (const f of fronds) {
      s += g(pinnate({ len: f.len, pairs: 8, lw: 17, lh: 3.2, fill: '#3f8a55', bend: f.rot * 0.3 }), { x: 100, y: 152, rot: f.rot });
    }
    return s;
  },

  /* カラテア -------------------------------------------------------- */
  calathea() {
    let s = pot('white', { top: 152, h: 40, w: 56 });
    const spec = [
      { rot: -34, len: 84 }, { rot: -12, len: 96 }, { rot: 10, len: 92 },
      { rot: 32, len: 80 }, { rot: -54, len: 66 }, { rot: 52, len: 64 },
    ];
    for (const p of spec) {
      const inner =
        `<path d="M0 0 L0 ${-p.len * 0.5}" stroke="#7a3f5a" stroke-width="2.2" fill="none"/>` +
        g(`<ellipse cx="0" cy="${round(-p.len * 0.2)}" rx="15" ry="${round(p.len * 0.23)}" fill="#2f7048"/>` +
          [-2.5, -1.2, 0, 1.2, 2.5].map((k) =>
            `<ellipse cx="${round(k * 4.5)}" cy="${round(-p.len * 0.2 - k * 3)}" rx="2.6" ry="${round(p.len * 0.14 - Math.abs(k) * 2)}" fill="#a8d08a" opacity=".85" transform="rotate(${round(k * 6)} ${round(k * 4.5)} ${round(-p.len * 0.2)})"/>`).join('') +
          `<ellipse cx="0" cy="${round(-p.len * 0.2)}" rx="15" ry="${round(p.len * 0.23)}" fill="none" stroke="#245a3a" stroke-width="1.4"/>`,
          { y: -p.len * 0.5, rot: p.rot * 0.15 });
      s += g(inner, { x: 100, y: 152, rot: p.rot });
    }
    return s;
  },

  /* ビカクシダ（コウモリラン） -------------------------------------- */
  platycerium() {
    // 板付け
    let s = `<rect x="58" y="42" width="84" height="84" rx="4" fill="#b99b74"/>`;
    s += `<rect x="58" y="42" width="84" height="84" rx="4" fill="none" stroke="#9a7f5c" stroke-width="2"/>`;
    for (let i = 1; i < 4; i++) s += `<line x1="58" y1="${42 + i * 21}" x2="142" y2="${42 + i * 21}" stroke="#a98d69" stroke-width="1"/>`;
    // 貯水葉（シールド）
    s += `<path d="M64 122 C 60 84 74 62 100 62 C 126 62 140 84 136 122 Z" fill="#b6c39a"/>`;
    s += `<path d="M64 122 C 60 84 74 62 100 62 C 126 62 140 84 136 122" fill="none" stroke="#93a37a" stroke-width="2"/>`;
    // 胞子葉（鹿の角）
    const antler = (x, y, rot, sc) =>
      g(`<path d="M0 0 C -4 -22 -14 -30 -20 -46 C -22 -54 -14 -52 -12 -44 C -10 -36 -6 -32 -4 -26 ` +
        `C -4 -40 -2 -50 2 -62 C 4 -70 10 -66 8 -58 C 5 -46 6 -34 8 -26 C 12 -34 18 -42 24 -50 ` +
        `C 30 -57 34 -50 28 -44 C 20 -36 12 -22 8 -2 Z" fill="#6f9a63"/>`, { x, y, rot, scale: sc });
    s += antler(88, 118, -18, 1.05);
    s += antler(114, 118, 20, 1.0);
    s += antler(76, 116, -46, .78);
    s += antler(126, 114, 44, .74);
    s += antler(100, 112, 2, .9);
    return s;
  },

  /* サボテン（金鯱風） ---------------------------------------------- */
  echinocactus() {
    let s = pot('terracotta', { top: 150, h: 40, w: 58 });
    s += `<circle cx="100" cy="112" r="40" fill="#4f8f52"/>`;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * 360;
      s += g(`<path d="M0 0 C 4 -16 4 -30 0 -40" fill="none" stroke="#3d7a41" stroke-width="2.4"/>`, { x: 100, y: 112, rot: a });
      s += g(`<path d="M0 -40 l 0 -4" stroke="#e8dfa8" stroke-width="2" stroke-linecap="round"/>`, { x: 100, y: 112, rot: a });
    }
    s += `<circle cx="88" cy="98" r="14" fill="rgba(255,255,255,.16)"/>`;
    for (let i = 0; i < 26; i++) {
      const a = rad((i / 26) * 360), r = 26 + (i % 3) * 6;
      s += `<circle cx="${round(100 + Math.cos(a) * r)}" cy="${round(112 + Math.sin(a) * r)}" r="1.6" fill="#f0e7b4"/>`;
    }
    return s;
  },

  /* ===== ファイナル問題用（マニア向け） ===== */

  /* パキポディウム・グラキリス（塊根） ------------------------------ */
  /* ディオスコレア・エレファンティペス（亀甲竜） -------------------- */
  dioscorea() {
    let s = pot('bowl', { top: 160, h: 26, w: 62 });
    // 亀甲状の塊根
    s += `<ellipse cx="100" cy="132" rx="40" ry="30" fill="#a99678"/>`;
    s += `<ellipse cx="92" cy="126" rx="24" ry="16" fill="#bda98a" opacity=".7"/>`;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        const x = 66 + c * 17 + (r % 2 ? 8 : 0);
        const y = 116 + r * 15;
        if (Math.hypot((x - 100) / 40, (y - 132) / 30) > 0.92) continue;
        s += `<path d="M${x} ${y - 8} l 8 5 l 0 8 l -8 5 l -8 -5 l 0 -8 Z" fill="none" stroke="#7d6a4e" stroke-width="1.8" opacity=".85"/>`;
      }
    }
    s += `<ellipse cx="100" cy="132" rx="40" ry="30" fill="none" stroke="#8b7a5c" stroke-width="2"/>`;
    // つると葉
    s += `<path d="M100 102 C 96 84 108 74 104 58 C 100 44 120 40 126 30" fill="none" stroke="#5f8f4e" stroke-width="2"/>`;
    s += `<path d="M100 102 C 84 92 74 78 70 60" fill="none" stroke="#5f8f4e" stroke-width="1.8"/>`;
    const spots = [
      { x: 104, y: 58, r: -30 }, { x: 108, y: 72, r: 40 }, { x: 122, y: 36, r: -10 },
      { x: 74, y: 70, r: 200 }, { x: 70, y: 58, r: 150 }, { x: 98, y: 86, r: 230 },
    ];
    for (const sp of spots) {
      s += g(heartLeaf({ len: 22, w: 13, fill: C.light, vein: false }), { x: sp.x, y: sp.y, rot: sp.r });
    }
    return s;
  },

  /* ユーフォルビア・オベサ ------------------------------------------ */
  obesa() {
    let s = pot('gray', { top: 152, h: 38, w: 54 });
    s += `<ellipse cx="100" cy="120" rx="34" ry="36" fill="#8fa886"/>`;
    for (let i = -3; i <= 3; i++) {
      s += `<path d="M100 84 C ${100 + i * 11} 100 ${100 + i * 11} 140 100 156" fill="none" stroke="#6f8a6a" stroke-width="1.8" opacity=".8"/>`;
    }
    s += `<ellipse cx="100" cy="120" rx="34" ry="36" fill="none" stroke="#71886c" stroke-width="2"/>`;
    for (let i = -3; i <= 3; i++) {
      const x = 100 + i * 10.5;
      for (const y of [96, 108, 122, 136]) s += `<circle cx="${round(x * 0.02 + 100 + i * 10 * (1 - Math.abs(y - 120) / 90))}" cy="${y}" r="1.4" fill="#5d7359" opacity=".8"/>`;
    }
    s += `<ellipse cx="88" cy="104" rx="12" ry="10" fill="rgba(255,255,255,.2)"/>`;
    return s;
  },

  /* アガベ・チタノタ ------------------------------------------------ */
  agave() {
    let s = pot('bowl', { top: 156, h: 28, w: 66 });
    const blades = [
      { rot: 0, len: 74 }, { rot: -26, len: 70 }, { rot: 26, len: 68 },
      { rot: -52, len: 60 }, { rot: 52, len: 58 }, { rot: -78, len: 46 }, { rot: 78, len: 44 },
      { rot: -100, len: 34 }, { rot: 100, len: 32 }, { rot: -13, len: 52 }, { rot: 13, len: 50 },
    ];
    for (const b of blades) {
      const w = 17 - b.len * 0.08;
      const inner =
        `<path d="M0 0 C ${w} ${-b.len * 0.4} ${w * 0.5} ${-b.len * 0.85} 0 ${-b.len} ` +
        `C ${-w * 0.5} ${-b.len * 0.85} ${-w} ${-b.len * 0.4} 0 0 Z" fill="#9db08a" stroke="#6f8266" stroke-width="1.4"/>` +
        `<path d="M0 ${-b.len} l 0 -5" stroke="#4a3a2c" stroke-width="2.4" stroke-linecap="round"/>` +
        [0.3, 0.48, 0.66, 0.82].map((t) =>
          `<path d="M${round(w * 0.62 * (1 - t))} ${-b.len * t} l 3 -3" stroke="#4a3a2c" stroke-width="1.6" stroke-linecap="round"/>` +
          `<path d="M${round(-w * 0.62 * (1 - t))} ${-b.len * t} l -3 -3" stroke="#4a3a2c" stroke-width="1.6" stroke-linecap="round"/>`).join('');
      s += g(inner, { x: 100, y: 152, rot: b.rot });
    }
    return s;
  },
};

/** id からイラスト全体（<svg>…</svg>）を返す */
function renderArt(id, tint) {
  const fn = ART[id];
  const body = fn ? fn() : `<text x="100" y="105" text-anchor="middle" font-size="14" fill="#666">no image</text>`;
  return `<svg viewBox="0 0 200 200" role="img" xmlns="http://www.w3.org/2000/svg">` +
         backdrop(tint || '#e7f0e3') + body + `</svg>`;
}
