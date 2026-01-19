#!/usr/bin/env node

/**
 * Simple script to generate placeholder PWA icons
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
sizes.forEach((size) => {
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">积分</text>
</svg>
`.trim();

  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);

  // Save as SVG (will be converted to PNG by browsers or you can use sharp)
  fs.writeFileSync(filepath.replace('.png', '.svg'), svg);
  console.log(`Generated: ${filename}`);
});

// Also create a favicon
const faviconSvg = `
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#3b82f6"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">积</text>
</svg>
`.trim();

fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSvg);
console.log('Generated: favicon.svg');

console.log('\n✅ Icon generation complete!');
console.log('Note: These are SVG files. For production, convert them to PNG using sharp or an online tool.');
