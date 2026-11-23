// The World in One Day — Sunday 22 November 2026 (news-image-20261122, r2)
// A fresh, self-drawn newspaper one-pager. Node 22, standard library only.
// Draws the whole image with a tiny built-in 5x7 bitmap font and a small
// PNG encoder, then writes it to $MAKEFUN_OUTPUT_DIR/entry.png.
// Deterministic: no clock, no randomness, no network.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------- font (5x7)
// Each glyph is 7 rows; each row is a 5-bit value, bit 4 = leftmost pixel.
const FONT = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  a: [0x00, 0x00, 0x0e, 0x01, 0x0f, 0x11, 0x0f],
  b: [0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x1e],
  c: [0x00, 0x00, 0x0e, 0x10, 0x10, 0x11, 0x0e],
  d: [0x01, 0x01, 0x0d, 0x13, 0x11, 0x11, 0x0f],
  e: [0x00, 0x00, 0x0e, 0x11, 0x1f, 0x10, 0x0e],
  f: [0x06, 0x08, 0x1e, 0x08, 0x08, 0x08, 0x08],
  g: [0x00, 0x0f, 0x11, 0x11, 0x0f, 0x01, 0x0e],
  h: [0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x11],
  i: [0x04, 0x00, 0x0c, 0x04, 0x04, 0x04, 0x0e],
  j: [0x02, 0x00, 0x06, 0x02, 0x02, 0x12, 0x0c],
  k: [0x10, 0x10, 0x12, 0x14, 0x18, 0x14, 0x12],
  l: [0x0c, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  m: [0x00, 0x00, 0x1a, 0x15, 0x15, 0x15, 0x15],
  n: [0x00, 0x00, 0x16, 0x19, 0x11, 0x11, 0x11],
  o: [0x00, 0x00, 0x0e, 0x11, 0x11, 0x11, 0x0e],
  p: [0x00, 0x00, 0x1e, 0x11, 0x1e, 0x10, 0x10],
  q: [0x00, 0x00, 0x0d, 0x13, 0x0f, 0x01, 0x01],
  r: [0x00, 0x00, 0x16, 0x19, 0x10, 0x10, 0x10],
  s: [0x00, 0x00, 0x0f, 0x10, 0x0e, 0x01, 0x1e],
  t: [0x08, 0x08, 0x1e, 0x08, 0x08, 0x09, 0x06],
  u: [0x00, 0x00, 0x11, 0x11, 0x11, 0x13, 0x0d],
  v: [0x00, 0x00, 0x11, 0x11, 0x11, 0x0a, 0x04],
  w: [0x00, 0x00, 0x11, 0x15, 0x15, 0x1b, 0x11],
  x: [0x00, 0x00, 0x11, 0x0a, 0x04, 0x0a, 0x11],
  y: [0x00, 0x00, 0x11, 0x11, 0x0f, 0x01, 0x0e],
  z: [0x00, 0x00, 0x1f, 0x02, 0x04, 0x08, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1f],
  '3': [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
  '"': [0x0a, 0x0a, 0x0a, 0x00, 0x00, 0x00, 0x00],
  '#': [0x0a, 0x0a, 0x1f, 0x0a, 0x1f, 0x0a, 0x0a],
  '$': [0x04, 0x0f, 0x14, 0x0e, 0x05, 0x1e, 0x04],
  '%': [0x18, 0x19, 0x02, 0x04, 0x08, 0x13, 0x03],
  '&': [0x0c, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0d],
  "'": [0x04, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00],
  '(': [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ')': [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  '*': [0x00, 0x04, 0x15, 0x0e, 0x15, 0x04, 0x00],
  '+': [0x00, 0x04, 0x04, 0x1f, 0x04, 0x04, 0x00],
  ',': [0x00, 0x00, 0x00, 0x00, 0x04, 0x04, 0x08],
  '-': [0x00, 0x00, 0x00, 0x0e, 0x00, 0x00, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  '/': [0x01, 0x02, 0x02, 0x04, 0x08, 0x08, 0x10],
  ':': [0x00, 0x0c, 0x0c, 0x00, 0x0c, 0x0c, 0x00],
  ';': [0x00, 0x0c, 0x0c, 0x00, 0x04, 0x04, 0x08],
  '=': [0x00, 0x00, 0x1f, 0x00, 0x1f, 0x00, 0x00],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
  '[': [0x0e, 0x08, 0x08, 0x08, 0x08, 0x08, 0x0e],
  ']': [0x0e, 0x02, 0x02, 0x02, 0x02, 0x02, 0x0e],
  _: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f],
  '·': [0x00, 0x00, 0x00, 0x0c, 0x0c, 0x00, 0x00],
  '—': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  '–': [0x00, 0x00, 0x00, 0x0e, 0x00, 0x00, 0x00],
  '×': [0x00, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x00],
  '°': [0x04, 0x0a, 0x04, 0x00, 0x00, 0x00, 0x00],
  '’': [0x04, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00],
  '‘': [0x04, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00],
  '“': [0x0a, 0x0a, 0x0a, 0x00, 0x00, 0x00, 0x00],
  '”': [0x0a, 0x0a, 0x0a, 0x00, 0x00, 0x00, 0x00],
};

// Fold accented letters to their plain base so the font always has a glyph.
const FOLD = {
  á: 'a', à: 'a', â: 'a', ä: 'a', ã: 'a', å: 'a', ā: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e', ē: 'e',
  í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', ö: 'o', õ: 'o',
  ú: 'u', ù: 'u', û: 'u', ü: 'u',
  ç: 'c', ñ: 'n', ý: 'y', ÿ: 'y', ß: 's',
  Á: 'A', À: 'A', Â: 'A', Ä: 'A',
  É: 'E', È: 'E', Ê: 'E',
  Í: 'I', Ó: 'O', Ô: 'O', Ö: 'O',
  Ú: 'U', Ü: 'U', Ç: 'C', Ñ: 'N',
};
function glyph(ch) {
  if (FONT[ch]) return FONT[ch];
  if (FOLD[ch]) return FONT[FOLD[ch]];
  return FONT['?'];
}

// ---------------------------------------------------------------- canvas
const W = 1024;
const H = 1024;
class Canvas {
  constructor(w, h, bg) {
    this.w = w; this.h = h;
    this.buf = new Uint8Array(w * h * 3);
    this.fillRect(0, 0, w, h, bg);
  }
  px(x, y, c) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 3;
    this.buf[i] = c[0]; this.buf[i + 1] = c[1]; this.buf[i + 2] = c[2];
  }
  fillRect(x, y, w, h, c) {
    const x0 = Math.max(0, Math.floor(x)), y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.w, Math.ceil(x + w)), y1 = Math.min(this.h, Math.ceil(y + h));
    for (let yy = y0; yy < y1; yy++) {
      let i = (yy * this.w + x0) * 3;
      for (let xx = x0; xx < x1; xx++, i += 3) {
        this.buf[i] = c[0]; this.buf[i + 1] = c[1]; this.buf[i + 2] = c[2];
      }
    }
  }
  hline(x, y, len, c) { this.fillRect(x, y, len, 1, c); }
  vline(x, y, len, c) { this.fillRect(x, y, 1, len, c); }
  line(x0, y0, x1, y1, c) {
    let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  disc(cx, cy, r, c) {
    for (let y = -r; y <= r; y++) {
      const span = Math.floor(Math.sqrt(r * r - y * y));
      this.fillRect(cx - span, cy + y, span * 2 + 1, 1, c);
    }
  }
  ellipse(cx, cy, rx, ry, c) {
    for (let y = -ry; y <= ry; y++) {
      const t = 1 - (y * y) / (ry * ry);
      if (t < 0) continue;
      const span = Math.floor(rx * Math.sqrt(t));
      this.fillRect(cx - span, cy + y, span * 2 + 1, 1, c);
    }
  }
  // Filled triangle by scanline.
  tri(x0, y0, x1, y1, x2, y2, c) {
    const minY = Math.max(0, Math.min(y0, y1, y2));
    const maxY = Math.min(this.h - 1, Math.max(y0, y1, y2));
    const pts = [[x0, y0], [x1, y1], [x2, y2]].sort((a, b) => a[1] - b[1]);
    const [a, b, d] = pts;
    const edge = (p, q, y) => {
      if (q[1] === p[1]) return null;
      return p[0] + ((q[0] - p[0]) * (y - p[1])) / (q[1] - p[1]);
    };
    for (let y = minY; y <= maxY; y++) {
      const xs = [];
      for (const [p, q] of [[a, b], [b, d], [a, d]]) {
        const v = edge(p, q, y);
        if (v !== null) xs.push(v);
      }
      if (xs.length >= 2) {
        const xa = Math.floor(Math.min(...xs)), xb = Math.ceil(Math.max(...xs));
        this.fillRect(xa, y, xb - xa + 1, 1, c);
      }
    }
  }
  text(str, x, y, s, c) {
    let cx = Math.round(x);
    const cy = Math.round(y);
    for (const ch of str) {
      const g = glyph(ch);
      for (let r = 0; r < 7; r++) {
        const row = g[r];
        for (let col = 0; col < 5; col++) {
          if (row & (1 << (4 - col))) this.fillRect(cx + col * s, cy + r * s, s, s, c);
        }
      }
      cx += 6 * s;
    }
    return cx;
  }
  textW(str, s) { return str.length * 6 * s - s; }
  textC(str, cx, y, s, c) { this.text(str, cx - this.textW(str, s) / 2, y, s, c); }
  // Word-wrap to lines of at most maxW pixels at scale s. Returns array of lines.
  wrap(str, maxW, s) {
    const words = str.split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (this.textW(t, s) <= maxW || !cur) cur = t;
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  // Draw wrapped text, return y just below the last line.
  para(str, x, y, maxW, s, c, maxLines, lh) {
    const lines = this.wrap(str, maxW, s).slice(0, maxLines || 99);
    const step = lh || 9 * s;
    lines.forEach((ln, i) => this.text(ln, x, y + i * step, s, c));
    return y + lines.length * step;
  }
}

// ---------------------------------------------------------------- PNG encode
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}
function encodePNG(cv) {
  const raw = Buffer.alloc((cv.w * 3 + 1) * cv.h);
  for (let y = 0; y < cv.h; y++) {
    raw[y * (cv.w * 3 + 1)] = 0;
    raw.set(cv.buf.subarray(y * cv.w * 3, (y + 1) * cv.w * 3), y * (cv.w * 3 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cv.w, 0); ihdr.writeUInt32BE(cv.h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- palette
// A different palette from the reference: warm paper, deep navy bands,
// crimson accent, plum/teal/ochre region colours, light "paper-cut" scenes.
const PAPER = [248, 244, 232];
const INK = [22, 35, 63];
const NAVY = [27, 47, 85];
const NAVY2 = [35, 58, 100];
const CRIMSON = [179, 38, 30];
const CREAM = [250, 247, 238];
const GREY = [90, 96, 110];
const LIGHT = [219, 231, 243];
const SAND = [239, 227, 200];
const MAPLAND = [195, 206, 219];
const RULE = [180, 175, 158];
const REGION = [
  { name: 'EUROPE', n: 8, c: [29, 78, 216] },
  { name: 'MIDDLE EAST', n: 4, c: [124, 58, 237] },
  { name: 'AMERICAS', n: 7, c: [15, 118, 110] },
  { name: 'ASIA-PACIFIC', n: 9, c: [180, 83, 9] },
  { name: 'AFRICA', n: 4, c: [21, 128, 61] },
  { name: 'OCEANIA', n: 3, c: [109, 40, 217] },
  { name: 'WORLD', n: 2, c: [71, 85, 105] },
];

// ---------------------------------------------------------------- the day
const STATS = [
  ['186', 'drones fired at Ukraine overnight'],
  ['161', 'downed or suppressed by air defence'],
  ['35%', 'electricity goal for 2035, kept'],
  ['$120bn', 'adaptation target dropped'],
  ['720/9', "India's record Test total in NZ"],
  ['50', 'Wembanyama points, 19 rebounds'],
];
const TIMELINE = [
  ['01:00', 'HK polls open'], ['03:00', 'COP31 objections'],
  ['05:11', 'Hamas seeks talks'], ['05:30', 'Verstappen wins'],
  ['06:00', 'COP31 approval due'], ['07:30', 'Approval slips again'],
];
const HEROES = [
  {
    n: 1, tag: 'COP31: FINAL TEXT', scene: 'cop',
    meta: 'ANTALYA, TURKIYE · CLIMATE', cert: 'REPORTED',
    head: 'Climate deal lands with no mention of fossil fuels',
    body: "The final text 'recalls' the Dubai pact whole, keeps the 35% electricity-by-2035 goal, drops the $120bn adaptation target and is the first to admit 1.5C will be overshot. Hoekstra: 'a good deal or no deal.' (Reuters, BBC, The Guardian)",
  },
  {
    n: 2, tag: '186 DRONES OVERNIGHT', scene: 'drones',
    meta: 'KYIV REGION, UKRAINE · WAR', cert: 'REPORTED',
    head: 'Russia fires 186 drones; a Kyiv-region block is destroyed',
    body: 'Air defences downed or suppressed 161 of 186 strike drones (72 of them jet-powered) fired from eight directions. One destroyed a five-storey block in Dymer: up to seven people feared trapped, two injured, nine evacuated. (Ukrainian Air Force via Reuters, BBC)',
  },
  {
    n: 3, tag: 'CLAIM VS DENIAL', scene: 'radar',
    meta: 'MANAMA, BAHRAIN · IRAN', cert: 'CLAIM',
    head: 'Iran claims two US radars hit; Bahrain denies it',
    body: "The IRGC says it destroyed two Patriot radars on Saturday night. Bahrain's foreign ministry answered on Sunday: the target was a civilian industrial site — a fire, no injuries — and a violation of its sovereignty. (Khaleej Times, Al Jazeera)",
  },
];
const GRID = [
  { n: 4, tag: '856 CANDIDATES', scene: 'ballot', region: 0, meta: 'HONG KONG · ELECTION', head: 'Hong Kong elects its Election Committee', body: '856 candidates, 723 seats, 5,700 voters; polls 09:00-18:00. (SCMP)' },
  { n: 5, tag: '720/9 DECLARED', scene: 'cricket', region: 3, meta: 'WELLINGTON · CRICKET', head: 'India declare on 720/9, a record in New Zealand', body: 'Rahul 136, Pant 128, Gill 98; hosts 119/2, trailing by 235. (ESPN)' },
  { n: 6, tag: 'VERSTAPPEN WINS', scene: 'race', region: 0, meta: 'LAS VEGAS · FORMULA 1', head: 'Verstappen takes the Las Vegas Grand Prix', body: 'From pole in 1:37.94; Norris +0.639, Piastri +1.329. (FIA)' },
  { n: 7, tag: '50 POINTS', scene: 'hoop', region: 2, meta: 'SAN ANTONIO · NBA', head: 'Wembanyama scores 50 as the Spurs roll on', body: '50 pts, 19 rebounds, 5 blocks; 114-91 over New Orleans. (Reuters)' },
  { n: 8, tag: 'SHIP ABLAZE', scene: 'ship', region: 0, meta: 'GULF OF FINLAND · SEA', head: 'Russian cargo ship Sparta II still burning', body: 'Hit by drones Saturday; Finland leads Lovisa rescue. (Reuters)' },
  { n: 9, tag: 'POWER CUTS', scene: 'power', region: 1, meta: 'TEHRAN · ENERGY', head: 'Iran begins rationing electricity', body: 'Rolling cuts up to two hours a day as war damage bites. (Wires)' },
  { n: 10, tag: 'IN INTENSIVE CARE', scene: 'care', region: 2, meta: 'BRASILIA · HEALTH', head: 'Bolsonaro in intensive care in Brasilia', body: 'Acute bowel obstruction, stable, surgery possible. (Reuters)' },
  { n: 11, tag: 'FBI PROBE', scene: 'probe', region: 2, meta: 'WASHINGTON · CYBER', head: "FBI probes apparent hack of its crime database", body: 'Washington State pauses gun-dealer checks; breach assessed. (AP)' },
  { n: 12, tag: 'FLIGHTS GROUNDED', scene: 'plane', region: 0, meta: 'BRUSSELS · TRAVEL', head: "Belgian controllers join Monday's national strike", body: 'Most flights grounded 07:00-21:00; controllers to join. (Wires)' },
  { n: 13, tag: 'TOLL AT 19', scene: 'bottle', region: 3, meta: 'MANIPUR · POISONING', head: 'Toxic-liquor toll in Manipur climbs to 19', body: '600 in hospital, six held, toll up from 15. (Xinhua)' },
  { n: 14, tag: '3 DEAD, 36 MISSING', scene: 'factory', region: 3, meta: 'CIKANDE · FIRE', head: 'Candy-factory fire in Cikande: 3 dead, 36 missing', body: 'Blaze tore through the Banten plant; search goes on. (Detiknews)' },
  { n: 15, tag: '1 DEAD, 16 HURT', scene: 'quake', region: 2, meta: 'JUNIN · QUAKE TOLL', head: 'Peru quake toll updated: 1 dead, 16 hurt', body: '170 homes damaged in Junin; the count is completed. (Reuters)' },
];
const ALSO = [
  ['16 Europe', 'Estonia to shut Russia border crossings 1 Dec after a sabotage bid (Reuters)'],
  ['17 Europe', 'Denmark expels a Russian attache over an alleged plot against a Ukrainian (Guardian)'],
  ['18 Asia-Pacific', 'Nepal PM Shah lands in Delhi on first visit; meets Modi Monday (IANS)'],
  ['19 Asia-Pacific', 'Chinese bomber turns back 170 km from Manila (AP)'],
  ['20 Asia-Pacific', 'Philippines M 5.9 quake, 898 km deep, off Palawan (EMSC)'],
  ['21 Asia-Pacific', 'Japan poll: record 92% feel friendly to South Korea (IKN)'],
  ['22 Asia-Pacific', 'Taiwan live-fire drills on Kinmen island (Wires)'],
  ['23 Africa', 'Somalia expels UAE ambassador, recalls its envoy (Wires)'],
  ['24 Africa', 'Sudan: RSF accused of killing civilians, incl. 3 children (Claims)'],
  ['25 Africa', 'Kenya discharges its last Ebola patient (Wires)'],
  ['26 Oceania', 'Marles rejects US report on AUKUS subs (ABC)'],
  ['27 Oceania', 'Melbourne: 70 years since the 1956 Olympics opened (ABC)'],
  ['28 Oceania', "Cummins keeps Australia's Test captaincy (Wires)"],
  ['29 Americas', "Trump seeks 'permanent' Iran deal; Doha talks to mediators (Al Jazeera)"],
  ['30 Americas', 'Nvidia faces SEC accounting probe, say reports (Reports)'],
  ['31 Americas', 'Hamas seeks US mediator talks (Al Jazeera)'],
  ['32 Middle East', 'Etembeki invites Likud to coalition talks (Gurita Times)'],
  ['33 World', "Bitcoin back above $60,000 after Saturday's $55.1k flush (Market data)"],
  ['34 World', 'Gold holds near $5,355 (Reuters)'],
  ['35 Europe — FORECAST', 'ATP Finals final, Turin: Zverev v Alcaraz, 17:00 GMT (Forecast)'],
  ['36 Europe — FORECAST', "Liverpool v Man Utd, 16:30 GMT — Pochettino's debut (Forecast)"],
];
const DATECHECK = "Left out as other days' news: the 400-drone 110-missile barrage (Thu 19-Fri 20 Nov) · the 148-drone night and the Kryvyi Rih double-tap (Fri 20-Sat 21) · 'El Chapo Isidro' captured (Fri) · Bayelsa boat, 24 dead (Fri) · Gaza aid-van strike (Sat) · BepiColombo's Mercury burn (Sat).";
// Map blobs (ellipses in map-local coordinates, map is 480 x 190).
const BLOBS = [
  [95, 45, 75, 38], [30, 35, 28, 18], [130, 95, 22, 14], [185, 18, 22, 12],
  [155, 135, 30, 42], [150, 100, 14, 18],
  [255, 38, 28, 20], [265, 105, 34, 45],
  [360, 45, 85, 40], [350, 95, 18, 25], [395, 95, 25, 15], [415, 125, 35, 8],
  [425, 150, 32, 18], [465, 170, 8, 12],
];
const PINS = [
  [281, 36], [281, 56], [307, 71], [392, 77], [473, 170], [87, 57],
  [109, 67], [273, 22], [308, 58], [176, 133], [137, 53], [246, 35],
  [365, 74], [382, 119], [140, 126],
];

// ---------------------------------------------------------------- scenes
// Light "paper-cut" pictograms: pale backgrounds, navy silhouettes, one
// accent colour per scene. Distinct from the reference's dark night scenes.
function scene(cv, kind, x, y, w, h) {
  const N = INK, R = CRIMSON;
  if (kind === 'cop') {
    cv.fillRect(x, y, w, h, [230, 239, 226]);
    cv.disc(x + 42, y + 42, 26, [15, 118, 110]);
    cv.line(x + 20, y + 42, x + 64, y + 42, CREAM);
    cv.line(x + 42, y + 20, x + 42, y + 64, CREAM);
    cv.disc(x + 292, y + 30, 16, CREAM);
    cv.line(x + 292, y + 30, x + 292, y + 18, N);
    cv.line(x + 292, y + 30, x + 302, y + 34, N);
    cv.fillRect(x + 96, y + 88, 200, 8, [139, 90, 43]);
    cv.fillRect(x + 104, y + 96, 6, 26, [139, 90, 43]);
    cv.fillRect(x + 282, y + 96, 6, 26, [139, 90, 43]);
    for (let i = 0; i < 5; i++) {
      const px = x + 118 + i * 38;
      cv.disc(px, y + 66, 9, N);
      cv.fillRect(px - 8, y + 76, 16, 14, N);
    }
    cv.fillRect(x + 8, y + 8, 60, 4, [15, 118, 110]);
  } else if (kind === 'drones') {
    cv.fillRect(x, y, w, h, [219, 231, 243]);
    cv.disc(x + 40, y + 18, 2, [255, 255, 255]);
    cv.disc(x + 120, y + 12, 2, [255, 255, 255]);
    cv.disc(x + 210, y + 22, 2, [255, 255, 255]);
    cv.disc(x + 280, y + 14, 2, [255, 255, 255]);
    cv.tri(x + 250, y + 130, x + 290, y + 130, x + 235, y + 30, [250, 238, 180]);
    cv.fillRect(x + 16, y + 70, 52, 60, N);
    cv.fillRect(x + 84, y + 92, 44, 38, N);
    cv.fillRect(x + 150, y + 60, 60, 70, N);
    for (const [wx, wy] of [[26, 82], [40, 82], [54, 82], [26, 98], [40, 98], [94, 102], [108, 102], [162, 72], [178, 72], [194, 72], [162, 88], [178, 88]]) {
      cv.fillRect(x + wx, y + wy, 7, 7, [245, 180, 60]);
    }
    const drone = (dx, dy) => {
      cv.fillRect(x + dx - 8, y + dy, 16, 3, N);
      cv.fillRect(x + dx - 1, y + dy - 6, 3, 15, N);
      cv.fillRect(x + dx + 10, y + dy + 4, 12, 2, N);
    };
    drone(250, 46); drone(180, 30); drone(300, 60);
  } else if (kind === 'radar') {
    cv.fillRect(x, y, w, h, [223, 230, 238]);
    cv.fillRect(x, y + 108, w, 22, [239, 227, 200]);
    // Big radar screen with a sweep line and blips.
    cv.disc(x + 70, y + 56, 42, NAVY);
    cv.disc(x + 70, y + 56, 36, [38, 68, 120]);
    cv.line(x + 70, y + 56, x + 100, y + 30, [120, 220, 140]);
    cv.disc(x + 88, y + 44, 3, [120, 220, 140]);
    cv.disc(x + 58, y + 70, 3, [120, 220, 140]);
    cv.disc(x + 76, y + 76, 2, CREAM);
    // Two radar masts with tilted dishes and flames.
    for (const bx of [190, 270]) {
      cv.fillRect(x + bx - 3, y + 62, 6, 48, N);
      cv.tri(x + bx - 26, y + 66, x + bx + 6, y + 34, x + bx + 2, y + 66, N);
      cv.tri(x + bx - 12, y + 36, x + bx + 2, y + 58, x + bx - 2, y + 62, [245, 130, 32]);
      cv.tri(x + bx + 12, y + 40, x + bx - 2, y + 58, x + bx + 4, y + 62, [245, 130, 32]);
    }
    cv.line(x + 130, y + 30, x + 165, y + 46, R);
    cv.line(x + 165, y + 46, x + 150, y + 70, R);
    cv.tri(x + 150, y + 70, x + 162, y + 66, x + 156, y + 78, R);
  } else if (kind === 'ballot') {
    cv.fillRect(x, y, w, h, [232, 238, 245]);
    cv.fillRect(x + 58, y + 18, 44, 22, CREAM);
    cv.line(x + 58, y + 18, x + 102, y + 18, N);
    cv.fillRect(x + 52, y + 28, 56, 14, N);
    cv.line(x + 64, y + 12, x + 76, y + 24, R);
    cv.line(x + 76, y + 24, x + 92, y + 6, R);
  } else if (kind === 'cricket') {
    cv.fillRect(x, y, w, h, [220, 234, 217]);
    cv.fillRect(x + 52, y + 6, 56, 32, [239, 227, 200]);
    cv.disc(x + 122, y + 20, 9, CREAM);
    cv.line(x + 114, y + 20, x + 130, y + 20, R);
    cv.line(x + 30, y + 38, x + 48, y + 14, [139, 90, 43]);
    cv.fillRect(x + 28, y + 38, 6, 4, [139, 90, 43]);
  } else if (kind === 'race') {
    cv.fillRect(x, y, w, h, [232, 232, 232]);
    for (let i = 0; i < 8; i++) cv.fillRect(x + i * 20, y, 10, 8, i % 2 ? CREAM : N);
    for (let i = 0; i < 8; i++) cv.fillRect(x + i * 20, y + 8, 10, 8, i % 2 ? N : CREAM);
    cv.fillRect(x + 52, y + 24, 56, 10, R);
    cv.fillRect(x + 64, y + 16, 30, 8, R);
    cv.disc(x + 62, y + 36, 6, N);
    cv.disc(x + 98, y + 36, 6, N);
  } else if (kind === 'hoop') {
    cv.fillRect(x, y, w, h, [243, 226, 207]);
    cv.fillRect(x + 108, y + 6, 34, 22, CREAM);
    cv.disc(x + 125, y + 34, 9, [245, 130, 32]);
    cv.disc(x + 125, y + 34, 5, [243, 226, 207]);
    cv.disc(x + 40, y + 26, 13, [245, 130, 32]);
    cv.line(x + 28, y + 26, x + 52, y + 26, N);
    cv.line(x + 40, y + 14, x + 40, y + 38, N);
  } else if (kind === 'ship') {
    cv.fillRect(x, y, w, h, [219, 231, 243]);
    cv.fillRect(x, y + 34, w, 10, [38, 68, 120]);
    cv.fillRect(x + 40, y + 24, 80, 10, N);
    cv.tri(x + 120, y + 24, x + 140, y + 24, x + 120, y + 34, N);
    cv.fillRect(x + 62, y + 10, 6, 14, N);
    cv.disc(x + 58, y + 8, 5, [160, 166, 178]);
    cv.disc(x + 72, y + 5, 6, [160, 166, 178]);
    cv.tri(x + 92, y + 24, x + 104, y + 24, x + 98, y + 10, [245, 130, 32]);
  } else if (kind === 'power') {
    cv.fillRect(x, y, w, h, [238, 240, 230]);
    cv.line(x + 80, y + 42, x + 70, y + 8, N);
    cv.line(x + 80, y + 42, x + 90, y + 8, N);
    cv.line(x + 70, y + 8, x + 90, y + 8, N);
    cv.line(x + 72, y + 20, x + 88, y + 20, N);
    cv.tri(x + 122, y + 6, x + 110, y + 24, x + 120, y + 24, [245, 180, 60]);
    cv.tri(x + 118, y + 20, x + 128, y + 38, x + 116, y + 38, [245, 180, 60]);
  } else if (kind === 'care') {
    cv.fillRect(x, y, w, h, [246, 236, 236]);
    cv.fillRect(x + 72, y + 8, 14, 28, R);
    cv.fillRect(x + 62, y + 18, 34, 9, R);
    cv.line(x + 20, y + 36, x + 140, y + 36, [180, 175, 158]);
  } else if (kind === 'probe') {
    cv.fillRect(x, y, w, h, [232, 238, 245]);
    cv.disc(x + 62, y + 20, 13, N);
    cv.disc(x + 62, y + 20, 8, [232, 238, 245]);
    cv.line(x + 72, y + 30, x + 88, y + 42, N);
    cv.fillRect(x + 104, y + 10, 40, 3, [160, 166, 178]);
    cv.fillRect(x + 104, y + 18, 40, 3, [160, 166, 178]);
    cv.fillRect(x + 104, y + 26, 28, 3, [160, 166, 178]);
  } else if (kind === 'plane') {
    cv.fillRect(x, y, w, h, [219, 231, 243]);
    cv.fillRect(x + 34, y + 20, 92, 6, N);
    cv.tri(x + 70, y + 20, x + 86, y + 34, x + 86, y + 20, N);
    cv.tri(x + 118, y + 20, x + 130, y + 12, x + 130, y + 20, N);
    cv.tri(x + 40, y + 20, x + 30, y + 12, x + 40, y + 20, N);
    cv.disc(x + 52, y + 23, 2, CREAM);
    cv.disc(x + 66, y + 23, 2, CREAM);
    cv.disc(x + 80, y + 23, 2, CREAM);
  } else if (kind === 'bottle') {
    cv.fillRect(x, y, w, h, [243, 232, 216]);
    cv.fillRect(x + 66, y + 10, 12, 10, [21, 128, 61]);
    cv.fillRect(x + 60, y + 20, 24, 22, [21, 128, 61]);
    cv.disc(x + 112, y + 24, 11, CREAM);
    cv.disc(x + 108, y + 22, 2, N);
    cv.disc(x + 116, y + 22, 2, N);
    cv.fillRect(x + 108, y + 30, 8, 3, N);
  } else if (kind === 'factory') {
    cv.fillRect(x, y, w, h, [236, 231, 221]);
    cv.fillRect(x + 30, y + 20, 60, 22, N);
    cv.tri(x + 30, y + 20, x + 45, y + 8, x + 60, y + 20, N);
    cv.tri(x + 60, y + 20, x + 75, y + 8, x + 90, y + 20, N);
    cv.fillRect(x + 100, y + 8, 8, 34, N);
    cv.disc(x + 96, y + 6, 5, [160, 166, 178]);
    cv.disc(x + 108, y + 4, 6, [160, 166, 178]);
    cv.tri(x + 118, y + 42, x + 132, y + 42, x + 125, y + 26, [245, 130, 32]);
  } else if (kind === 'quake') {
    cv.fillRect(x, y, w, h, [240, 232, 220]);
    cv.fillRect(x + 30, y + 22, 26, 20, N);
    cv.fillRect(x + 66, y + 14, 30, 28, N);
    cv.fillRect(x + 106, y + 26, 24, 16, N);
    cv.line(x + 14, y + 10, x + 40, y + 10, R);
    cv.line(x + 40, y + 10, x + 48, y + 4, R);
    cv.line(x + 48, y + 4, x + 56, y + 16, R);
    cv.line(x + 56, y + 16, x + 64, y + 6, R);
    cv.line(x + 64, y + 6, x + 90, y + 6, R);
  }
}

// ---------------------------------------------------------------- layout
const M = 14;
function draw(cv) {
  // Masthead bar.
  cv.fillRect(0, 0, W, 26, NAVY);
  cv.text('THE WORLD IN ONE DAY', 18, 9, 1, CREAM);
  const mh = '36 STORIES · 7 REGIONS · EVERY ONE DATED SUNDAY 22 NOVEMBER 2026';
  cv.text(mh, W - 18 - cv.textW(mh, 1), 9, 1, CREAM);

  // Headline as an inverted navy band (white caps) — not the reference's
  // centred serif headline on white.
  cv.fillRect(M, 30, 996, 56, NAVY);
  cv.textC('SUNDAY 22 NOVEMBER 2026', 512, 44, 4, CREAM);
  cv.fillRect(M, 88, 996, 3, CRIMSON);

  // Red subhead.
  cv.textC("186 drones over Ukraine in the night · COP31's deal names no fossil fuels · Iran's radar claim meets Bahrain's denial", 512, 97, 1, CRIMSON);
  cv.fillRect(M, 109, 996, 1, RULE);

  // Stat strip: cream boxes with a crimson top rule and navy numbers
  // (not the reference's bare red numbers).
  for (let i = 0; i < 6; i++) {
    const x = M + i * 166;
    cv.fillRect(x + 4, 116, 158, 3, CRIMSON);
    cv.textC(STATS[i][0], x + 83, 124, 3, INK);
    const cap = cv.wrap(STATS[i][1], 158, 1).slice(0, 2);
    cap.forEach((ln, j) => cv.textC(ln, x + 83, 150 + j * 8, 1, GREY));
    if (i > 0) cv.vline(x, 118, 50, RULE);
  }

  // Region bar.
  const segW = [221, 110, 194, 249, 83, 83, 56];
  let rx = M;
  REGION.forEach((r, i) => {
    cv.fillRect(rx, 174, segW[i], 22, r.c);
    cv.textC(`${r.name} ${r.n}`, rx + segW[i] / 2, 181, 1, CREAM);
    rx += segW[i];
  });

  // UTC timeline (navy bar, amber times).
  cv.fillRect(M, 200, 996, 18, NAVY);
  cv.text('THE DAY IN UTC', 22, 205, 1, [245, 180, 60]);
  let tx = 116;
  for (const [t, what] of TIMELINE) {
    tx = cv.text(t, tx, 205, 1, [245, 180, 60]);
    tx = cv.text(' ' + what, tx, 205, 1, CREAM);
    tx += 10;
  }

  // Three heroes, reordered: climate first, drones second, radar third.
  const hx = [M, 346, 678];
  HEROES.forEach((h, i) => {
    const x = hx[i];
    const tagW = cv.textW(h.tag, 1) + 12;
    cv.fillRect(x, 224, tagW, 14, NAVY);
    cv.text(h.tag, x + 6, 227, 1, CREAM);
    scene(cv, h.scene, x, 242, 322, 130);
    cv.text(`${h.n} ${h.meta}`, x, 376, 1, INK);
    cv.text(h.cert, x + 322 - cv.textW(h.cert, 1), 376, 1, h.cert === 'CLAIM' ? CRIMSON : [15, 118, 110]);
    const headEnd = cv.para(h.head, x, 388, 322, 2, INK, 3, 18);
    cv.para(h.body, x, headEnd + 4, 322, 1, [60, 64, 74], 5, 9);
  });
  cv.fillRect(M, 496, 996, 1, RULE);

  // Twelve grid stories: region-coloured top rule, light pictogram,
  // coloured tag text (not a red tag block), caps headline, short body.
  const gy = [502, 630];
  GRID.forEach((g, i) => {
    const row = Math.floor(i / 6), col = i % 6;
    const x = M + col * 167, y = gy[row];
    const rc = REGION[g.region].c;
    cv.fillRect(x, y, 159, 3, rc);
    scene(cv, g.scene, x, y + 6, 159, 44);
    cv.text(g.tag, x, y + 54, 1, rc);
    cv.text(g.meta, x, y + 64, 1, GREY);
    cv.para(g.head.toUpperCase(), x, y + 74, 159, 1, INK, 2, 9);
    cv.para(g.body, x, y + 94, 159, 1, [60, 64, 74], 3, 9);
  });

  // World map: filled silhouettes (not the reference's dot map) with
  // red numbered pins; the "also" list beside it.
  cv.text('WHERE IT HAPPENED', M, 756, 1, INK);
  cv.text('pins match story numbers', 422 - cv.textW('pins match story numbers', 1), 756, 1, GREY);
  cv.text('ALSO ON SUNDAY 22 NOVEMBER — 21 MORE STORIES', 438, 756, 1, INK);
  cv.fillRect(M, 770, 408, 162, [238, 241, 245]);
  const S = 0.85;
  for (const [bx, by, brx, bry] of BLOBS) cv.ellipse(M + bx * S, 770 + by * S, brx * S, bry * S, MAPLAND);
  PINS.forEach(([px, py], i) => {
    const cx = M + px * S, cy = 770 + py * S;
    cv.disc(cx, cy, 7, CRIMSON);
    cv.textC(String(i + 1), cx, cy - 3, 1, CREAM);
  });
  const colX = [438, 732];
  const colItems = [ALSO.slice(0, 11), ALSO.slice(11)];
  colItems.forEach((items, ci) => {
    let y = 770;
    for (const [label, txt] of items) {
      const lines = cv.wrap(`${label}: ${txt}`, 278, 1);
      lines.forEach((ln, j) => cv.text(ln, colX[ci], y + j * 8, 1, INK));
      y += lines.length * 8;
    }
  });

  // Date check box.
  cv.fillRect(M, 950, 996, 2, CRIMSON);
  cv.fillRect(M, 980, 996, 2, CRIMSON);
  cv.fillRect(M, 950, 2, 32, CRIMSON);
  cv.fillRect(1008, 950, 2, 32, CRIMSON);
  cv.text('DATE CHECK', 22, 961, 1, CRIMSON);
  const dc = cv.wrap(DATECHECK, 860, 1).slice(0, 2);
  dc.forEach((ln, j) => cv.text(ln, 112, 958 + j * 9, 1, INK));

  // Sources + certainty, one line.
  cv.text('Sources: Reuters, BBC, AP, Al Jazeera, The Guardian, Kyiv Post, SCMP, ESPN, Detiknews. CERTAINTY: REPORTED = wires · CLAIM = one side · FORECAST = to happen.', M, 986, 1, GREY);

  // Footer bar.
  cv.fillRect(0, 1000, W, 24, NAVY);
  cv.text('THE WORLD IN ONE DAY', 14, 1008, 1, CREAM);
  const ft = 'SUNDAY 22 NOVEMBER 2026 · ONE PAGE';
  cv.text(ft, W - 14 - cv.textW(ft, 1), 1008, 1, CREAM);
}

// ---------------------------------------------------------------- main
const cv = new Canvas(W, H, PAPER);
draw(cv);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePNG(cv));
