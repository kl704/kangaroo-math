// Original question generator for Grade 1-2, Kangaroo-style.
// We do NOT copy past-paper questions or solutions.
// Instead we generate original questions inspired by common contest formats.

const BANK_VERSION = 2;
const BANK_SIZE = 1000;
const BANK_SEED = 0xC0FFEE11;

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rnd, min, max) {
  return min + Math.floor(rnd() * (max - min + 1));
}

function pick(rnd, arr) {
  return arr[Math.floor(rnd() * arr.length)];
}

function shuffleInPlace(arr, rnd) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

function make4Choices(correct, makeWrong, rnd) {
  const choices = [String(correct)];
  while (choices.length < 4) {
    const w = String(makeWrong());
    if (!choices.includes(w)) choices.push(w);
  }
  shuffleInPlace(choices, rnd);
  return {
    choices,
    answerIndex: choices.indexOf(String(correct))
  };
}

function svgWrap(inner, w, h) {
  return `
<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="diagram">
  <rect x="0" y="0" width="${w}" height="${h}" rx="18" fill="#fff7fb" stroke="#F8C8DC" stroke-width="4"/>
  ${inner}
</svg>`;
}

function svgLabel(x, y, t) {
  return `<text x="${x}" y="${y}" font-family="Quicksand, system-ui" font-size="18" font-weight="700" fill="#8B5E3C">${t}</text>`;
}

function cubeStackQuestion(rnd, id) {
  const cols = randInt(rnd, 3, 5);
  const heights = Array.from({ length: cols }, () => randInt(rnd, 1, 4));
  const total = heights.reduce((a, b) => a + b, 0);

  const size = 26;
  const gap = 10;
  const baseY = 190;
  const baseX = 50;

  let inner = `
  <g>
    ${svgLabel(24, 40, "Count the blocks")}
  </g>
  <g>`;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < heights[c]; r++) {
      const x = baseX + c * (size + gap);
      const y = baseY - (r + 1) * size;
      inner += `
      <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="6" fill="#e6fffb" stroke="#4FB0AC" stroke-width="3"/>`;
    }
  }
  inner += "\n  </g>";

  const ch = make4Choices(total, () => total + randInt(rnd, -3, 3), rnd);
  return {
    id,
    level: 1 + (total > 10 ? 1 : 0),
    category: "Geometry",
    points: total > 10 ? 5 : 4,
    prompt: "How many blocks are there?",
    diagramSvg: svgWrap(inner, 520, 220),
    choices: ch.choices,
    answerIndex: ch.answerIndex
  };
}

function gridMoveQuestion(rnd, id) {
  const size = 4;
  let x = randInt(rnd, 0, size - 1);
  let y = randInt(rnd, 0, size - 1);

  const moves = [];
  const moveCount = randInt(rnd, 4, 7);
  const dirs = ["U", "D", "L", "R"];

  for (let i = 0; i < moveCount; i++) {
    const d = pick(rnd, dirs);
    moves.push(d);
  }

  function step(pos, d) {
    let nx = pos.x;
    let ny = pos.y;
    if (d === "U") ny = Math.max(0, ny - 1);
    if (d === "D") ny = Math.min(size - 1, ny + 1);
    if (d === "L") nx = Math.max(0, nx - 1);
    if (d === "R") nx = Math.min(size - 1, nx + 1);
    return { x: nx, y: ny };
  }

  const start = { x, y };
  let cur = { x, y };
  for (const d of moves) cur = step(cur, d);
  const end = cur;

  // Create 4 candidate cells (A-D)
  const cells = [{ ...end }];
  while (cells.length < 4) {
    const cx = randInt(rnd, 0, size - 1);
    const cy = randInt(rnd, 0, size - 1);
    if (!cells.some((p) => p.x === cx && p.y === cy)) cells.push({ x: cx, y: cy });
  }
  shuffleInPlace(cells, rnd);
  const labels = ["A", "B", "C", "D"];
  const correctLabel = labels[cells.findIndex((p) => p.x === end.x && p.y === end.y)];

  const cellSize = 42;
  const ox = 80;
  const oy = 60;

  let inner = `
  ${svgLabel(24, 40, "Follow the arrows")}
  <g stroke="#8B5E3C" stroke-width="3" fill="none">`;
  for (let i = 0; i <= size; i++) {
    const yy = oy + i * cellSize;
    const xx = ox + i * cellSize;
    inner += `\n    <line x1="${ox}" y1="${yy}" x2="${ox + size * cellSize}" y2="${yy}"/>`;
    inner += `\n    <line x1="${xx}" y1="${oy}" x2="${xx}" y2="${oy + size * cellSize}"/>`;
  }
  inner += "\n  </g>";

  // Start marker
  const sx = ox + start.x * cellSize + cellSize / 2;
  const sy = oy + start.y * cellSize + cellSize / 2;
  inner += `
  <circle cx="${sx}" cy="${sy}" r="10" fill="#F8C8DC" stroke="#8B5E3C" stroke-width="3"/>
  ${svgLabel(sx - 20, sy - 14, "Start")}`;

  // Label candidate cells
  inner += "\n  <g>";
  for (let i = 0; i < cells.length; i++) {
    const p = cells[i];
    const cx = ox + p.x * cellSize + 8;
    const cy = oy + p.y * cellSize + 24;
    inner += `\n    <text x="${cx}" y="${cy}" font-family="Fredoka One, system-ui" font-size="22" fill="#4FB0AC">${labels[i]}</text>`;
  }
  inner += "\n  </g>";

  // Moves legend
  const moveStr = moves.join(" ");
  inner += `
  <g>
    <rect x="${ox}" y="${oy + size * cellSize + 14}" width="${size * cellSize}" height="42" rx="12" fill="#ffffff" stroke="#4FB0AC" stroke-width="3"/>
    <text x="${ox + 12}" y="${oy + size * cellSize + 44}" font-family="Quicksand, system-ui" font-size="18" font-weight="700" fill="#0f766e">${moveStr}</text>
  </g>`;

  const ch = {
    choices: labels,
    answerIndex: labels.indexOf(correctLabel)
  };

  return {
    id,
    level: 2,
    category: "Logic",
    points: 4,
    prompt: "Where do you end up?",
    diagramSvg: svgWrap(inner, 520, 260),
    choices: ch.choices,
    answerIndex: ch.answerIndex
  };
}

function mirrorMatchQuestion(rnd, id) {
  // Base polyline shape in a box; pick which option is its mirror.
  const shapes = [
    // each: points in 0..100 box
    "10,80 10,20 55,20 55,45 35,45 35,80",
    "20,80 20,30 45,30 45,20 80,20 80,80",
    "15,75 15,25 40,25 40,55 70,55 70,75",
    "25,80 25,20 55,20 55,35 40,35 40,80"
  ];
  const pts = pick(rnd, shapes);
  const flipX = (p) => {
    const parts = p.trim().split(/\s+/).map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return `${100 - x},${y}`;
    });
    return parts.join(" ");
  };

  const base = pts;
  const mirror = flipX(pts);
  const same = pts;
  const shifted = pts
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return `${Math.min(95, x + 8)},${y}`;
    })
    .join(" ");
  const squashed = pts
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return `${x},${Math.min(95, Math.max(5, Math.round(y * 0.85 + 8)))}`;
    })
    .join(" ");

  const options = [
    { k: "A", pts: mirror, ok: true },
    { k: "B", pts: same, ok: false },
    { k: "C", pts: shifted, ok: false },
    { k: "D", pts: squashed, ok: false }
  ];
  shuffleInPlace(options, rnd);
  const correct = options.find((o) => o.ok).k;

  function box(x, y, label, points) {
    return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="110" height="110" rx="16" fill="#ffffff" stroke="#8B5E3C" stroke-width="3"/>
      <polyline points="${points}" fill="none" stroke="#4FB0AC" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" transform="translate(5,5) scale(1.0)"/>
      <text x="10" y="28" font-family="Fredoka One, system-ui" font-size="22" fill="#F8C8DC" stroke="#8B5E3C" stroke-width="1">${label}</text>
    </g>`;
  }

  let inner = `
  ${svgLabel(24, 40, "Mirror")}
  <g transform="translate(50,55)">
    <rect x="0" y="0" width="140" height="140" rx="18" fill="#ffffff" stroke="#8B5E3C" stroke-width="3"/>
    <polyline points="${base}" fill="none" stroke="#4FB0AC" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" transform="translate(15,15) scale(1.1)"/>
  </g>
  <line x1="220" y1="62" x2="220" y2="197" stroke="#8B5E3C" stroke-width="4" stroke-dasharray="8 8"/>
  <text x="205" y="210" font-family="Quicksand, system-ui" font-size="14" font-weight="700" fill="#8B5E3C">mirror line</text>
`;

  const ox = 260;
  const oy = 60;
  inner += box(ox + 0, oy + 0, options[0].k, options[0].pts);
  inner += box(ox + 120, oy + 0, options[1].k, options[1].pts);
  inner += box(ox + 0, oy + 120, options[2].k, options[2].pts);
  inner += box(ox + 120, oy + 120, options[3].k, options[3].pts);

  return {
    id,
    level: 2,
    category: "Geometry",
    points: 5,
    prompt: "Which option is the mirror image?",
    diagramSvg: svgWrap(inner, 520, 260),
    choices: ["A", "B", "C", "D"],
    answerIndex: ["A", "B", "C", "D"].indexOf(correct)
  };
}

function patternQuestion(rnd, id) {
  const types = ["diff", "repeat", "mix"];
  const t = pick(rnd, types);
  if (t === "repeat") {
    const a = randInt(rnd, 1, 6);
    const b = randInt(rnd, 1, 6);
    const seq = [a, b, a, b, a];
    const correct = b;
    const ch = make4Choices(correct, () => randInt(rnd, 0, 12), rnd);
    return {
      id,
      level: 1,
      category: "Patterns",
      points: 3,
      prompt: `What comes next? ${seq.join(", ")}, ...`,
      choices: ch.choices,
      answerIndex: ch.answerIndex
    };
  }

  if (t === "diff") {
    const start = randInt(rnd, 1, 6);
    const d1 = randInt(rnd, 1, 4);
    const d2 = d1 + 1;
    const d3 = d2 + 1;
    const d4 = d3 + 1;
    const s1 = start;
    const s2 = s1 + d1;
    const s3 = s2 + d2;
    const s4 = s3 + d3;
    const s5 = s4 + d4;
    const correct = s5 + (d4 + 1);
    const ch = make4Choices(correct, () => correct + randInt(rnd, -3, 3), rnd);
    return {
      id,
      level: 2,
      category: "Patterns",
      points: 4,
      prompt: `What comes next? ${s1}, ${s2}, ${s3}, ${s4}, ${s5}, ...`,
      choices: ch.choices,
      answerIndex: ch.answerIndex
    };
  }

  // mix
  const a = randInt(rnd, 1, 9);
  const b = randInt(rnd, 1, 9);
  const c = a + b;
  const d = b + c;
  const e = c + d;
  const correct = d + e;
  const ch = make4Choices(correct, () => correct + randInt(rnd, -6, 6), rnd);
  return {
    id,
    level: 2,
    category: "Patterns",
    points: 4,
    prompt: `What comes next? ${a}, ${b}, ${c}, ${d}, ${e}, ...`,
    choices: ch.choices,
    answerIndex: ch.answerIndex
  };
}

function pictureEquationQuestion(rnd, id) {
  // A small picture-equation puzzle with shapes.
  // Choose hidden values for 3 shapes.
  const circle = randInt(rnd, 1, 5);
  const square = randInt(rnd, 2, 7);
  const tri = randInt(rnd, 1, 6);
  const line1 = circle + circle + square;
  const line2 = tri + square;
  const ask = circle + tri;

  const correct = ask;
  const ch = make4Choices(correct, () => correct + randInt(rnd, -3, 4), rnd);

  const inner = `
  ${svgLabel(24, 40, "Find the value")}
  <g transform="translate(50,70)" font-family="Quicksand, system-ui" font-size="26" font-weight="800" fill="#8B5E3C">
    <g transform="translate(0,0)">
      <circle cx="20" cy="18" r="14" fill="#e6fffb" stroke="#4FB0AC" stroke-width="4"/>
      <text x="45" y="26">+</text>
      <circle cx="85" cy="18" r="14" fill="#e6fffb" stroke="#4FB0AC" stroke-width="4"/>
      <text x="110" y="26">+</text>
      <rect x="140" y="4" width="28" height="28" rx="6" fill="#fff1f2" stroke="#F8C8DC" stroke-width="4"/>
      <text x="180" y="26">= ${line1}</text>
    </g>
    <g transform="translate(0,60)">
      <polygon points="20,30 5,4 35,4" fill="#fff7ed" stroke="#8B5E3C" stroke-width="4"/>
      <text x="45" y="26">+</text>
      <rect x="70" y="4" width="28" height="28" rx="6" fill="#fff1f2" stroke="#F8C8DC" stroke-width="4"/>
      <text x="110" y="26">= ${line2}</text>
    </g>
    <g transform="translate(0,120)">
      <circle cx="20" cy="18" r="14" fill="#e6fffb" stroke="#4FB0AC" stroke-width="4"/>
      <text x="45" y="26">+</text>
      <polygon points="85,30 70,4 100,4" fill="#fff7ed" stroke="#8B5E3C" stroke-width="4"/>
      <text x="120" y="26">= ?</text>
    </g>
  </g>`;

  return {
    id,
    level: 2,
    category: "Logic",
    points: 5,
    prompt: "What number should replace ?",
    diagramSvg: svgWrap(inner, 520, 260),
    choices: ch.choices,
    answerIndex: ch.answerIndex
  };
}

function triangleCountQuestion(rnd, id) {
  // Use a small set of known triangle-count diagrams.
  const variants = [
    {
      // square with one diagonal: 2 triangles
      inner: `
        <g transform="translate(155,45)">
          <rect x="0" y="0" width="200" height="200" fill="#ffffff" stroke="#8B5E3C" stroke-width="4"/>
          <line x1="0" y1="0" x2="200" y2="200" stroke="#4FB0AC" stroke-width="6"/>
        </g>`,
      answer: 2,
      points: 4
    },
    {
      // triangle with a segment from top to base midpoint: 2 triangles
      inner: `
        <g transform="translate(150,40)">
          <polygon points="100,0 0,190 200,190" fill="#ffffff" stroke="#8B5E3C" stroke-width="4"/>
          <line x1="100" y1="0" x2="100" y2="190" stroke="#4FB0AC" stroke-width="6"/>
        </g>`,
      answer: 2,
      points: 4
    },
    {
      // square with both diagonals: 8 triangles (small + big)
      inner: `
        <g transform="translate(155,45)">
          <rect x="0" y="0" width="200" height="200" fill="#ffffff" stroke="#8B5E3C" stroke-width="4"/>
          <line x1="0" y1="0" x2="200" y2="200" stroke="#4FB0AC" stroke-width="6"/>
          <line x1="200" y1="0" x2="0" y2="200" stroke="#4FB0AC" stroke-width="6"/>
        </g>`,
      answer: 8,
      points: 5
    }
  ];

  const v = pick(rnd, variants);
  const ch = make4Choices(v.answer, () => v.answer + randInt(rnd, -3, 4), rnd);
  const inner = `
    ${svgLabel(24, 40, "Count the triangles")}
    ${v.inner}
  `;
  return {
    id,
    level: 2,
    category: "Geometry",
    points: v.points,
    prompt: "How many triangles are in the picture?",
    diagramSvg: svgWrap(inner, 520, 260),
    choices: ch.choices,
    answerIndex: ch.answerIndex
  };
}

function generateBank() {
  const rnd = mulberry32(BANK_SEED);
  const items = [];

  const makers = [
    (r, id) => cubeStackQuestion(r, id),
    (r, id) => mirrorMatchQuestion(r, id),
    (r, id) => gridMoveQuestion(r, id),
    (r, id) => pictureEquationQuestion(r, id),
    (r, id) => patternQuestion(r, id),
    (r, id) => triangleCountQuestion(r, id)
  ];

  for (let i = 0; i < BANK_SIZE; i++) {
    const maker = pick(rnd, makers);
    const qid = `V${BANK_VERSION}-${String(i + 1).padStart(4, "0")}`;
    const q = maker(rnd, qid);
    items.push(q);
  }

  return {
    version: BANK_VERSION,
    size: BANK_SIZE,
    items
  };
}

const BANK = generateBank();

function getQuestionSet(count, opts) {
  const seenIds = (opts && Array.isArray(opts.seenIds)) ? opts.seenIds : [];
  const stats = (opts && opts.stats) ? opts.stats : {};
  const seed = (opts && typeof opts.seed === "number") ? (opts.seed >>> 0) : (Date.now() >>> 0);
  const rnd = mulberry32(seed);
  const now = Date.now();

  // Score questions: prioritize unseen, then weak (wrong rate), then least recently seen.
  const scored = BANK.items.map((q) => {
    const st = stats[q.id];
    const seen = st ? (st.seen || 0) : 0;
    const wrong = st ? (st.wrong || 0) : 0;
    const correct = st ? (st.correct || 0) : 0;
    const lastSeen = st ? (st.lastSeen || 0) : 0;

    const unseenBoost = seen === 0 ? 1_000_000 : 0;
    const wrongRate = seen > 0 ? (wrong / seen) : 0;
    const weaknessBoost = Math.round(wrongRate * 50_000) + Math.min(20_000, wrong * 6_000);
    const recencyMs = lastSeen ? Math.min(30 * 24 * 3600 * 1000, Math.max(0, now - lastSeen)) : (30 * 24 * 3600 * 1000);
    const recencyBoost = Math.round(recencyMs / (30 * 24 * 3600 * 1000) * 25_000);
    const masteryPenalty = seen > 0 ? Math.min(18_000, Math.round((correct / seen) * 18_000)) : 0;

    // If user explicitly tracked seen ids, treat them as seen even if stats missing.
    const explicitSeen = seenIds.includes(q.id);
    const explicitPenalty = explicitSeen && seen === 0 ? 12_000 : 0;

    const jitter = Math.floor(rnd() * 5000);
    const score = unseenBoost + weaknessBoost + recencyBoost - masteryPenalty - explicitPenalty + jitter;
    return { q, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const picked = [];
  const used = new Set();
  for (const s of scored) {
    if (picked.length >= count) break;
    if (used.has(s.q.id)) continue;
    picked.push(s.q);
    used.add(s.q.id);
  }

  // Small shuffle so it feels random within the picked set.
  shuffleInPlace(picked, rnd);
  return picked;
}
