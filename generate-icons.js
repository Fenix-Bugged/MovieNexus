const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = './src/assets';
const SOURCE_IMAGE = path.join(ASSETS_DIR, 'logo-master.png');
const OUTPUT_DIR = './public/assets/icons';
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const SVG_LOGO = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Background -->
  <rect width="512" height="512" fill="#0f172a" rx="100"/>
  <!-- Glowing circle outline -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="url(#blue-grad)" stroke-width="12"/>
  <!-- Film Reel pattern (dots) -->
  <circle cx="256" cy="110" r="15" fill="#f8fafc"/>
  <circle cx="256" cy="402" r="15" fill="#f8fafc"/>
  <circle cx="110" cy="256" r="15" fill="#f8fafc"/>
  <circle cx="402" cy="256" r="15" fill="#f8fafc"/>
  <circle cx="153" cy="153" r="15" fill="#f8fafc"/>
  <circle cx="359" cy="153" r="15" fill="#f8fafc"/>
  <circle cx="153" cy="359" r="15" fill="#f8fafc"/>
  <circle cx="359" cy="359" r="15" fill="#f8fafc"/>
  <!-- Play triangle in the center -->
  <polygon points="216,166 346,256 216,346" fill="url(#rose-grad)"/>
  <!-- Gradients -->
  <defs>
    <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <linearGradient id="rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#fb7185" />
    </linearGradient>
  </defs>
</svg>
`;

async function generateIcons() {
  // Ensure target directories exist
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // If the source image does not exist, generate it from the SVG definition
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.log('🎨 Generando archivo logo-master.png base desde SVG...');
    await sharp(Buffer.from(SVG_LOGO.trim()))
      .resize(512, 512)
      .png()
      .toFile(SOURCE_IMAGE);
    console.log('✓ logo-master.png base creado exitosamente.');
  }

  console.log('🎬 Generando íconos PWA...\n');
  for (const size of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: '#0f172a'
      })
      .png()
      .toFile(outputPath);
    console.log(`✓ icon-${size}x${size}.png generado.`);
  }
  console.log(`\n🎉 Iconos generados con éxito en ${OUTPUT_DIR}`);
}

generateIcons().catch(console.error);
