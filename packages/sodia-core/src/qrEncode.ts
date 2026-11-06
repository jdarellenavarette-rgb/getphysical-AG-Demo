/**
 * Minimal QR Code encoder (ISO/IEC 18004): byte mode, versions 1–10, ECC L/M/Q/H.
 * Dependency-free so it runs identically on Hermes, web and Node, and renders
 * with plain Views/divs (no SVG blobs, no extra native module).
 * Payloads used by GetPhysical (≤ ~60 bytes) fit in version 4–5.
 * Verified module-for-module against the reference `qrcode` library in tests.
 */

export type QrEcc = "L" | "M" | "Q" | "H";

export interface QrMatrix {
  readonly version: number;
  readonly size: number;
  readonly mask: number;
  /** modules[row][col] — true = dark */
  readonly modules: readonly (readonly boolean[])[];
}

// [ecc codewords per block, group-1 blocks, group-1 data cw, group-2 blocks, group-2 data cw]
type BlockSpec = readonly [number, number, number, number, number];
const BLOCKS: Record<QrEcc, readonly BlockSpec[]> = {
  L: [[7, 1, 19, 0, 0], [10, 1, 34, 0, 0], [15, 1, 55, 0, 0], [20, 1, 80, 0, 0], [26, 1, 108, 0, 0],
      [18, 2, 68, 0, 0], [20, 2, 78, 0, 0], [24, 2, 97, 0, 0], [30, 2, 116, 0, 0], [18, 2, 68, 2, 69]],
  M: [[10, 1, 16, 0, 0], [16, 1, 28, 0, 0], [26, 1, 44, 0, 0], [18, 2, 32, 0, 0], [24, 2, 43, 0, 0],
      [16, 4, 27, 0, 0], [18, 4, 31, 0, 0], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44]],
  Q: [[13, 1, 13, 0, 0], [22, 1, 22, 0, 0], [18, 2, 17, 0, 0], [26, 2, 24, 0, 0], [18, 2, 15, 2, 16],
      [24, 4, 19, 0, 0], [18, 2, 14, 4, 15], [22, 4, 18, 2, 19], [20, 4, 16, 4, 17], [24, 6, 19, 2, 20]],
  H: [[17, 1, 9, 0, 0], [28, 1, 16, 0, 0], [22, 2, 13, 0, 0], [16, 4, 9, 0, 0], [22, 2, 11, 2, 12],
      [28, 4, 15, 0, 0], [26, 4, 13, 1, 14], [26, 4, 14, 2, 15], [24, 4, 12, 4, 13], [28, 6, 15, 2, 16]],
};
const ALIGNMENT: readonly (readonly number[])[] = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];
const ECC_FORMAT_BITS: Record<QrEcc, number> = { L: 1, M: 0, Q: 3, H: 2 };
const MAX_VERSION = 10;

// ---------------------------------------------------------------- GF(256) / Reed–Solomon
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]!;
})();

function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a]! + LOG[b]!]!;
}

function rsGenerator(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] = next[j]! ^ poly[j]!;
      next[j + 1] = next[j + 1]! ^ gfMul(poly[j]!, EXP[i]!);
    }
    poly = next;
  }
  return poly;
}

function rsRemainder(data: readonly number[], degree: number): number[] {
  const gen = rsGenerator(degree);
  const msg = [...data, ...new Array<number>(degree).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i]!;
    if (coef === 0) continue;
    for (let j = 1; j < gen.length; j++) msg[i + j] = msg[i + j]! ^ gfMul(gen[j]!, coef);
  }
  return msg.slice(data.length);
}

// ---------------------------------------------------------------- codewords
function dataCapacity(version: number, ecc: QrEcc): number {
  const [, b1, d1, b2, d2] = BLOCKS[ecc][version - 1]!;
  return b1 * d1 + b2 * d2;
}

function buildCodewords(bytes: Uint8Array, version: number, ecc: QrEcc): number[] {
  const capacity = dataCapacity(version, ecc);
  const bits: number[] = [];
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, version <= 9 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, capacity * 8 - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j]!;
    data.push(byte);
  }
  for (let pad = 0xec; data.length < capacity; pad ^= 0xec ^ 0x11) data.push(pad);

  const [eccLen, b1, d1, b2, d2] = BLOCKS[ecc][version - 1]!;
  const blocks: { data: number[]; ecc: number[] }[] = [];
  let offset = 0;
  for (let i = 0; i < b1 + b2; i++) {
    const len = i < b1 ? d1 : d2;
    const chunk = data.slice(offset, offset + len);
    offset += len;
    blocks.push({ data: chunk, ecc: rsRemainder(chunk, eccLen) });
  }
  const out: number[] = [];
  const maxData = Math.max(d1, d2);
  for (let i = 0; i < maxData; i++) for (const b of blocks) if (i < b.data.length) out.push(b.data[i]!);
  for (let i = 0; i < eccLen; i++) for (const b of blocks) out.push(b.ecc[i]!);
  return out;
}

// ---------------------------------------------------------------- matrix
function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function buildMatrix(codewords: readonly number[], version: number, ecc: QrEcc, mask: number): boolean[][] {
  const size = version * 4 + 17;
  const m: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const fn: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => {
    m[y]![x] = dark;
    fn[y]![x] = true;
  };

  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]] as const) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        set(x, y, dist !== 2 && dist !== 4);
      }
    }
  }
  const align = ALIGNMENT[version - 1]!;
  const last = align.length - 1;
  align.forEach((ay, i) =>
    align.forEach((ax, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    })
  );

  // Format bits (both copies) + dark module.
  const formatData = (ECC_FORMAT_BITS[ecc] << 3) | mask;
  let rem = formatData;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const format = ((formatData << 10) | rem) ^ 0x5412;
  const fbit = (i: number) => ((format >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i++) set(8, i, fbit(i));
  set(8, 7, fbit(6));
  set(8, 8, fbit(7));
  set(7, 8, fbit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, fbit(i));
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, fbit(i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, fbit(i));
  set(8, size - 8, true);

  if (version >= 7) {
    let vrem = version;
    for (let i = 0; i < 12; i++) vrem = (vrem << 1) ^ ((vrem >>> 11) * 0x1f25);
    const vbits = (version << 12) | vrem;
    for (let i = 0; i < 18; i++) {
      const dark = ((vbits >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, dark);
      set(b, a, dark);
    }
  }

  // Data, zig-zag from bottom-right, skipping the vertical timing column.
  let bit = 0;
  const totalBits = codewords.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (fn[y]![x] || bit >= totalBits) continue;
        m[y]![x] = ((codewords[bit >>> 3]! >>> (7 - (bit & 7))) & 1) !== 0;
        bit++;
      }
    }
  }

  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) if (!fn[y]![x] && maskBit(mask, x, y)) m[y]![x] = !m[y]![x];
  return m;
}

// ---------------------------------------------------------------- mask penalty (ISO 18004 §7.8.3)
function penalty(m: readonly (readonly boolean[])[]): number {
  const size = m.length;
  let score = 0;
  const line = (get: (i: number) => boolean) => {
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && get(i) === get(i - 1)) run++;
      else {
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
    }
    const pattern = [true, false, true, true, true, false, true];
    for (let i = 0; i + 7 <= size; i++) {
      if (!pattern.every((p, k) => get(i + k) === p)) continue;
      const lightBefore = [1, 2, 3, 4].every((k) => i - k < 0 || !get(i - k));
      const lightAfter = [0, 1, 2, 3].every((k) => i + 7 + k >= size || !get(i + 7 + k));
      if (lightBefore || lightAfter) score += 40;
    }
  };
  for (let y = 0; y < size; y++) line((i) => m[y]![i]!);
  for (let x = 0; x < size; x++) line((i) => m[i]![x]!);
  let dark = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (m[y]![x]) dark++;
      if (y + 1 < size && x + 1 < size) {
        const c = m[y]![x];
        if (m[y]![x + 1] === c && m[y + 1]![x] === c && m[y + 1]![x + 1] === c) score += 3;
      }
    }
  }
  score += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
  return score;
}

export function encodeQr(
  text: string,
  options: { ecc?: QrEcc; version?: number; mask?: number } = {}
): QrMatrix {
  const ecc = options.ecc ?? "M";
  const bytes = new TextEncoder().encode(text);
  const fits = (v: number) => 4 + (v <= 9 ? 8 : 16) + bytes.length * 8 <= dataCapacity(v, ecc) * 8;
  let version = options.version ?? 1;
  if (options.version !== undefined) {
    if (version < 1 || version > MAX_VERSION || !fits(version)) throw new Error("encodeQr: data does not fit the requested version");
  } else {
    while (version <= MAX_VERSION && !fits(version)) version++;
    if (version > MAX_VERSION) throw new Error("encodeQr: data too long (max version 10)");
  }

  const codewords = buildCodewords(bytes, version, ecc);
  let best: { mask: number; modules: boolean[][]; score: number } | null = null;
  const masks = options.mask !== undefined ? [options.mask] : [0, 1, 2, 3, 4, 5, 6, 7];
  for (const mask of masks) {
    const modules = buildMatrix(codewords, version, ecc, mask);
    const score = masks.length === 1 ? 0 : penalty(modules);
    if (!best || score < best.score) best = { mask, modules, score };
  }
  return { version, size: version * 4 + 17, mask: best!.mask, modules: best!.modules };
}
