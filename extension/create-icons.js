// Simple script to create icon placeholders
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create SVG icons
const createSVGIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#0ea5e9"/>
  <path d="M ${size*0.35} ${size*0.4} Q ${size*0.5} ${size*0.25} ${size*0.65} ${size*0.4}" stroke="white" stroke-width="${size*0.05}" fill="none"/>
  <circle cx="${size*0.4}" cy="${size*0.5}" r="${size*0.08}" fill="white"/>
  <circle cx="${size*0.6}" cy="${size*0.5}" r="${size*0.08}" fill="white"/>
  <path d="M ${size*0.3} ${size*0.7} Q ${size*0.5} ${size*0.8} ${size*0.7} ${size*0.7}" stroke="white" stroke-width="${size*0.05}" fill="none"/>
</svg>`;

const iconsDir = path.join(__dirname, 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Save SVG files (Chrome also accepts SVG for extension icons in some contexts)
[16, 48, 128].forEach(size => {
  const svg = createSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
  console.log(`Created icon${size}.svg`);
});

// For PNG, we'll create a simple base64 encoded 1x1 pixel image as placeholder
// In production, you'd want to use a proper image library or provide actual icons
const createPNGPlaceholder = (size) => {
  // Minimal PNG structure (1x1 blue pixel)
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.from([0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222]);
  const idat = Buffer.from([0, 0, 0, 12, 73, 68, 65, 84, 8, 153, 99, 96, 160, 204, 0, 0, 0, 2, 0, 1, 226, 33, 188, 51]);
  const iend = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
  
  return Buffer.concat([header, ihdr, idat, iend]);
};

// Create minimal PNG placeholders
[16, 48, 128].forEach(size => {
  const png = createPNGPlaceholder(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  console.log(`Created icon${size}.png placeholder`);
});

console.log('\\nIcon files created successfully!');
console.log('Note: Replace these with actual icon designs for production.');
