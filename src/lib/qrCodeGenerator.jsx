/**
 * Zero-dependency QR Code SVG Generator
 * Generates valid standard Version 1-5 QR Code SVG for ticket IDs & verification URLs.
 */

// Galois field tables for GF(256) with primitive polynomial 0x11d
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);
let x = 1;
for (let i = 0; i < 255; i++) {
  EXP_TABLE[i] = x;
  LOG_TABLE[x] = i;
  x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
}
EXP_TABLE[255] = EXP_TABLE[0];

function glog(n) {
  if (n < 1) return 0;
  return LOG_TABLE[n];
}
function gexp(n) {
  return EXP_TABLE[((n % 255) + 255) % 255];
}
function gfMultiply(a, b) {
  if (a === 0 || b === 0) return 0;
  return gexp(glog(a) + glog(b));
}
function rsGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Array(poly.length + 1).fill(0);
    const root = gexp(i);
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMultiply(poly[j], root);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}
function rsEncode(data, ecCount) {
  const gen = rsGeneratorPoly(ecCount);
  const result = new Array(data.length + ecCount).fill(0);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i];
  }
  for (let i = 0; i < data.length; i++) {
    const coef = result[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        result[i + j] ^= gfMultiply(gen[j], coef);
      }
    }
  }
  return result.slice(data.length);
}

// QR Spec parameters for Version 1-5 Level M
const QR_CONFIGS = [
  { version: 1, size: 21, dataCap: 14, ecCount: 10, align: [] },
  { version: 2, size: 25, dataCap: 26, ecCount: 16, align: [6, 18] },
  { version: 3, size: 29, dataCap: 42, ecCount: 26, align: [6, 22] },
  { version: 4, size: 33, dataCap: 62, ecCount: 36, align: [6, 26] },
  { version: 5, size: 37, dataCap: 84, ecCount: 48, align: [6, 30] }
];

export function generateQRCodeMatrix(text) {
  const utf8Bytes = [];
  for (let i = 0; i < text.length; i++) {
    let c = text.charCodeAt(i);
    if (c < 128) utf8Bytes.push(c);
    else if (c < 2048) {
      utf8Bytes.push((c >> 6) | 192);
      utf8Bytes.push((c & 63) | 128);
    } else {
      utf8Bytes.push((c >> 12) | 224);
      utf8Bytes.push(((c >> 6) & 63) | 128);
      utf8Bytes.push((c & 63) | 128);
    }
  }

  let cfg = QR_CONFIGS.find(c => c.dataCap >= utf8Bytes.length + 3);
  if (!cfg) cfg = QR_CONFIGS[QR_CONFIGS.length - 1];

  const size = cfg.size;
  const matrix = Array.from({ length: size }, () => Array(size).fill(null));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  function addFinder(r0, c0) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = r0 + r;
        const col = c0 + c;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          const isBlack =
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          matrix[row][col] = isBlack ? 1 : 0;
          reserved[row][col] = true;
        }
      }
    }
  }
  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  if (cfg.align.length > 0) {
    const coords = cfg.align;
    for (const r of coords) {
      for (const c of coords) {
        if (
          (r === 6 && c === 6) ||
          (r === 6 && c === coords[coords.length - 1]) ||
          (r === coords[coords.length - 1] && c === 6)
        ) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBlack = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            matrix[r + dr][c + dc] = isBlack ? 1 : 0;
            reserved[r + dr][c + dc] = true;
          }
        }
      }
    }
  }

  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0 ? 1 : 0;
    if (matrix[6][i] === null) {
      matrix[6][i] = val;
      reserved[6][i] = true;
    }
    if (matrix[i][6] === null) {
      matrix[i][6] = val;
      reserved[i][6] = true;
    }
  }

  matrix[4 * cfg.version + 9][8] = 1;
  reserved[4 * cfg.version + 9][8] = true;

  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }
  for (let i = size - 8; i < size; i++) {
    reserved[8][i] = true;
    reserved[i][8] = true;
  }

  const bitStream = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  }
  pushBits(0b0100, 4);
  pushBits(utf8Bytes.length, 8);
  for (const b of utf8Bytes) {
    pushBits(b, 8);
  }
  const totalBits = cfg.dataCap * 8;
  const termLen = Math.min(4, totalBits - bitStream.length);
  pushBits(0, termLen);
  while (bitStream.length % 8 !== 0) {
    bitStream.push(0);
  }
  const padBytes = [0xec, 0x11];
  let pIdx = 0;
  while (bitStream.length < totalBits) {
    pushBits(padBytes[pIdx % 2], 8);
    pIdx++;
  }

  const dataBytes = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bitStream[i + j];
    }
    dataBytes.push(b);
  }

  const ecBytes = rsEncode(dataBytes, cfg.ecCount);
  const finalCodewords = [...dataBytes, ...ecBytes];

  const allBits = [];
  for (const byte of finalCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((byte >> i) & 1);
    }
  }

  let bitIdx = 0;
  let upwards = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--;
    const left = right - 1;
    const rows = [];
    for (let r = 0; r < size; r++) rows.push(upwards ? size - 1 - r : r);
    for (const r of rows) {
      for (const c of [right, left]) {
        if (!reserved[r][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = mask ? bit ^ 1 : bit;
        }
      }
    }
    upwards = !upwards;
  }

  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  const formatCoords = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = formatCoords[i];
    matrix[r][c] = formatBits[i];
  }
  const formatCoords2 = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8],
    [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5],
    [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = formatCoords2[i];
    matrix[r][c] = formatBits[i];
  }

  return matrix;
}

export function QRCodeSVG({ value, size = 180, darkColor = "#0f172a", lightColor = "#ffffff" }) {
  if (!value) return null;
  const matrix = generateQRCodeMatrix(String(value));
  const count = matrix.length;
  const margin = 2;
  const viewBoxSize = count + margin * 2;

  const rects = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (matrix[r][c] === 1) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c + margin}
            y={r + margin}
            width={1}
            height={1}
            fill={darkColor}
          />
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      style={{
        borderRadius: "10px",
        background: lightColor,
        display: "block",
        padding: "6px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
      }}
      aria-label={`QR Code for ${value}`}
    >
      <rect x={0} y={0} width={viewBoxSize} height={viewBoxSize} fill={lightColor} />
      {rects}
    </svg>
  );
}
