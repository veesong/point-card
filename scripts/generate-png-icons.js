#!/usr/bin/env node

/**
 * Generate PNG icons from SVG templates
 * Run with: node scripts/generate-png-icons.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  for (const size of sizes) {
    const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">积分</text>
</svg>
`.trim();

    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(filepath);

    console.log(`✅ Generated: ${filename}`);
  }

  // Generate favicon
  const faviconSvg = `
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#3b82f6" rx="6"/>
  <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">积</text>
</svg>
`.trim();

  await sharp(Buffer.from(faviconSvg))
    .png()
    .toFile(path.join(iconsDir, 'favicon.png'));

  await sharp(Buffer.from(faviconSvg))
    .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));

  console.log('✅ Generated: favicon.png and favicon.ico');

  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
