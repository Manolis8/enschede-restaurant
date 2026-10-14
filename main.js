/* Star Grill
   1 · the plate gets served (pinned, scrubbed)   2 · Star Mix layer by layer (pinned, scrubbed)
   3 · favourites land on the checkerboard          4 · the menu        5 · visit, with a live open/closed pill
   Two versions share this file: the drawn one (/) draws all food here as SVG from a seed, so it looks
   hand-made but identical on every load; the photo one (/foto, <html data-version="foto">) uses photos. */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PHONE = matchMedia('(max-width: 760px)').matches;
  const PHOTO = document.documentElement.dataset.version === 'foto';
  // photo version: cut-outs and dish photos on the CDN (made with Higgsfield, see README); the Pirzola card is their real photo
  const CDN = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38RfhGrFWe0TNVNCsp1Pnsu6Xk4/';
  const PICS = Object.fromEntries(Object.entries({
    plate: '52df128a-bfe2-4e45-b9d6-06b9c825fea8', rice: 'bea6d3f3-e490-4308-a69f-0e74659a5dc4', salad: '490d284b-4d03-4d29-b278-68917ead60e7',
    potato: '3f6c4440-3980-47a3-9b14-329c473adc9f', sauce: 'dba43ddc-be4b-4f1d-b66a-67ab659c18c2', chops: '024197fb-7209-4078-8745-b32bbe662492',
    doner: '5a95c9b7-44c3-48cb-b133-1c28533ed571', adana: '12c58cc1-14f1-4bd6-9399-55072e7d920a', biefstuk: '504da7f1-d656-438c-affd-85f4e3cd1fed',
    bread: '72bf1509-ba7a-426b-adf8-e1b164a86a65',
    'dish-doner': 'aa3671ee-54fa-42c5-87ab-0e22df9dfab7', 'dish-adana-broodje': '14656b4f-db29-47a9-b652-5a0e5b7ed2b8',
    'dish-lahmacun': 'c36b8b44-6d81-430f-a40f-051c7eb61977', 'dish-kofte': '20228b59-37c6-4489-a2e5-68aa3442301c',
    'dish-sis': 'd654b3a2-96d6-4837-a6ed-3a5e28b9b1b3', 'dish-grillmix': 'ec67942c-2a85-4441-a670-6cd6f740aa97',
    'dish-starmix': 'a15f3e32-f78e-4809-9e58-1c06ca0ddea9',
  }).map(([k, id]) => [k, CDN + id + '.webp']));
  PICS['dish-pirzola'] = '/img/pirzola-schotel.jpg';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ───────── seeded shapes ───────── */
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const f = n => n.toFixed(2);
  /* smooth closed path through points (Catmull-Rom → cubic Bézier) */
  function closed(pts) {
    const n = pts.length;
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
    }
    return d + 'Z';
  }
  /* a lumpy ellipse: organic, never a perfect circle */
  function blob(r, cx, cy, rx, ry, { n = 10, jit = .14, rot = 0 } = {}) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, k = 1 + (r() - .5) * 2 * jit;
      const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
      pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
    }
    return closed(pts);
  }
  const O = 'class="o"';                           // ink outline, 3 px on screen (see .o in the SVG <style>)
  const svgWrap = (inner, vb = '-50 -50 100 100', ow = 3) =>
    `<svg viewBox="${vb}" aria-hidden="true" style="--ow:${ow}px"><style>.o{stroke:#3A1F12;stroke-width:var(--ow);vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}.t{vector-effect:non-scaling-stroke;stroke-linecap:round;fill:none}</style>${inner}</svg>`;
  const at = (x, y, s, inner, rot = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})">${inner}</g>`;

  /* ───────── the food (each drawn around 0,0 in a ~100 × 100 box) ───────── */
  const FOOD = {
    plate(seed = 1) {
      const r = rng(seed);
      return `<ellipse cx="2.4" cy="3" rx="47" ry="47" fill="#3A1F12"/>` +
        `<path d="${blob(r, 0, 0, 47, 47, { n: 18, jit: .006 })}" fill="#FFFDF8" ${O}/>` +
        `<circle r="37" fill="none" stroke="#EAD8BC" stroke-width="1.6"/><circle r="43" fill="none" stroke="#F3E6D2" stroke-width="1"/>`;
    },
    rice(seed = 2) {
      const r = rng(seed);
      let s = `<path d="${blob(r, 0, 2, 44, 37, { n: 12, jit: .1 })}" fill="#FFF3D9" ${O}/>`;
      for (let i = 0; i < 90; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 34;
        s += `<ellipse cx="${f(Math.cos(a) * d * 1.1)}" cy="${f(2 + Math.sin(a) * d * .9)}" rx="2.7" ry="1.1" transform="rotate(${f(r() * 180)} ${f(Math.cos(a) * d * 1.1)} ${f(2 + Math.sin(a) * d * .9)})" fill="#FFFFFF" stroke="#E2CBA0" stroke-width=".5"/>`;
      }
      for (let i = 0; i < 12; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 30;
        s += `<ellipse cx="${f(Math.cos(a) * d)}" cy="${f(2 + Math.sin(a) * d * .85)}" rx="2.4" ry="1.3" transform="rotate(${f(r() * 180)} ${f(Math.cos(a) * d)} ${f(2 + Math.sin(a) * d * .85)})" fill="${r() < .6 ? '#EE6A2B' : '#F2B23E'}"/>`;
      }
      return s;
    },
    salad(seed = 3) {
      const r = rng(seed);
      let s = `<path d="${blob(r, 0, 0, 45, 40, { n: 14, jit: .16 })}" fill="#B9E07E" ${O}/>`;
      const curl = (col, w, len) => {
        const x = (r() - .5) * 70, y = (r() - .5) * 60, a = r() * Math.PI;
        const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
        return `<path class="t" d="M${f(x)},${f(y)} Q${f((x + x2) / 2 + (r() - .5) * 14)},${f((y + y2) / 2 + (r() - .5) * 14)} ${f(x2)},${f(y2)}" stroke="${col}" stroke-width="${w}"/>`;
      };
      for (let i = 0; i < 46; i++) s += curl(['#7DBF45', '#DDF3A4', '#9ACD5A'][i % 3], 2.2, 10 + r() * 12);
      for (let i = 0; i < 14; i++) s += curl('#7B2C6E', 3.2, 10 + r() * 10);
      for (let i = 0; i < 3; i++) {                      // tomato wedges
        const x = -18 + i * 17 + (r() - .5) * 6, y = (i % 2 ? 14 : -12) + (r() - .5) * 6, rot = r() * 360;
        s += at(x, y, 1, `<path d="M-10,0 A10,9 0 0 1 10,0 Q0,4 -10,0Z" fill="#D93A2E" ${O}/><path d="M-6.5,-.6 A6.5,5.4 0 0 1 6.5,-.6 Q0,2 -6.5,-.6Z" fill="#F27058"/><circle cx="-2.5" cy="-2" r=".9" fill="#FFE9A8"/><circle cx="2.4" cy="-2.4" r=".9" fill="#FFE9A8"/>`, rot);
      }
      return s;
    },
    potato(seed = 4, n = 8) {
      const r = rng(seed);
      let s = '';
      const spots = [[-22, -18], [4, -24], [26, -12], [-28, 8], [-4, 0], [22, 14], [-14, 24], [10, 28], [32, 32], [-34, 30]].slice(0, n);
      spots.forEach(([x, y], i) => {
        const rr = 14 + r() * 3;
        s += `<path d="${blob(r, x, y, rr, rr * .92, { n: 9, jit: .09, rot: r() * 3 })}" fill="#F2B23E" ${O}/>` +
          `<path d="${blob(r, x - 1.5, y - 1.5, rr * .55, rr * .45, { n: 8, jit: .15 })}" fill="#F9D684"/>` +
          `<ellipse cx="${f(x + rr * .45)}" cy="${f(y + rr * .4)}" rx="${f(rr * .22)}" ry="${f(rr * .14)}" fill="#D98E2B" opacity=".7"/>`;
      });
      return s;
    },
    sauce(seed = 5) {
      const r = rng(seed);
      let s = `<path d="${blob(r, 0, 0, 40, 34, { n: 11, jit: .1 })}" fill="#FFFDF5" ${O}/><path d="${blob(r, -8, -8, 16, 9, { n: 8, jit: .2 })}" fill="#FFFFFF"/>`;
      for (let i = 0; i < 18; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 28;
        s += `<ellipse cx="${f(Math.cos(a) * d)}" cy="${f(Math.sin(a) * d * .8)}" rx="2.2" ry="1.1" transform="rotate(${f(r() * 180)} ${f(Math.cos(a) * d)} ${f(Math.sin(a) * d * .8)})" fill="#4E8A3A"/>`;
      }
      return s;
    },
    chop(r) {                                           // one lamb chop: meat, char, grill stripes, cream bone
      const id = 'c' + Math.floor(r() * 1e9);
      const meat = blob(r, 0, 0, 24, 17, { n: 10, jit: .12 });
      let s = `<rect x="18" y="-4.5" width="26" height="9" rx="4.5" fill="#F3E3C3" ${O}/><circle cx="44" cy="-3" r="4.6" fill="#F3E3C3" ${O}/><circle cx="44" cy="3.5" r="4.2" fill="#F3E3C3" ${O}/>`;
      s += `<clipPath id="${id}"><path d="${meat}"/></clipPath><path d="${meat}" fill="#6E3618" ${O}/>`;
      s += `<g clip-path="url(#${id})">`;
      for (let i = 0; i < 5; i++) s += `<path d="${blob(r, (r() - .5) * 36, (r() - .5) * 24, 4 + r() * 5, 3 + r() * 3)}" fill="#3A1F12" opacity=".75"/>`;
      for (let i = -3; i <= 3; i++) s += `<line class="t" x1="${i * 9 - 20}" y1="-24" x2="${i * 9 + 8}" y2="24" stroke="#2A140B" stroke-width="3.2"/>`;
      s += `<path d="${blob(r, -6, -6, 8, 4)}" fill="#A0582B" opacity=".55"/></g>`;
      return s;
    },
    chops(seed = 6, n = 3) {
      const r = rng(seed);
      const pos = [[-14, -10, -20], [8, 6, 15], [-8, 18, -8], [16, -16, 30]].slice(0, n);
      return pos.map(([x, y, rot]) => at(x, y, 1, FOOD.chop(r), rot)).join('');
    },
    doner(seed = 7, n = 14) {
      const r = rng(seed);
      let s = '';
      for (let i = 0; i < n; i++) {
        const x = (r() - .5) * 56, y = (r() - .5) * 46, rot = r() * 180;
        const col = ['#8A4A22', '#A65E2E', '#6B3518', '#B8703A'][i % 4];
        s += at(x, y, 1, `<path d="${blob(r, 0, 0, 13 + r() * 6, 4 + r() * 2, { n: 8, jit: .25 })}" fill="${col}" ${O}/><path class="t" d="M-8,-1 Q0,2 9,-1" stroke="#3A1F12" stroke-width="1.2" opacity=".5"/>`, rot);
      }
      return s;
    },
    adana(seed = 8, rot = 0) {
      const r = rng(seed);
      const pts = [];
      for (let i = 0; i <= 12; i++) pts.push([-40 + i * (80 / 12), -7 - (i % 2 ? 2 : 0) - r() * 1.5]);
      for (let i = 12; i >= 0; i--) pts.push([-40 + i * (80 / 12), 7 + (i % 2 ? 2 : 0) + r() * 1.5]);
      let s = `<line class="t" x1="-50" y1="0" x2="50" y2="0" stroke="#3A1F12" stroke-width="6"/><line class="t" x1="-49" y1="0" x2="49" y2="0" stroke="#E8D8B8" stroke-width="3"/>`;
      s += `<path d="${closed(pts)}" fill="#9A3B1E" ${O}/>`;
      for (let i = 0; i < 10; i++) s += `<ellipse cx="${f(-34 + i * 7.5)}" cy="${f((r() - .5) * 6)}" rx="1.6" ry="1" fill="#D9472B"/>`;
      for (let i = 0; i < 5; i++) s += `<line class="t" x1="${-30 + i * 15}" y1="-7" x2="${-26 + i * 15}" y2="7" stroke="#3A1F12" stroke-width="2.4" opacity=".7"/>`;
      return at(0, 0, 1, s, rot);
    },
    kofte(seed = 9, n = 5) {
      const r = rng(seed);
      const pos = [[-22, -8], [0, -14], [22, -6], [-10, 12], [14, 14]].slice(0, n);
      return pos.map(([x, y]) => at(x, y, 1, `<path d="${blob(r, 0, 0, 13, 8, { n: 9, jit: .1 })}" fill="#7A3E1C" ${O}/><line class="t" x1="-7" y1="-6" x2="-3" y2="6" stroke="#2A140B" stroke-width="2.4"/><line class="t" x1="2" y1="-6" x2="6" y2="6" stroke="#2A140B" stroke-width="2.4"/><path d="${blob(r, -4, -3, 4, 2)}" fill="#A0582B" opacity=".6"/>`, r() * 60 - 30)).join('');
    },
    sis(seed = 10) {
      const r = rng(seed);
      let s = `<line class="t" x1="-50" y1="0" x2="50" y2="0" stroke="#3A1F12" stroke-width="6"/><line class="t" x1="-49" y1="0" x2="49" y2="0" stroke="#E8D8B8" stroke-width="3"/>`;
      for (let i = 0; i < 6; i++) {
        const x = -32 + i * 13;
        s += `<path d="${blob(r, x, 0, 6.5, 7.5, { n: 7, jit: .16 })}" fill="${i % 2 ? '#7A3A1A' : '#8E4520'}" ${O}/><line class="t" x1="${x - 3}" y1="-5" x2="${x + 1}" y2="5" stroke="#2A140B" stroke-width="2"/>`;
      }
      return s;
    },
    biefstuk(seed = 11, n = 5) {
      const r = rng(seed);
      let s = '';
      for (let i = 0; i < n; i++) {
        const y = -20 + i * 10, x = (r() - .5) * 10;
        s += at(x, y, 1, `<path d="${blob(r, 0, 0, 26, 4.8, { n: 10, jit: .12 })}" fill="${i % 2 ? '#7A3A1A' : '#5E2B12'}" ${O}/><line class="t" x1="-14" y1="-4" x2="-10" y2="4" stroke="#2A140B" stroke-width="2.2"/><line class="t" x1="2" y1="-4" x2="6" y2="4" stroke="#2A140B" stroke-width="2.2"/>`, (r() - .5) * 12);
      }
      return s;
    },
    bread(seed = 12, n = 4) {
      const r = rng(seed);
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + .4;
        let w = `<path d="M-14,-12 Q0,-20 16,-10 L10,14 Q-2,18 -12,12 Z" fill="#E8B062" ${O}/><path d="M-12,-10 Q0,-17 14,-9 L13,-5 Q0,-12 -11,-6Z" fill="#C98A3A"/>`;
        for (let k = 0; k < 6; k++) w += `<ellipse cx="${f((r() - .5) * 18)}" cy="${f(-4 + r() * 14)}" rx="1.4" ry=".8" fill="#FFF3D6"/>`;
        s += at(Math.cos(a) * 30, Math.sin(a) * 30, .9, w, a * 57 + 90);
      }
      return s;
    },
    lahmacun(seed = 13, withDoner = true) {
      const r = rng(seed);
      let s = `<path d="${blob(r, 0, 0, 46, 44, { n: 16, jit: .05 })}" fill="#E9B36A" ${O}/><path d="${blob(r, 0, 0, 39, 37, { n: 14, jit: .07 })}" fill="#C8582F" opacity=".85"/>`;
      for (let i = 0; i < 40; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 34;
        s += `<circle cx="${f(Math.cos(a) * d)}" cy="${f(Math.sin(a) * d)}" r="${f(1.2 + r() * 1.6)}" fill="${r() < .5 ? '#8E2E1A' : '#B4442A'}"/>`;
      }
      if (withDoner) s += at(-4, 2, .62, FOOD.doner(seed + 1, 10));
      for (let i = 0; i < 9; i++) s += at((r() - .5) * 56, (r() - .5) * 50, 1, `<path d="M0,0 Q3,-4 6,0 Q3,4 0,0Z" fill="#4E9A3A" ${O}/>`, r() * 360);
      s += at(30, 28, 1, `<path d="M-13,0 A13,13 0 0 1 13,0 Z" fill="#F6D44A" ${O}/><path d="M-9,-1 A9,9 0 0 1 9,-1 Z" fill="#FFF2A8"/><line class="t" x1="0" y1="-1" x2="0" y2="-9" stroke="#F6D44A" stroke-width="1.5"/>`, -30);
      return s;
    },
  };

  /* a small plate: rice top left, salad left, potatoes right, the meat on top */
  function miniPlate(meat, seed) {
    const meats = {
      kofte: at(6, 0, .62, FOOD.kofte(seed)),
      sis: at(4, 0, .7, FOOD.sis(seed), -24),
      pirzola: at(6, -2, .62, FOOD.chops(seed, 3)),
      grillmix: at(-6, -4, .42, FOOD.doner(seed, 10)) + at(18, -12, .36, FOOD.kofte(seed, 3)) + at(6, 12, .36, FOOD.biefstuk(seed, 3)) + at(16, 4, .44, FOOD.chops(seed, 2)),
      starmix: at(-6, -4, .42, FOOD.doner(seed, 10)) + at(8, -14, .34, FOOD.adana(seed), -20) + at(6, 12, .36, FOOD.biefstuk(seed, 3)) + at(18, 2, .44, FOOD.chops(seed, 2)),
    };
    return FOOD.plate(seed) + at(-16, -18, .4, FOOD.rice(seed)) + at(-20, 12, .4, FOOD.salad(seed)) + at(20, 16, .42, FOOD.potato(seed, 6)) + meats[meat];
  }
  /* a Turkish bread pocket, stuffed */
  function pocket(filling, seed) {
    const r = rng(seed);
    const fill = filling === 'adana' ? at(0, -8, .5, FOOD.adana(seed), -6) : at(0, -10, .55, FOOD.doner(seed, 12));
    return `<path d="M-40,-4 Q-36,-26 0,-28 Q36,-26 40,-4 Z" fill="#E8B062" ${O}/>` + fill +
      at(-10, -14, .3, FOOD.salad(seed + 3)) + at(14, -16, .22, FOOD.salad(seed + 4)) +
      `<path d="M-30,-12 Q-14,-6 0,-12 Q14,-18 30,-10" class="t" stroke="#FFFDF5" stroke-width="4"/>` +
      `<path d="M-44,-6 Q0,6 44,-6 Q40,34 0,38 Q-40,34 -44,-6 Z" fill="#E8B062" ${O}/><path d="M-38,4 Q0,14 38,4" class="t" stroke="#C98A3A" stroke-width="3"/>` +
      [...Array(8)].map(() => `<ellipse cx="${f((r() - .5) * 64)}" cy="${f(14 + r() * 16)}" rx="1.6" ry=".9" fill="#FFF3D6"/>`).join('');
  }

  /* ───────── evil eye ───────── */
  const EYE = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="#1F3A8A" stroke="#3A1F12" stroke-width="2"/><circle cx="20" cy="20" r="12.5" fill="#FFFFFF"/><circle cx="20" cy="20" r="8.4" fill="#5FB6EC"/><circle cx="20" cy="20" r="4.4" fill="#111111"/><circle cx="17.6" cy="17.4" r="1.6" fill="#FFFFFF"/></svg>';
  $$('.eye').forEach(e => { e.innerHTML = EYE; });

  /* ───────── fill in the art ───────── */
  // Star Mix layers, bottom to top
  let LAYERS;
  if (!PHOTO) {
    $('.plate').innerHTML = svgWrap(FOOD.plate(1));
    const ART = { rice: FOOD.rice(2), salad: FOOD.salad(3), potato: FOOD.potato(4), sauce: FOOD.sauce(5), chops: FOOD.chops(6) };
    $$('.ing').forEach(el => { $('.ing__art', el).innerHTML = svgWrap(ART[el.dataset.ing]); });
    const DISH = {
      doner: () => pocket('doner', 21), 'adana-broodje': () => pocket('adana', 22), lahmacun: () => FOOD.lahmacun(23),
      kofte: () => miniPlate('kofte', 24), sis: () => miniPlate('sis', 25), pirzola: () => miniPlate('pirzola', 26),
      grillmix: () => miniPlate('grillmix', 27), starmix: () => miniPlate('starmix', 28),
    };
    $$('.dish__art').forEach(el => { el.innerHTML = svgWrap(DISH[el.dataset.dish](), '-52 -52 104 104', 2); });
    LAYERS = [
      { label: 'het bord', art: FOOD.plate(31) },
      { label: 'rijst, salade & aardappelschijfjes', art: at(-16, -16, .42, FOOD.rice(32)) + at(-18, 14, .44, FOOD.salad(33)) + at(18, 6, .48, FOOD.potato(34, 7)) },
      { label: 'döner & adana', art: at(-10, -6, .55, FOOD.doner(35, 14)) + at(14, 14, .46, FOOD.adana(36), -28) + at(18, -16, .4, FOOD.adana(37), 12) },
      { label: 'biefstuk & lamskoteletten', art: at(-14, 8, .46, FOOD.biefstuk(38, 5), 20) + at(12, -6, .55, FOOD.chops(39, 3)) },
      { label: 'Turks brood & saus', art: FOOD.bread(40, 4) + at(-2, -2, .3, FOOD.sauce(41)) },
    ].map(l => ({ ...l, art: svgWrap(`<circle class="dash" r="49"/>${l.art}`, '-55 -55 110 110', 2.5) }));
  } else {
    const cut = k => `<img class="cut" src="${PICS[k]}" alt="" draggable="false" decoding="async" />`;
    $('.plate').innerHTML = cut('plate');
    $$('.ing').forEach(el => { $('.ing__art', el).innerHTML = cut(el.dataset.ing); });
    $$('.dish__art').forEach(el => {
      el.innerHTML = `<img class="dish__photo" src="${PICS['dish-' + el.dataset.dish]}" alt="${el.parentNode.querySelector('h3').textContent}" loading="lazy" decoding="async" />`;
    });
    // each piece: [photo, centre x %, centre y %, width %, rotation]
    const place = pieces => pieces.map(([k, x, y, w, r = 0]) =>
      `<img class="cut" src="${PICS[k]}" alt="" draggable="false" decoding="async" style="left:${x}%;top:${y}%;width:${w}%;--r:${r}deg" />`).join('');
    const dash = '<svg viewBox="-55 -55 110 110" aria-hidden="true"><circle class="dash" r="49"/></svg>';
    LAYERS = [
      { label: 'het bord', pieces: [['plate', 50, 50, 92]] },
      { label: 'rijst, salade & aardappelschijfjes', pieces: [['rice', 35, 31, 40], ['salad', 32, 68, 42], ['potato', 68, 54, 46]] },
      { label: 'döner & adana', pieces: [['doner', 38, 48, 50], ['adana', 67, 50, 50, -18]] },
      { label: 'biefstuk & lamskoteletten', pieces: [['biefstuk', 36, 54, 46, 12], ['chops', 64, 46, 54, 8]] },
      { label: 'Turks brood & saus', pieces: [['bread', 50, 50, 54], ['sauce', 50, 51, 20]] },
    ].map(l => ({ label: l.label, art: dash + `<div class="layer__food">${place(l.pieces)}</div>` }));
  }
  const scene = $('.stack__scene');
  LAYERS.forEach((l, i) => {
    const d = document.createElement('div');
    d.className = 'layer';
    d.innerHTML = `<div class="layer__disc">${l.art}</div><p class="layer__label layer__label--${i % 2 ? 'l' : 'r'}">${l.label}</p>`;
    scene.appendChild(d);
  });
  const layerEls = $$('.layer', scene);

  // ticker
  const words = ['DÖNER', 'ADANA', 'LAHMACUN', 'KÖFTE', 'PIRZOLA', 'SIS KEBAP', 'BÜFTEK', 'STAR MIX'];
  const run = words.map(w => `<span>${w}</span><span class="star">✦</span>`).join('');
  $('.ticker__track').innerHTML = run + run;

  // checkerboard behind the favourites
  const checker = $('.checker');
  function buildChecker() {
    const sq = PHONE ? 52 : 84, sec = $('.faves');
    const cols = Math.ceil(sec.offsetWidth / sq) + 1, rows = Math.ceil(sec.offsetHeight / sq) + 1;   // odd overhang is centred
    checker.style.setProperty('--sq', sq + 'px');
    checker.style.setProperty('--cols', cols);
    checker.innerHTML = '';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const s = document.createElement('span');
      if ((x + y) % 2) s.className = 'o';
      s.dataset.x = x; s.dataset.y = y;
      checker.appendChild(s);
    }
    return { cols, rows };
  }

  /* ───────── live open / closed (Europe/Amsterdam) ───────── */
  function status() {
    const parts = new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const h = +parts.find(p => p.type === 'hour').value % 24, m = +parts.find(p => p.type === 'minute').value;
    const mins = h * 60 + m, open = mins >= 12 * 60 && mins < 22 * 60;
    const el = $('.status');
    el.classList.toggle('is-closed', !open);
    $('span', el).textContent = open ? 'Nu open · tot 22:00' : mins < 12 * 60 ? 'Nu gesloten · vandaag open om 12:00' : 'Nu gesloten · morgen open om 12:00';
  }
  status(); setInterval(status, 60000);

  // the version switch shows at the top and bottom of the page (phones: only at the bottom), out of the way of the content
  const vs = $('.vswitch');
  if (vs && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver(es => {
      es.forEach(e => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      vs.classList.toggle('is-away', !seen.size);
    });
    (PHONE ? [$('.foot')] : [$('.hero'), $('.foot')]).forEach(el => io.observe(el));
  }

  // the map loads only when it gets close
  const iframe = $('.map iframe');
  const loadMap = () => { if (!iframe.src) iframe.src = iframe.dataset.src; };

  /* ───────── motion ───────── */
  const FLOAT = {                                   // where each ingredient waits, as % of the plate stage
    rice: { x: -20, y: -14, r: -14 }, sauce: { x: 34, y: -8, r: 18 }, chops: { x: 42, y: 4, r: 16 },
    potato: { x: 20, y: 36, r: 10 }, salad: { x: -22, y: 30, r: -12 },
  };
  const LAND = { rice: [.05, .25], salad: [.20, .40], potato: [.35, .55], sauce: [.50, .65], chops: [.60, .80] };
  const STEP = { rice: 'rice', salad: 'salad', potato: 'potato', sauce: 'sauce', chops: 'chops' };

  function finalState() {
    gsap.set('.ing', { x: 0, y: 0, scale: 1, rotation: 0 });
    gsap.set('.tag-label', { autoAlpha: 0 });
    $$('.checklist li').forEach(li => li.classList.add('is-done'));
    gsap.set(['.sticker', '.polaroid'], { autoAlpha: 1 });
    gsap.set('.scroll-hint', { autoAlpha: 0 });
    gsap.set('.steam path', { strokeDashoffset: 0 });
    layerEls.forEach((l, i) => gsap.set(l, { xPercent: -50, yPercent: -50, y: pressedY(i), autoAlpha: 1 }));
    gsap.set('.layer__label, .layer .dash', { autoAlpha: 0 });
    $$('.layers-list li').forEach(li => li.classList.add('is-on'));
    gsap.set('.stamp', { autoAlpha: 1 });
    buildChecker();
    loadMap();
  }
  const gap = () => (PHONE ? 70 : Math.min(112, innerHeight * .115));
  const explodedY = i => (2 - i) * gap();
  const pressedY = i => gap() * 1.2 - i * 7;

  function boot() {
    if (RM) { finalState(); return; }

    const lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    const navH = () => $('.nav').offsetHeight;
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'), t = id === '#top' ? 0 : $(id);
      if (t === null) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: t === 0 ? 0 : -navH() + 1, duration: 1.4 });
    }));

    /* load: tiles drop in, plate spins in, ingredients pop and float */
    const stage = $('.stage'), S = () => stage.offsetWidth;
    $$('.ing').forEach(el => {
      const p = FLOAT[el.dataset.ing];
      gsap.set(el, { x: () => p.x / 100 * S(), y: () => p.y / 100 * S(), rotation: p.r, scale: 0 });
    });
    gsap.set('.sticker', { autoAlpha: 0, scale: .2, rotation: -30 });
    gsap.set('.polaroid', { autoAlpha: 0, yPercent: PHONE ? 30 : 140 });
    $$('.steam path').forEach(p => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });

    const intro = gsap.timeline({ delay: .1 });
    intro.from('.tiles--big .tile', { y: -140, rotation: () => gsap.utils.random(-16, 16), autoAlpha: 0, duration: .55, ease: 'back.out(2.2)', stagger: .07 })
      .from('.logo__eye', { scale: 0, rotation: -60, duration: .5, ease: 'back.out(2)' }, '-=.3')
      .from('.plate', { scale: .6, rotation: -120, autoAlpha: 0, duration: .9, ease: 'back.out(1.4)' }, .2)
      .to('.ing', { scale: .72, duration: .45, ease: 'back.out(2.4)', stagger: .08 }, .7)
      .from(['.hero .kicker', '.hero .lede', '.hero .actions', '.checklist'], { y: 24, autoAlpha: 0, duration: .8, ease: 'power3.out', stagger: .08 }, .4);
    const floats = $$('.ing__float').map((el, i) => gsap.to(el, { y: -8, duration: .8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * .23 }));

    /* 1 · the plate gets served: pinned on desktop, scrubbed through the stage on phones */
    const plateTL = gsap.timeline({ defaults: { ease: 'none' } });
    plateTL.to('.scroll-hint', { autoAlpha: 0, duration: .05 }, 0);
    $$('.ing').forEach((el, i) => {
      const k = el.dataset.ing, [a, b] = LAND[k], p = FLOAT[k], li = $(`.checklist li[data-step="${STEP[k]}"]`);
      plateTL.fromTo(el, { x: () => p.x / 100 * S(), y: () => p.y / 100 * S(), rotation: p.r, scale: .72 },
        { x: 0, y: 0, rotation: 0, scale: 1, duration: b - a, ease: 'power2.inOut', immediateRender: false }, a)
        .to($('.tag-label', el), { autoAlpha: 0, duration: (b - a) * .4 }, a + (b - a) * .4)
        .to({}, { duration: .001, onComplete() { li.classList.add('is-done'); floats[i].pause(); gsap.to($('.ing__float', el), { y: 0, duration: .2 }); },
          onReverseComplete() { li.classList.remove('is-done'); floats[i].resume(); } }, b - .001);
    });
    plateTL.to(stage, { scale: 1.03, duration: .03, ease: 'power2.out' }, .80)
      .to(stage, { scale: 1, duration: .05, ease: 'power2.in' }, .83)
      .to('.steam path', { strokeDashoffset: 0, duration: .06, stagger: .01 }, .81)
      .fromTo('.sticker', { autoAlpha: 0, scale: .2, rotation: -30 }, { autoAlpha: 1, scale: 1, rotation: 12, duration: .07, ease: 'back.out(2.5)', immediateRender: false }, .85)
      .fromTo('.polaroid', { autoAlpha: 0, yPercent: PHONE ? 30 : 140 }, { autoAlpha: 1, yPercent: 0, duration: .12, ease: 'power3.out', immediateRender: false }, .88);
    if (!PHONE) {
      ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: '+=230%', pin: true, scrub: .6, animation: plateTL, anticipatePin: 1 });
    } else {
      ScrollTrigger.create({ trigger: '.stage', start: 'top 72%', end: () => '+=' + (stage.offsetHeight + $('.polaroid').offsetHeight + 120), scrub: .6, animation: plateTL });
    }

    /* 2 · Star Mix: layers drop in, press together, then the stamp */
    layerEls.forEach(l => gsap.set(l, { xPercent: -50, yPercent: -50, y: -innerHeight, autoAlpha: 0 }));
    gsap.set('.stamp', { autoAlpha: 0, scale: 2.4, rotation: -30 });
    const mixTL = gsap.timeline({ defaults: { ease: 'none' } });
    layerEls.forEach((l, i) => {
      const a = i * .09;
      mixTL.fromTo(l, { y: -innerHeight * .9, autoAlpha: 0 }, { y: explodedY(i), autoAlpha: 1, duration: .09, ease: 'power3.out', immediateRender: false }, a);
      const li = $(`.layers-list li[data-layer="${i + 1}"]`);
      if (li) mixTL.to({}, { duration: .001, onComplete: () => li.classList.add('is-on'), onReverseComplete: () => li.classList.remove('is-on') }, a + .08);
    });
    mixTL.to($$('.layer__label, .layer .dash', scene), { autoAlpha: 0, duration: .08 }, .5);
    layerEls.forEach((l, i) => mixTL.to(l, { y: pressedY(i), duration: .2, ease: 'power2.inOut' }, .55));
    mixTL.to('.stamp', { autoAlpha: 1, scale: 1, rotation: -12, duration: .06, ease: 'back.out(3)' }, .8)
      .to('.price-tag--big', { scale: 1.12, duration: .04, ease: 'power2.out' }, .86)
      .to('.price-tag--big', { scale: 1, duration: .06, ease: 'power2.in' }, .9)
      .to({}, { duration: .04 }, .96);
    if (!PHONE) ScrollTrigger.create({ trigger: '.mix', start: 'top top', end: '+=220%', pin: true, scrub: .6, animation: mixTL, anticipatePin: 1 });
    else ScrollTrigger.create({ trigger: '.stack', start: 'top 80%', end: 'bottom 20%', scrub: .6, animation: mixTL });

    /* ticker: always moving, faster while scrolling */
    const tick = gsap.to('.ticker__track', { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
    ScrollTrigger.create({ trigger: '.ticker', start: 'top bottom', end: 'bottom top',
      onUpdate: s => { tick.timeScale(1 + Math.min(5, Math.abs(s.getVelocity()) / 350)); gsap.to(tick, { timeScale: 1, duration: .9, overwrite: true }); },
      onToggle: s => (s.isActive ? tick.resume() : tick.pause()) });

    /* 3 · checkerboard flips in from the centre, then the cards land */
    const grid = buildChecker();
    const squares = $$('.checker span:not(.o)');
    gsap.set(squares, { scale: 0, rotation: 90 });
    gsap.set('.card--head', { y: 50, autoAlpha: 0 });
    gsap.set('.dish', { y: 110, rotation: () => gsap.utils.random(-9, 9), autoAlpha: 0 });
    gsap.set('.dish__price', { scale: 0, rotation: -180 });
    ScrollTrigger.create({ trigger: '.faves', start: 'top 72%', once: true, onEnter() {
      const cx = grid.cols / 2, cy = grid.rows / 2;
      gsap.to(squares, { scale: 1, rotation: 0, duration: .35, ease: 'power2.out', delay: i => Math.hypot(+squares[i].dataset.x - cx, +squares[i].dataset.y - cy) * .028 });
      gsap.to('.card--head', { y: 0, autoAlpha: 1, duration: .8, ease: 'power3.out', delay: .15 });
      gsap.to('.dish', { y: 0, rotation: 0, autoAlpha: 1, duration: .7, ease: 'back.out(1.7)', stagger: .09, delay: .35 });
      gsap.to('.dish__price', { scale: 1, rotation: (i, el) => (el.classList.contains('dish__price--red') ? 8 : 8), duration: .5, ease: 'back.out(2.5)', stagger: .09, delay: .9 });
    } });

    /* 4 · menu cards slide up, tags stamp, rows appear */
    $$('.mcard').forEach(c => {
      gsap.set(c, { y: 60, autoAlpha: 0 });
      gsap.set($('.mcard__tag', c), { scale: 1.7, autoAlpha: 0 });
      gsap.set($$('.mrows li', c), { y: 10, autoAlpha: 0 });
      ScrollTrigger.create({ trigger: c, start: 'top 88%', once: true, onEnter() {
        gsap.timeline()
          .to(c, { y: 0, autoAlpha: 1, duration: .8, ease: 'power3.out' })
          .to($('.mcard__tag', c), { scale: 1, autoAlpha: 1, duration: .4, ease: 'back.out(3)' }, .25)
          .to($$('.mrows li', c), { y: 0, autoAlpha: 1, duration: .5, ease: 'power3.out', stagger: .05 }, .35);
      } });
    });
    gsap.from('.menu__head > *', { y: 30, autoAlpha: 0, duration: .8, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '.menu__head', start: 'top 85%', once: true } });

    /* 5 · visit */
    ScrollTrigger.create({ trigger: '.visit', start: 'top bottom+=400', once: true, onEnter: loadMap });
    gsap.from('.visit__copy > *', { y: 30, autoAlpha: 0, duration: .8, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: '.visit', start: 'top 75%', once: true } });
    gsap.from('.map', { y: 50, rotation: 3, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.visit', start: 'top 70%', once: true } });

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    let w = innerWidth;
    addEventListener('resize', () => { if (Math.abs(innerWidth - w) > 40) { w = innerWidth; buildChecker(); gsap.set($$('.checker span:not(.o)'), { scale: 1, rotation: 0 }); ScrollTrigger.refresh(); } });
  }

  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(boot);
})();
