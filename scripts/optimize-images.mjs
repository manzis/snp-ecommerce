/**
 * One-time script to resize oversized local images to appropriate dimensions.
 * Uses Sharp (already in project dependencies).
 * 
 * Run: node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, writeFileSync, unlinkSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '..', 'public', 'images');

const resizeJobs = [
  // athelete4.webp — displayed at max 125×145px (lg), so 250×290 for retina
  { src: 'athelete4.webp', width: 250, height: 290 },
  // athelete1.webp — displayed at max 82×95px, so 164×190 for retina  
  { src: 'athelete1.webp', width: 164, height: 190 },
  // athelete.webp — displayed at max 82×95px + 24px circle, 164×190 covers both
  { src: 'athelete.webp', width: 164, height: 190 },
  // herobgpattern.webp — background at 9% opacity, 400px wide is more than enough
  { src: 'herobgpattern.webp', width: 400 },
  // athelete-3.jpg → convert to webp and resize (displayed at 86×125px → 172×250 retina)
  { src: 'athelete-3.jpg', width: 172, height: 250, outputName: 'athelete-3.webp' },
];

async function run() {
  for (const job of resizeJobs) {
    const inputPath = join(IMAGES_DIR, job.src);
    if (!existsSync(inputPath)) {
      console.log(`⚠ Skipping ${job.src} — file not found`);
      continue;
    }

    const outputName = job.outputName || job.src;
    const outputPath = join(IMAGES_DIR, outputName);
    
    // Read original metadata
    const inputBuffer = await sharp(inputPath).toBuffer();
    const meta = await sharp(inputBuffer).metadata();
    const originalKB = Math.round(inputBuffer.length / 1024);

    // Resize and convert to webp in memory
    const result = await sharp(inputBuffer)
      .resize({
        width: job.width,
        height: job.height,
        fit: 'cover',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
    
    const newKB = Math.round(result.length / 1024);

    // Write buffer to file (safe overwrite)
    writeFileSync(outputPath, result);

    console.log(`✓ ${job.src} → ${outputName}: ${originalKB} KB → ${newKB} KB (${meta.width}×${meta.height} → ${job.width}×${job.height || 'auto'})`);
  }

  console.log('\n✅ All images optimized!');
}

run().catch(console.error);
