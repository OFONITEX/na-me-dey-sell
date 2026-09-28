/**
 * High-precision, zero-dependency Code 39 Barcode Generator.
 * Produces authentic scannable barcodes for ticket IDs, pass numbers, and order refs.
 */

const CODE39 = {
  '0': '000110100',
  '1': '100100001',
  '2': '001100001',
  '3': '101100000',
  '4': '000110001',
  '5': '100110000',
  '6': '001110000',
  '7': '000100101',
  '8': '100100100',
  '9': '001100100',
  'A': '100001001',
  'B': '001001001',
  'C': '101001000',
  'D': '000011001',
  'E': '100011000',
  'F': '001011000',
  'G': '000001101',
  'H': '100001100',
  'I': '001001100',
  'J': '000011100',
  'K': '100000011',
  'L': '001000011',
  'M': '101000010',
  'N': '000010011',
  'O': '100010010',
  'P': '001010010',
  'Q': '000000111',
  'R': '100000110',
  'S': '001000110',
  'T': '000010110',
  'U': '110000001',
  'V': '011000001',
  'W': '111000000',
  'X': '010010001',
  'Y': '110010000',
  'Z': '011010000',
  '-': '010000101',
  '.': '110000100',
  ' ': '011000100',
  '$': '010101000',
  '/': '010100010',
  '+': '010001010',
  '%': '000101010',
  '*': '010010100' // Start / stop delimiter
};

/**
 * Encodes text into a series of bar widths (narrow = 1, wide = 2.5)
 */
export function getBarcodeElements(text) {
  const sanitized = "*" + (text || "NMDS").toUpperCase().replace(/[^0-9A-Z\-\. \$\/\+\%]/g, "-") + "*";
  const elements = []; // { isBar: boolean, width: number }

  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    const pattern = CODE39[char] || CODE39['-'];

    for (let p = 0; p < 9; p++) {
      const isBar = p % 2 === 0;
      const isWide = pattern[p] === '1';
      elements.push({
        isBar,
        width: isWide ? 2.5 : 1.0
      });
    }

    // Inter-character space (except after last character)
    if (i < sanitized.length - 1) {
      elements.push({
        isBar: false,
        width: 1.0
      });
    }
  }

  return { elements, sanitized };
}

/**
 * React Component to render SVG Barcode
 */
export function BarcodeSVG({
  value = "NMDS-2026-PASS",
  height = 56,
  showText = true,
  barColor = "#ffffff",
  textColor = "#E2D9BC",
  bgColor = "transparent",
  className = ""
}) {
  const { elements, sanitized } = getBarcodeElements(value);
  const totalUnits = elements.reduce((sum, el) => sum + el.width, 0);

  // SVG viewBox width padded with quiet zones (10 units each side)
  const quietZone = 8;
  const viewBoxWidth = totalUnits + quietZone * 2;
  const barHeight = height - (showText ? 18 : 0);

  let currentX = quietZone;
  const rects = [];

  elements.forEach((el, idx) => {
    if (el.isBar) {
      rects.push(
        <rect
          key={idx}
          x={currentX}
          y={0}
          width={el.width}
          height={barHeight}
          fill={barColor}
        />
      );
    }
    currentX += el.width;
  });

  return (
    <div style={{ textAlign: "center", display: "inline-block", maxWidth: "100%", width: "100%" }} className={className}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${height}`}
        width="100%"
        height={height}
        style={{
          background: bgColor,
          display: "block",
          overflow: "visible"
        }}
      >
        {rects}
        {showText && (
          <text
            x={viewBoxWidth / 2}
            y={height - 2}
            textAnchor="middle"
            fill={textColor}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "2.5px"
            }}
          >
            {value.toUpperCase()}
          </text>
        )}
      </svg>
    </div>
  );
}

/**
 * Draws the barcode onto an HTML Canvas 2D context
 */
export function drawBarcodeOnCanvas(ctx, value, startX, startY, targetWidth, targetHeight, barColor = "#000000") {
  const { elements } = getBarcodeElements(value);
  const totalUnits = elements.reduce((sum, el) => sum + el.width, 0);
  const unitPx = targetWidth / totalUnits;

  let curX = startX;
  ctx.fillStyle = barColor;

  for (const el of elements) {
    const w = el.width * unitPx;
    if (el.isBar) {
      ctx.fillRect(curX, startY, w, targetHeight);
    }
    curX += w;
  }
}
