const fs = require('fs')
const path = require('path')
const https = require('https')
const { PNG } = require('pngjs')
const sharp = require('sharp')

const TAB_DIR = path.resolve(__dirname, '../src/static/tab')
const SIZE = 81
const BASE = 'https://cdn.jsdelivr.net/npm/@tabler/icons-png@3.31.0/icons/outline'

const C_ACTIVE  = { r: 14,  g: 165, b: 233 }  // #0EA5E9 brand cyan
const C_INACTIVE = { r: 148, g: 163, b: 184 }  // #94A3B8 slate

const ICONS = [
  { name: 'home', file: 'home' },
  { name: 'history', file: 'clipboard-list' },
  { name: 'mine', file: 'user' },
]

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return https.get(res.headers.location, (r2) => {
          const buf = []; r2.on('data', d => buf.push(d))
          r2.on('end', () => resolve(Buffer.concat(buf)))
        }).on('error', reject)
      }
      const buf = []; res.on('data', d => buf.push(d))
      res.on('end', () => resolve(Buffer.concat(buf)))
    }).on('error', reject)
  })
}

async function recolor(inputBuf, outputPath, color) {
  // Resize to 81x81
  const resized = await sharp(inputBuf).resize(SIZE, SIZE).ensureAlpha().toBuffer()
  // Read pixels
  const png = PNG.sync.read(resized)
  // Replace RGB values, keep alpha
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i]     = color.r
    png.data[i + 1] = color.g
    png.data[i + 2] = color.b
    // png.data[i+3] = alpha (unchanged)
  }
  fs.writeFileSync(outputPath, PNG.sync.write(png))
}

async function main() {
  for (const { name, file } of ICONS) {
    const url = `${BASE}/${file}.png`
    console.log(`Downloading ${file}.png ...`)
    const raw = await download(url)

    await recolor(raw, path.join(TAB_DIR, `${name}.png`), C_INACTIVE)
    console.log(`  ✓ ${name}.png (inactive)`)

    await recolor(raw, path.join(TAB_DIR, `${name}-active.png`), C_ACTIVE)
    console.log(`  ✓ ${name}-active.png`)
  }
  console.log('\nDone — all 6 tab icons generated.')
}

main().catch(e => { console.error(e); process.exit(1) })
