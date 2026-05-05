const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, 'public', 'images', 'icons');

// These SVGs are fake - they contain base64-encoded PNGs in SVG wrappers
const SVG_ICONS = ['cod.svg', 'authentic.svg', 'moneyback.svg'];

async function convertSvgIconToWebp(filename) {
  const filepath = path.join(ICONS_DIR, filename);
  const svgContent = fs.readFileSync(filepath, 'utf-8');
  
  // Extract the base64 PNG data from the SVG
  const match = svgContent.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
  if (!match) {
    console.log(`❌ No base64 PNG found in ${filename}`);
    return;
  }
  
  const pngBuffer = Buffer.from(match[1], 'base64');
  console.log(`📦 ${filename}: PNG size = ${(pngBuffer.length / 1024).toFixed(1)}KB`);
  
  // Convert to WebP at reasonable quality for a small icon
  const webpBuffer = await sharp(pngBuffer)
    .resize(120, 120) // Max display size is 60x60, use 2x for retina
    .webp({ quality: 80 })
    .toBuffer();
  
  const outName = filename.replace('.svg', '.webp');
  const outPath = path.join(ICONS_DIR, outName);
  fs.writeFileSync(outPath, webpBuffer);
  
  console.log(`✅ ${outName}: WebP size = ${(webpBuffer.length / 1024).toFixed(1)}KB (saved ${((1 - webpBuffer.length / pngBuffer.length) * 100).toFixed(0)}%)`);
}

async function main() {
  for (const icon of SVG_ICONS) {
    await convertSvgIconToWebp(icon);
  }
  console.log('\n🎉 Done! Now update ServicesMarquee.tsx to use .webp instead of .svg');
}

main().catch(console.error);
