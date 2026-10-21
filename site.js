(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const css = getComputedStyle(document.documentElement);
  const ACCENT = css.getPropertyValue("--accent").trim() || "#34d399";
  const RGB1 = css.getPropertyValue("--accent-rgb").trim() || "52,211,153", RGB2 = css.getPropertyValue("--accent-rgb2").trim() || "16,185,129";

  /* ---------- pixel icons ---------- */
  const ICONS = {
    curious: ["..####..", ".##..##.", "......##", ".....##.", "....##..", "...##...", "........", "...##..."],
    website: ["########", "#......#", "#.#....#", "#..#...#", "#.#..###", "#......#", "########", "........"],
    phone:   ["..####..", "..#..#..", "..#..#..", "..#..#..", "..#..#..", "..####..", "..#.##..", "..####.."],
    chat:    [".######.", "#......#", "#.#.#.##", "#......#", ".######.", "...#....", "..#.....", "........"],
    shield:  ["#.####.#", "########", "##.##.##", "########", ".######.", "..####..", "...##...", "........"],
    toolbox: ["..####..", "..#..#..", "########", "########", "###..###", "########", "########", "........"],
    atom:    ["...##...", "#.####.#", ".##..##.", "##.##.##", "##.##.##", ".##..##.", "#.####.#", "...##..."],
    trophy:  ["########", "#.####.#", "#.####.#", ".######.", "..####..", "...##...", "..####..", "........"],
  };
  const icon = n => {
    let r = "";
    (ICONS[n] || ICONS.curious).forEach((row, y) => [...row].forEach((c, x) => { if (c === "#") r += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }));
    return `<svg class="ic" viewBox="0 0 8 8" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
  };
  $$("[data-icon]").forEach(el => el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon)));

  /* ---------- wall geometry: sheet slides off a fixed orange layer ---------- */
  const wall = $(".wall"), sheet = $(".sheet");
  const fit = () => { if (wall && sheet) sheet.style.marginBottom = Math.max(0, wall.offsetHeight - 28) + "px"; };
  addEventListener("resize", fit); fit();

  /* ---------- halftone header: square dithered dots, dense top-right, fading down and left ---------- */
  const cv = $("#halftone");
  if (cv) {
    const cx = cv.getContext("2d"), CELL = 8, DOT = 4;
    let W, H, cells = [];
    const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) ^ 0x5bd1e995; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
    const size = () => {
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W; cv.height = H; cells = [];
      for (let j = 0; j < H / CELL; j++) for (let i = 0; i < W / CELL; i++) {
        const fx = i * CELL / W, fy = (j * CELL) / H;
        const d = Math.pow(Math.min(1, .15 + fx * 1.05), 1.6) * Math.pow(1 - fy, 1.25);
        cells.push({ i, j, d, r: hash(i, j), p: hash(j, i) });
      }
    };
    const draw = t => {
      cx.clearRect(0, 0, W, H);
      for (const c of cells) {
        const wob = reduce ? 0 : Math.sin(t * .0008 + c.p * 40) * .07;
        if (c.r < c.d + wob) {
          cx.fillStyle = `rgba(${c.i % 9 < 4 ? RGB2 : RGB1},${.55 + c.p * .25})`;
          cx.fillRect(c.i * CELL + 2, c.j * CELL + 2, DOT, DOT);
        } else if (c.r < c.d * 1.35 + .02 && c.p > .55) {
          cx.fillStyle = `rgba(${RGB1},.45)`; cx.fillRect(c.i * CELL + 3, c.j * CELL + 3, 2, 2);
        }
      }
    };
    size(); draw(0);
    addEventListener("resize", () => { size(); draw(0); });
    if (!reduce) { let last = 0; (function loop(t) { if (t - last > 90) { draw(t); last = t; } requestAnimationFrame(loop); })(0); }
  }

  /* ---------- signal diagrams: dot-grid paper, chip nodes, circuit traces, travelling pulses ---------- */
  Object.assign(ICONS, {
    bell:   ["...##...", "..####..", ".######.", ".######.", ".######.", "########", "........", "...##..."],
    filter: ["########", ".######.", "..####..", "...##...", "...##...", "...##...", "...##...", "........"],
    cpu:    [".#.#.#..", "######..", "#....#..", "#.##.###", "#.##.#..", "######..", ".#.#.#..", "........"],
    cloud:  ["........", "...###..", "..#####.", ".#######", "########", "########", "........", "........"],
    eye:    ["........", "..####..", ".#....#.", "#..##..#", "#..##..#", ".#....#.", "..####..", "........"],
    person: ["..###...", "..###...", "..###...", "........", ".#####..", "#######.", "#######.", "........"],
    send:   ["#.......", "###.....", "#####...", "#######.", "#####...", "###.....", "#.......", "........"],
    dot:    ["........", "..####..", ".######.", ".######.", ".######.", ".######.", "..####..", "........"],
    hook:   ["..###...", ".#...#..", ".#...#..", "..#.#...", "...#....", "..###...", ".#####..", "........"],
  });
  const MONO = "JetBrains Mono, ui-monospace, monospace";
  const px = (name, x, y, s, col) => {
    let r = "";
    (ICONS[name] || []).forEach((row, yy) => [...row].forEach((c, xx) => { if (c === "#") r += `<rect x="${x + xx * s}" y="${y + yy * s}" width="${s}" height="${s}"/>`; }));
    return `<g fill="${col}" shape-rendering="crispEdges">${r}</g>`;
  };
  // orthogonal trace through points, with rounded corners
  const trace = (pts, r = 6) => {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], [qx, qy] = pts[i + 1];
      const r1 = Math.min(r, Math.hypot(bx - ax, by - ay) / 2), r2 = Math.min(r, Math.hypot(qx - bx, qy - by) / 2);
      const ux = Math.sign(bx - ax), uy = Math.sign(by - ay), vx = Math.sign(qx - bx), vy = Math.sign(qy - by);
      d += ` L${bx - ux * r1} ${by - uy * r1} Q${bx} ${by} ${bx + vx * r2} ${by + vy * r2}`;
    }
    const e = pts[pts.length - 1];
    return d + ` L${e[0]} ${e[1]}`;
  };
  let uid = 0;
  function diagram(spec) {
    const id = "dg" + (++uid), dim = "#3b3b44", ink = "#d4d4d8", mute = "#7c7c86";
    let s = `<defs><pattern id="${id}p" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".9" fill="#2c2c33"/></pattern>` +
      `<filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>` +
      `<rect width="400" height="300" fill="#17171a"/><rect width="400" height="300" fill="url(#${id}p)"/>` +
      `<text x="20" y="18" fill="${mute}" font-size="8.5" letter-spacing="1.4" font-family="${MONO}">${esc(spec.title)}</text>`;
    for (const e of spec.edges) {
      const d = trace(e.p);
      s += `<path d="${d}" fill="none" stroke="${e.hot ? `rgba(${RGB1},.55)` : dim}" stroke-width="1.3" ${e.dash ? 'stroke-dasharray="3 4"' : ""}/>`;
      if (e.wave) s += e.wave;
      if (!reduce && e.pulse) for (let n = 0; n < (e.n || 1); n++) {
        const dur = e.pulse, begin = ((e.delay || 0) + n * dur / (e.n || 1)).toFixed(2);
        s += `<circle r="5" fill="${ACCENT}" opacity=".35" filter="url(#${id}g)"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${d}"/></circle>` +
          `<circle r="2.2" fill="${ACCENT}"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${d}"/></circle>`;
      }
    }
    for (const n of spec.nodes) {
      const col = n.hot ? ACCENT : ink, stroke = n.hot ? ACCENT : "#3a3a43";
      if (n.hot) s += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="8" fill="${ACCENT}" opacity=".18" filter="url(#${id}g)"/>`;
      s += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="8" fill="#202025" stroke="${stroke}" stroke-width="1.2" ${n.dash ? 'stroke-dasharray="4 3"' : ""}/>`;
      const ty = n.rows || n.sub ? n.y + 18 : n.y + n.h / 2 + 3.5;
      if (n.icon) s += px(n.icon, n.x + 10, ty - 8, 1.25, col);
      s += `<text x="${n.x + (n.icon ? 25 : 10)}" y="${ty}" fill="${col}" font-size="10.5" font-family="${MONO}">${esc(n.t)}</text>`;
      if (n.sub) s += `<text x="${n.x + 10}" y="${n.y + 36}" fill="${mute}" font-size="8.5" font-family="${MONO}">${esc(n.sub)}</text>`;
      (n.rows || []).forEach((r, i) => {
        const ry = n.y + 38 + i * 24;
        s += `<rect x="${n.x + 10}" y="${ry - 7}" width="7" height="7" rx="1.5" fill="${i === 0 ? ACCENT : "#4a4a54"}"/>`;
        s += `<text x="${n.x + 24}" y="${ry}" fill="${i === 0 ? ink : mute}" font-size="9.5" font-family="${MONO}">${esc(r[0])}</text>`;
        if (r[1] != null) s += `<rect x="${n.x + n.w - 44}" y="${ry - 6}" width="34" height="4" rx="2" fill="#2e2e36"/><rect x="${n.x + n.w - 44}" y="${ry - 6}" width="${(34 * r[1]).toFixed(1)}" height="4" rx="2" fill="${i === 0 ? ACCENT : "#6b6b76"}"/>`;
      });
    }
    for (const t of spec.notes) s += `<text x="${t[0]}" y="${t[1]}" fill="${t[3] ? ACCENT : mute}" font-size="8.5" font-family="${MONO}" text-anchor="${t[4] || "start"}">${esc(t[2])}</text>`;
    return `<svg viewBox="0 0 400 300" role="img" aria-label="${esc(spec.alt)}">${s}</svg>`;
  }
  const wave = (x1, x2, y) => {
    let d = `M${x1} ${y}`;
    for (let x = x1; x <= x2; x += 2) d += ` L${x} ${(y + Math.sin((x - x1) / 4) * 3).toFixed(1)}`;
    return `<path d="${d}" fill="none" stroke="${ACCENT}" stroke-width="1.1" opacity=".8"/>`;
  };
  const DIAGRAMS = {
    poptle: {
      title: "01 · POPTLE / HOW IT DECIDES",
      alt: "POPTLE pipeline: a notification passes a trust layer, then rules, on-device AI and, only if needed, cloud AI, before landing in one of four attention zones",
      nodes: [
        { x: 20, y: 34, w: 128, h: 30, t: "notification", icon: "bell" },
        { x: 236, y: 34, w: 144, h: 30, t: "trust layer", icon: "eye" },
        { x: 20, y: 100, w: 128, h: 32, t: "rules", icon: "filter" },
        { x: 20, y: 156, w: 128, h: 32, t: "on-device AI", icon: "cpu", hot: true },
        { x: 20, y: 212, w: 128, h: 32, t: "cloud AI", icon: "cloud", dash: true },
        { x: 236, y: 100, w: 144, h: 144, t: "attention zones", rows: [["needs action", .9], ["people", .7], ["updates", .4], ["background", .15]] },
      ],
      edges: [
        { p: [[148, 49], [236, 49]], pulse: 2.6, delay: .4 },
        { p: [[84, 64], [84, 100]], pulse: 1.4, hot: true },
        { p: [[84, 132], [84, 156]], pulse: 2.8, delay: 1 },
        { p: [[84, 188], [84, 212]], dash: true, pulse: 5.6, delay: 2 },
        { p: [[148, 116], [236, 116]], pulse: 1.6, n: 2, hot: true, delay: .6 },
        { p: [[148, 172], [236, 172]], pulse: 2.4, delay: 1.3 },
        { p: [[148, 228], [236, 228]], dash: true, pulse: 5.6, delay: 3.4 },
      ],
      notes: [[192, 109, "most stop here", 1, "middle"], [192, 165, "on the phone", 0, "middle"], [192, 221, "last resort", 0, "middle"],
        [380, 80, "catches fake 'mom' messages", 0, "end"], [20, 276, "score 85+ always surfaces. nothing deleted, only sorted."]],
    },
    clonex: {
      title: "02 · CLONEX / FINDING FAKES",
      alt: "CloneX: five sources feed a 0 to 100 scorer, an analyst reviews, and n8n sends the takedown",
      nodes: [
        ...["app store", "google play", "bluesky", "telegram", "cert logs"].map((t, i) => ({ x: 20, y: 36 + i * 36, w: 112, h: 26, t, icon: "dot" })),
        { x: 168, y: 96, w: 100, h: 52, t: "score", sub: "0-100 + reasons", icon: "filter", hot: true },
        { x: 292, y: 60, w: 92, h: 30, t: "analyst", icon: "person" },
        { x: 292, y: 154, w: 92, h: 30, t: "takedown", icon: "send" },
      ],
      edges: [
        ...[0, 1, 2, 3, 4].map(i => ({ p: [[132, 49 + i * 36], [150, 49 + i * 36], [150, 122], [168, 122]], pulse: 2.2 + i * .35, delay: i * .5 })),
        { p: [[268, 122], [280, 122], [280, 75], [292, 75]], pulse: 2.4, delay: 1.2, hot: true },
        { p: [[338, 90], [338, 154]], pulse: 3, delay: 2.2 },
      ],
      notes: [[346, 126, "approve", 1], [338, 200, "via n8n", 0, "middle"], [20, 250, "held-out set: 87% precision · 76% recall · 81% F1"], [20, 270, "a human approves every takedown"]],
    },
    resolveai: {
      title: "03 · RESOLVEAI / READING THE ROOM",
      alt: "ResolveAI: a customer message hits an n8n webhook, Gemini scores anger, urgency and intent, and the workflow routes it",
      nodes: [
        { x: 20, y: 40, w: 120, h: 30, t: "message", icon: "chat" },
        { x: 20, y: 112, w: 120, h: 30, t: "n8n webhook", icon: "hook" },
        { x: 164, y: 82, w: 112, h: 98, t: "gemini", icon: "cpu", hot: true, rows: [["anger", .85], ["urgency", .7], ["intent", .5]] },
        { x: 300, y: 82, w: 84, h: 30, t: "a human", icon: "person" },
        { x: 300, y: 144, w: 84, h: 30, t: "queue", icon: "dot" },
      ],
      edges: [
        { p: [[80, 70], [80, 112]], pulse: 1.6 },
        { p: [[140, 127], [164, 127]], pulse: 1.6, delay: .8, hot: true },
        { p: [[276, 112], [288, 112], [288, 97], [300, 97]], pulse: 2.2, delay: 1.6, hot: true },
        { p: [[276, 150], [288, 150], [288, 159], [300, 159]], pulse: 2.6, delay: 2 },
      ],
      notes: [[342, 74, "angry + urgent", 1, "middle"], [20, 250, "1 to 3 seconds, message to route"], [20, 270, "built at TechTatva 2K26, still growing"]],
    },
    qsdc: {
      title: "04 · SUPERDENSE CODING",
      alt: "Quantum superdense coding: an entangled pair is shared, Alice encodes two bits with X and Z gates on her qubit, sends one qubit, and Bob recovers both bits with a Bell measurement",
      nodes: [
        { x: 136, y: 34, w: 128, h: 30, t: "entangled pair", icon: "atom", hot: true },
        { x: 20, y: 124, w: 120, h: 32, t: "alice", icon: "person" },
        { x: 260, y: 124, w: 120, h: 32, t: "bob", icon: "person" },
        { x: 20, y: 204, w: 120, h: 28, t: "bits in  1 0", icon: "dot" },
        { x: 260, y: 204, w: 120, h: 28, t: "bits out 1 0", icon: "dot", hot: true },
      ],
      edges: [
        { p: [[176, 64], [176, 94], [80, 94], [80, 124]], pulse: 3, hot: true },
        { p: [[224, 64], [224, 94], [320, 94], [320, 124]], pulse: 3, hot: true },
        { p: [[140, 140], [260, 140]], pulse: 2, delay: 1.5 },
        { p: [[80, 204], [80, 156]], pulse: 2.4, delay: .5 },
        { p: [[320, 156], [320, 204]], pulse: 2.4, delay: 2.5 },
      ],
      notes: [[200, 132, "1 qubit sent", 1, "middle"], [200, 106, "entangled", 0, "middle"], [92, 182, "X / Z gates"], [312, 182, "bell measurement", 0, "end"],
        [20, 270, "2 classical bits, 1 qubit. award: best use case of QSDC"]],
      extra: true,
    },
  };
  DIAGRAMS.qsdc.edges[0].wave = wave(176, 224, 80);
  $$("[data-sketch]").forEach(el => { const sp = DIAGRAMS[el.dataset.sketch]; if (sp) el.innerHTML = diagram(sp); });

  /* ---------- POPTLE sorter: notifications drop into the 4 attention zones ---------- */
  const sorter = $("[data-sorter]");
  if (sorter) {
    const ZONES = ["Needs Action", "People", "Updates", "Background"];
    sorter.innerHTML = `<div class="sorter"><div class="src">INCOMING NOTIFICATIONS</div><div class="score"></div><div class="zones">${ZONES.map((z, i) => `<div class="zone${i ? "" : " na"}"><b>0</b><span>${z}</span></div>`).join("")}</div></div>`;
    const box = $(".sorter", sorter), zones = $$(".zone", box), score = $(".score", box), counts = [0, 0, 0, 0];
    const FEED = [
      ["Bank", "OTP 482913 for your payment", 0, 96], ["Mom", "call me when you're free", 1, 91], ["Store", "40% off, today only", 3, 8],
      ["Courier", "your order has shipped", 2, 44], ["Rakesh", "pushed the fix to main", 1, 77], ["Electricity", "bill due tomorrow", 0, 88],
      ["Unknown number", "“Mom”: send money now", 3, 0, true], ["Play Store", "3 apps updated", 2, 21], ["Game", "your lives are full!", 3, 4],
    ];
    let k = 0;
    const drop = () => {
      const [from, text, zi, sc, flag] = FEED[k++ % FEED.length];
      const chip = document.createElement("div");
      chip.className = "chip" + (flag ? " flag" : "");
      chip.innerHTML = `<i>${flag ? "impersonation flagged" : esc(from)}</i>${esc(text)}`;
      box.appendChild(chip);
      score.textContent = flag ? "trust layer: blocked" : `attention score ${sc}`; score.style.opacity = 1;
      setTimeout(() => {
        const z = zones[zi].getBoundingClientRect(), b = box.getBoundingClientRect(), c = chip.getBoundingClientRect();
        const dx = z.left + z.width / 2 - (c.left + c.width / 2), dy = z.top + 14 - c.top;
        chip.style.transform = `translate(${dx}px,${dy}px) scale(.42)`; chip.style.opacity = "0"; score.style.opacity = 0;
        setTimeout(() => { chip.remove(); zones[zi].querySelector("b").textContent = ++counts[zi]; zones[zi].classList.add("hit"); setTimeout(() => zones[zi].classList.remove("hit"), 500); }, 850);
      }, 1100);
    };
    if (reduce) { FEED.forEach(f => counts[f[2]]++); zones.forEach((z, i) => z.querySelector("b").textContent = counts[i]); }
    else { drop(); setInterval(() => { if (!document.hidden) drop(); }, 2300); }
  }

  /* ---------- carousel ---------- */
  const track = $(".track");
  if (track) {
    const prev = $("#prev"), next = $("#next"), fl = $(".fade.l"), fr = $(".fade.r");
    const step = () => track.firstElementChild.offsetWidth + 16;
    const upd = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      const atStart = track.scrollLeft <= 2, atEnd = track.scrollLeft >= max;
      prev.disabled = atStart; next.disabled = atEnd;
      fl.style.opacity = atStart ? 0 : 1; fr.style.opacity = atEnd ? 0 : 1;
    };
    prev.onclick = () => track.scrollBy({ left: -step(), behavior: "smooth" });
    next.onclick = () => track.scrollBy({ left: step(), behavior: "smooth" });
    track.addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
  }

  /* ---------- drawings: strokes -> SVG (kept in this browser; swap for a database to share) ---------- */
  const KEY = "joel-wall-v2";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const store = l => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} };
  const day = 864e5, ago = ts => { const d = Math.floor((Date.now() - ts) / day); return d < 1 ? "today" : d + "d"; };
  const poly = p => p.map((q, i) => (i ? "L" : "M") + q[0].toFixed(0) + " " + q[1].toFixed(0)).join("") + (p.length === 1 ? "l.1 0" : "");
  const svgOf = strokes => `<svg viewBox="0 0 400 300" aria-hidden="true">${strokes.map(s => `<path d="${poly(s.p)}" fill="none" stroke="${s.c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</svg>`;
  const SEED = [
    { name: "Joel", msg: "first one's mine", ts: Date.now() - 3 * day, strokes: [{ c: ACCENT, p: Array.from({ length: 33 }, (_, i) => [200 + 85 * Math.cos(i / 32 * 6.283), 150 + 85 * Math.sin(i / 32 * 6.283)]) }, { c: ACCENT, p: [[165, 125], [165, 125]] }, { c: ACCENT, p: [[235, 125], [235, 125]] }, { c: ACCENT, p: Array.from({ length: 13 }, (_, i) => [155 + i * 7.5, 175 + 22 * Math.sin(i / 12 * 3.1416)]) }] },
    { name: "", msg: "", ts: Date.now() - 5 * day, strokes: [{ c: "#3b82f6", p: [[70, 220], [150, 90], [200, 175], [245, 130], [320, 220], [70, 220]] }, { c: "#eab308", p: Array.from({ length: 21 }, (_, i) => [300 + 24 * Math.cos(i / 20 * 6.283), 70 + 24 * Math.sin(i / 20 * 6.283)]) }] },
    { name: "Joel", msg: "hello wall", ts: Date.now() - 9 * day, strokes: [{ c: "#111", p: [[110, 70], [110, 220]] }, { c: "#111", p: [[110, 150], [135, 120], [165, 118], [185, 140], [185, 220]] }, { c: "#111", p: [[250, 130], [250, 220]] }, { c: "#111", p: [[250, 90], [250, 92]] }, { c: ACCENT, p: [[300, 215], [335, 200], [370, 215]] }] },
  ];
  const everything = () => [...load(), ...SEED].sort((a, b) => b.ts - a.ts);

  /* wall layer: draggable cards, slightly rotated, fanned around the centre */
  const stage = $("#stage");
  const SLOTS = [[-175, 22, 1.1, 203], [13, 39, 4.2, 214], [193, 68, 3.6, 210], [234, 23, -4.3, 213]];
  function renderStage() {
    if (!stage) return;
    const items = everything().slice(0, 4);
    stage.innerHTML = `<button class="addbtn" data-draw><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>Add yours</button>` +
      items.map((d, i) => { const [ox, oy, rot, w] = SLOTS[i];
        return `<figure class="fig" data-rot="${rot}" style="--w:${w}px;left:calc(50% + ${ox}px);top:${oy}px;transform:rotate(${rot}deg)">${d.msg ? `<p class="m">${esc(d.msg)}</p>` : ""}${svgOf(d.strokes)}<figcaption>By ${esc(d.name || "anonymous")}</figcaption></figure>`; }).join("");
    $$(".fig", stage).forEach(f => {
      let sx, sy, ox, oy;
      f.onpointerdown = e => { f.setPointerCapture(e.pointerId); f.classList.add("drag"); sx = e.clientX; sy = e.clientY; ox = f.offsetLeft; oy = f.offsetTop; };
      f.onpointermove = e => { if (!f.classList.contains("drag")) return; f.style.left = ox + e.clientX - sx + "px"; f.style.top = oy + e.clientY - sy + "px"; };
      f.onpointerup = f.onpointercancel = () => f.classList.remove("drag");
    });
    $$("[data-draw]").forEach(b => b.onclick = openModal);
  }

  const grid = $("#grid");
  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = `<button class="tile add" data-draw>✎<br>Add yours</button>` +
      everything().map(d => `<div class="tile"><div class="pic">${svgOf(d.strokes)}</div><div class="who">${esc(d.name || "anonymous")}<span>${ago(d.ts)}</span></div>${d.msg ? `<div class="note">${esc(d.msg)}</div>` : ""}</div>`).join("");
    $$("[data-draw]", grid).forEach(b => b.onclick = openModal);
  }

  /* ---------- draw modal ---------- */
  const COLORS = ["#111111", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#a855f7"];
  document.body.insertAdjacentHTML("beforeend", `
  <div class="modal" id="modal" role="dialog" aria-modal="true" aria-label="Draw something">
    <div class="panel">
      <div class="swatches">${COLORS.map((c, i) => `<button style="background:${c}" data-c="${c}" class="${i ? "" : "on"}" aria-label="Colour ${c}"></button>`).join("")}</div>
      <canvas id="pad" width="800" height="600"></canvas>
      <input id="msg" maxlength="200" placeholder="Leave a message with your doodle (optional)">
      <div class="count"><span id="cnt">0</span>/200</div>
      <div class="row"><input id="who" maxlength="40" placeholder="Your name (optional)"><button class="btn" id="undo" type="button">Undo</button></div>
      <div class="row"><button class="btn primary" id="add" type="button">Add to the wall</button><button class="btn" id="cancel" type="button">Cancel</button></div>
    </div>
  </div>`);
  const modal = $("#modal"), pad = $("#pad"), g = pad.getContext("2d");
  let color = COLORS[0], strokes = [], cur = null;
  const paint = () => {
    g.fillStyle = "#fff"; g.fillRect(0, 0, 800, 600); g.lineWidth = 10; g.lineCap = g.lineJoin = "round";
    for (const s of strokes) { g.strokeStyle = s.c; g.beginPath(); s.p.forEach(([a, b], i) => i ? g.lineTo(a * 2, b * 2) : g.moveTo(a * 2, b * 2)); if (s.p.length === 1) g.lineTo(s.p[0][0] * 2 + .1, s.p[0][1] * 2); g.stroke(); }
  };
  const at = e => { const b = pad.getBoundingClientRect(); return [(e.clientX - b.left) * 400 / b.width, (e.clientY - b.top) * 300 / b.height]; };
  pad.onpointerdown = e => { pad.setPointerCapture(e.pointerId); cur = { c: color, p: [at(e)] }; strokes.push(cur); paint(); };
  pad.onpointermove = e => { if (cur) { cur.p.push(at(e)); paint(); } };
  pad.onpointerup = pad.onpointercancel = () => { cur = null; };
  $$("[data-c]", modal).forEach(b => b.onclick = () => { color = b.dataset.c; $$("[data-c]", modal).forEach(o => o.classList.toggle("on", o === b)); });
  $("#msg").oninput = e => { $("#cnt").textContent = e.target.value.length; };
  $("#undo").onclick = () => { strokes.pop(); paint(); };
  const close = () => modal.classList.remove("open");
  $("#cancel").onclick = close; modal.onclick = e => { if (e.target === modal) close(); };
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  function openModal() { strokes = []; paint(); $("#msg").value = ""; $("#cnt").textContent = "0"; modal.classList.add("open"); }
  $("#add").onclick = () => {
    if (!strokes.length) return;
    const l = load();
    l.push({ name: $("#who").value.trim(), msg: $("#msg").value.trim(), ts: Date.now(), strokes: strokes.map(s => ({ c: s.c, p: s.p.filter((_, i) => i % 2 === 0 || i === s.p.length - 1) })) });
    store(l.slice(-40)); close(); renderStage(); renderGrid();
  };
  $$("[data-draw]").forEach(b => b.onclick = openModal);
  renderStage(); renderGrid();
})();
