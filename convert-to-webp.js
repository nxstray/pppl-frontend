const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Konfigurasi
const inputDir = './public/content';
const quality = 80; // 0-100, more quality means larger file size

console.log('Starting PNG to WebP conversion...\n');

// Cek if folder exist
if (!fs.existsSync(inputDir)) {
  console.error(`Error: Folder '${inputDir}' tidak ditemukan!`);
  console.log('Pastikan Anda menjalankan script ini dari root project Angular.');
  process.exit(1);
}

// Read all files in folder
const files = fs.readdirSync(inputDir);
const pngFiles = files.filter(file => file.endsWith('.png'));

if (pngFiles.length === 0) {
  console.log('Tidak ada file PNG yang ditemukan di folder public/content/');
  process.exit(0);
}

console.log(`Ditemukan ${pngFiles.length} file PNG\n`);

let successCount = 0;
let errorCount = 0;

// Convert each files PNG
pngFiles.forEach(async (file, index) => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(inputDir, file.replace('.png', '.webp'));
  
  try {
    const info = await sharp(inputPath)
      .webp({ quality: quality })
      .toFile(outputPath);
    
    const originalSize = fs.statSync(inputPath).size;
    const newSize = info.size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
    
    console.log(`${file}`);
    console.log(`   → ${file.replace('.png', '.webp')}`);
    console.log(`${(originalSize / 1024).toFixed(1)} KB → ${(newSize / 1024).toFixed(1)} KB (hemat ${reduction}%)\n`);
    
    successCount++;
    
    // if last file, show summary
    if (index === pngFiles.length - 1) {
      setTimeout(() => {
        console.log('═'.repeat(60));
        console.log(`Konversi selesai!`);
        console.log(`Berhasil: ${successCount} file`);
        if (errorCount > 0) {
          console.log(`Gagal: ${errorCount} file`);
        }
        console.log('═'.repeat(60));
      }, 500);
    }
  } catch (err) {
    console.error(`Error converting ${file}:`, err.message);
    errorCount++;
  }
});