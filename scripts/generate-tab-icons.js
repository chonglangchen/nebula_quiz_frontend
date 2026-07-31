const { PNG } = require('pngjs')
const fs = require('fs')
const path = require('path')

const TAB_DIR = path.resolve(__dirname, '../src/static/tab')
const S = 81

const C_ACTIVE  = { r: 14, g: 165, b: 233 }  // #0EA5E9
const C_INACTIVE = { r: 148, g: 163, b: 184 } // #94A3B8

function makePNG() {
  const png = new PNG({ width: S, height: S })
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 0; png.data[i+1] = 0; png.data[i+2] = 0; png.data[i+3] = 0
  }
  return png
}

// Anti-aliased line: computed thickness
function lineAA(png, x1, y1, x2, y2, c, thick) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) { dotAA(png, x1, y1, c, thick); return }

  const nx = -dy / len, ny = dx / len

  for (let t = 0; t <= len; t += 0.3) {
    const cx = x1 + (dx / len) * t
    const cy = y1 + (dy / len) * t
    for (let w = -thick / 2; w <= thick / 2; w += 0.3) {
      const px = cx + nx * w
      const py = cy + ny * w
      blendPx(png, px, py, c, 0.85)
    }
  }
}

function circleAA(png, cx, cy, r, c, thick) {
  for (let a = 0; a < Math.PI * 2; a += 0.01) {
    const outerX = cx + Math.cos(a) * r
    const outerY = cy + Math.sin(a) * r
    for (let w = -thick / 2; w <= thick / 2; w += 0.3) {
      const px = cx + Math.cos(a) * (r + w)
      const py = cy + Math.sin(a) * (r + w)
      blendPx(png, px, py, c, 0.85)
    }
  }
}

function dotAA(png, x, y, c, r) {
  for (let dy = -r; dy <= r; dy += 0.3) {
    for (let dx = -r; dx <= r; dx += 0.3) {
      if (dx * dx + dy * dy <= r * r) {
        blendPx(png, x + dx, y + dy, c, 0.9)
      }
    }
  }
}

function blendPx(png, x, y, c, alpha) {
  const ix = Math.floor(x), iy = Math.floor(y)
  if (ix < 0 || ix >= S || iy < 0 || iy >= S) return
  const fx = x - ix, fy = y - iy
  // 4-neighbor blend
  const w = [
    [(1-fx)*(1-fy), ix, iy],
    [fx*(1-fy), ix+1, iy],
    [(1-fx)*fy, ix, iy+1],
    [fx*fy, ix+1, iy+1],
  ]
  for (const [weight, px, py] of w) {
    if (px < 0 || px >= S || py < 0 || py >= S) continue
    if (weight <= 0) continue
    const idx = (py * S + px) * 4
    const a = alpha * weight
    png.data[idx]   = Math.min(255, png.data[idx]   + c.r * a)
    png.data[idx+1] = Math.min(255, png.data[idx+1] + c.g * a)
    png.data[idx+2] = Math.min(255, png.data[idx+2] + c.b * a)
    png.data[idx+3] = Math.min(255, png.data[idx+3] + 255 * a)
  }
}

// ── Icon paths (coordinates scaled to 81x81) ──
// We use a 24-unit grid mapped to 81px: scale = 81/24 = 3.375, offset to center
const SC = S / 24
function X(v) { return v * SC }
function Y(v) { return v * SC }

function drawHome(png, c, thick) {
  const t = thick * SC
  // Roof
  lineAA(png, X(12), Y(2.5), X(4), Y(9.5), c, t)
  lineAA(png, X(12), Y(2.5), X(20), Y(9.5), c, t)
  // Walls
  lineAA(png, X(4), Y(9.5), X(4), Y(21), c, t)
  lineAA(png, X(20), Y(9.5), X(20), Y(21), c, t)
  lineAA(png, X(4), Y(21), X(20), Y(21), c, t)
  // Door
  lineAA(png, X(9.5), Y(21), X(9.5), Y(14), c, t)
  lineAA(png, X(14.5), Y(21), X(14.5), Y(14), c, t)
  lineAA(png, X(9.5), Y(14), X(14.5), Y(14), c, t)
}

function drawHistory(png, c, thick) {
  const t = thick * SC
  // Clipboard body
  lineAA(png, X(5), Y(3), X(19), Y(3), c, t)
  lineAA(png, X(5), Y(3), X(5), Y(21), c, t)
  lineAA(png, X(19), Y(3), X(19), Y(21), c, t)
  lineAA(png, X(5), Y(21), X(19), Y(21), c, t)
  // Lines
  lineAA(png, X(8), Y(9), X(16), Y(9), c, t)
  lineAA(png, X(8), Y(13), X(16), Y(13), c, t)
  lineAA(png, X(8), Y(17), X(16), Y(17), c, t)
}

function drawMine(png, c, thick) {
  const t = thick * SC
  // Head
  circleAA(png, X(12), Y(8), X(4.2), c, t)
  // Body
  lineAA(png, X(3), Y(21), X(21), Y(21), c, t) // not really, draw body curve
  // Actually draw a proper body
  lineAA(png, X(4), Y(14.5), X(4), Y(21), c, t)
  lineAA(png, X(4), Y(21), X(10), Y(16), c, t)
  lineAA(png, X(10), Y(16), X(14), Y(16), c, t)
  lineAA(png, X(14), Y(16), X(20), Y(21), c, t)
  lineAA(png, X(20), Y(14.5), X(20), Y(21), c, t)
  // Shoulders
  lineAA(png, X(4), Y(14.5), X(20), Y(14.5), c, t)
}

function drawRanking(png, c, thick) {
  const t = thick * SC
  // Podium base
  lineAA(png, X(3), Y(21), X(21), Y(21), c, t)
  // 1st place (tallest, center) — position 10
  lineAA(png, X(10), Y(21), X(10), Y(6), c, t)
  lineAA(png, X(14), Y(21), X(14), Y(6), c, t)
  lineAA(png, X(10), Y(6), X(14), Y(6), c, t)
  // 2nd place (medium, left) — position 5
  lineAA(png, X(5), Y(21), X(5), Y(12), c, t)
  lineAA(png, X(9), Y(21), X(9), Y(12), c, t)
  lineAA(png, X(5), Y(12), X(9), Y(12), c, t)
  // 3rd place (shortest, right) — position 15
  lineAA(png, X(15), Y(21), X(15), Y(16), c, t)
  lineAA(png, X(19), Y(21), X(19), Y(16), c, t)
  lineAA(png, X(15), Y(16), X(19), Y(16), c, t)
}

const icons = [
  { name: 'home', fn: drawHome },
  { name: 'history', fn: drawHistory },
  { name: 'ranking', fn: drawRanking },
  { name: 'mine', fn: drawMine },
]

for (const { name, fn } of icons) {
  // Inactive
  const pngIn = makePNG()
  fn(pngIn, C_INACTIVE, 1.8)
  fs.writeFileSync(path.join(TAB_DIR, `${name}.png`), PNG.sync.write(pngIn))
  console.log(`✓ ${name}.png`)

  // Active
  const pngAct = makePNG()
  fn(pngAct, C_ACTIVE, 1.8)
  fs.writeFileSync(path.join(TAB_DIR, `${name}-active.png`), PNG.sync.write(pngAct))
  console.log(`✓ ${name}-active.png`)
}

console.log('\nDone — 6 tab icons (pure JS).')
