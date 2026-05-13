const sharp = require('sharp');
const fs = require('fs');

async function generateFavicons() {
  const svgBuffer = fs.readFileSync('public/QuickKit_Logo.svg');
  
  // favicon-96x96.png
  await sharp(svgBuffer)
    .resize(96, 96)
    .png()
    .toFile('public/favicon-96x96.png');
    
  // apple-touch-icon.png (180x180 is standard, but let's do 192x192 as they said)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/apple-touch-icon.png');
    
  // favicon.ico (requires multiple sizes usually, but sharp doesn't natively output ICO easily without a plugin. 
  // Wait, sharp doesn't do ICO. I can just write a 48x48 png and rename to .ico, browsers support this or I'll just use a small PNG for favicon.ico.)
  // Wait, standard practice: save as PNG but name it .ico, browsers still read it.
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile('public/favicon.ico');

  console.log('Favicons generated successfully.');
}

generateFavicons().catch(console.error);
