const sharp = require('sharp');
const path = require('path');

const svgBuffer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#07080A"/>
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#34d399" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="600" cy="315" r="400" fill="url(#glow)"/>
  <rect x="540" y="100" width="120" height="120" rx="28" fill="url(#g1)"/>
  <g transform="translate(565, 125)" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 25V17a7 7 0 0 1 7-7h7"/>
    <path d="M51 10h7a7 7 0 0 1 7 7v7"/>
    <path d="M65 51v7a7 7 0 0 1-7 7h-7"/>
    <path d="M19 65h-7a7 7 0 0 1-7-7v-7"/>
    <line x1="20" y1="35" x2="50" y2="35"/>
  </g>
  <text x="600" y="300" text-anchor="middle" fill="white" font-family="Arial,Helvetica,sans-serif" font-size="72" font-weight="bold" letter-spacing="-2">FaceSmash</text>
  <text x="600" y="360" text-anchor="middle" fill="white" font-family="Arial,Helvetica,sans-serif" font-size="32" font-weight="normal" opacity="0.6">Sign in with your face.</text>
  <text x="600" y="420" text-anchor="middle" fill="white" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="normal" opacity="0.3">Passwordless authentication — any device, any browser</text>
  <rect x="500" y="470" width="200" height="44" rx="22" fill="url(#g1)"/>
  <text x="600" y="499" text-anchor="middle" fill="#07080A" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="bold" letter-spacing="1">FACESMASH.APP</text>
  <text x="600" y="575" text-anchor="middle" fill="white" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="normal" opacity="0.15" letter-spacing="3">BY EVERJUST</text>
</svg>`);

async function generate() {
  // OG image (1200x630)
  await sharp(svgBuffer)
    .resize(1200, 630)
    .png()
    .toFile(path.join(__dirname, 'public', 'og-image.png'));
  console.log('Generated public/og-image.png (1200x630)');

  // Apple touch icon (180x180)
  const iconSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
    <rect width="180" height="180" rx="40" fill="url(#g)"/>
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34d399"/>
        <stop offset="100%" stop-color="#14b8a6"/>
      </linearGradient>
    </defs>
    <g transform="translate(40,40)" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 30V20a12 12 0 0 1 12-12h10"/>
      <path d="M70 8h10a12 12 0 0 1 12 12v10"/>
      <path d="M92 70v10a12 12 0 0 1-12 12h-10"/>
      <path d="M30 92H20a12 12 0 0 1-12-12v-10"/>
      <line x1="28" y1="50" x2="72" y2="50"/>
    </g>
  </svg>`);
  
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png (180x180)');
}

generate().catch(console.error);
