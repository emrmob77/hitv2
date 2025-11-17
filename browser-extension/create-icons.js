const fs = require('fs');
const path = require('path');

// Simple PNG header and data for a solid color icon with text
function createIcon(size, bgColor, text) {
  // Create a simple canvas-like buffer with a colored background
  // This creates a minimal valid PNG with text overlay

  const canvas = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${bgColor}"/>
      <path d="M ${size * 0.3} ${size * 0.25} L ${size * 0.7} ${size * 0.25} L ${size * 0.7} ${size * 0.75} L ${size * 0.5} ${size * 0.65} L ${size * 0.3} ${size * 0.75} Z"
            fill="#FFF" stroke="#FFF" stroke-width="1" stroke-linejoin="round"/>
      <text x="${size/2}" y="${size * 0.55}" font-family="Arial" font-size="${size * 0.3}"
            fill="${bgColor}" text-anchor="middle" font-weight="bold">#</text>
    </svg>
  `;

  return canvas;
}

// Create SVG icons for different sizes
const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

sizes.forEach(size => {
  const svg = createIcon(size, '#4F46E5', '#');
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`Created icon-${size}.svg`);
});

console.log('\n✅ Icon files created successfully!');
console.log('\n⚠️  Note: Chrome extensions require PNG icons.');
console.log('You can convert SVG to PNG using:');
console.log('- Online tools like https://cloudconvert.com/svg-to-png');
console.log('- Or install ImageMagick and run: convert icon.svg -resize 16x16 icon-16.png');
console.log('\nFor now, Chrome will accept these SVGs in most cases, but PNG is recommended.');
