// Simple PNG icon generator for AdShield Pro
// Run: node generate-icons.js
// Creates minimal but valid PNG icons at 16x16, 48x48, and 128x128

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, pixelFunc) {
  // Generate raw RGBA pixel data with filter byte
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFunc(x, y, width, height);
      const offset = y * (width * 4 + 1) + 1 + x * 4;
      rawData[offset] = r;
      rawData[offset + 1] = g;
      rawData[offset + 2] = b;
      rawData[offset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData) >>> 0, 0);

  return Buffer.concat([len, typeB, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return crc ^ 0xFFFFFFFF;
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function drawShieldIcon(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const nx = (x - cx) / (w / 2); // normalized -1 to 1
  const ny = (y - cy) / (h / 2);

  // Rounded rect check
  const margin = 0.05;
  const radius = 0.35;
  const rx = Math.abs(nx) - (1 - radius - margin);
  const ry = Math.abs(ny) - (1 - radius - margin);
  const inRect = (rx <= 0 || ry <= 0 || (rx * rx + ry * ry) <= radius * radius);

  if (!inRect) return [0, 0, 0, 0];

  // Background gradient: #1D4ED8 to #1E3A8A
  const t = (x + y) / (w + h);
  const bgR = lerp(29, 30, t);
  const bgG = lerp(78, 58, t);
  const bgB = lerp(216, 138, t);

  // Shield shape
  const shieldTop = -0.68;
  const shieldBot = 0.75;
  const shieldW = 0.55;

  // Shield boundary
  const sy = (ny - shieldTop) / (shieldBot - shieldTop); // 0 to 1 in shield
  if (sy >= 0 && sy <= 1) {
    let shieldHalfWidth;
    if (sy < 0.35) {
      // Top part: widens
      shieldHalfWidth = shieldW * (sy / 0.35);
    } else if (sy < 0.7) {
      shieldHalfWidth = shieldW;
    } else {
      // Bottom: narrows to point
      shieldHalfWidth = shieldW * (1 - (sy - 0.7) / 0.3);
    }

    const inShield = Math.abs(nx) <= shieldHalfWidth;
    const onBorder = inShield && (
      Math.abs(Math.abs(nx) - shieldHalfWidth) < 0.08 ||
      sy < 0.05 ||
      (sy > 0.92)
    );

    if (onBorder) return [255, 255, 255, 255]; // white border
    if (inShield) return [lerp(bgR, 255, 0.12), lerp(bgG, 255, 0.12), lerp(bgB, 255, 0.12), 255]; // lighter fill
  }

  return [bgR, bgG, bgB, 255];
}

// Generate icons
const sizes = [16, 48, 128];
const outDir = __dirname;

for (const size of sizes) {
  const png = createPNG(size, size, drawShieldIcon);
  const filePath = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Created ${filePath} (${png.length} bytes)`);
}

console.log('Done! Icons generated.');
