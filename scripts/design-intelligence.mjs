import fs from 'fs';
import path from 'path';

/**
 * Design Intelligence Validator (Inspired by nextlevelbuilder/ui-ux-pro-max-skill)
 * Ensures UI code adheres to luxury typography, accessibility, and high-conversion aesthetic rules.
 */

const UI_RULES = [
  { name: 'Dark Theme Surface Depth', pattern: /bg-\[#0[3-9a-fA-F0-9]{5}\]|bg-slate-950|bg-black/, message: 'Dark luxury background required' },
  { name: 'Contrast Headings', pattern: /text-white|bg-clip-text/, message: 'High-contrast text headings required' },
  { name: 'Subtle Glass Borders', pattern: /border-white\/\[0\.0[5-9]\]|border-white\/10|border-amber/, message: 'Subtle high-end glass borders required' },
  { name: 'Backdrop Blur', pattern: /backdrop-blur/, message: 'Backdrop blur required for luxury depth' },
  { name: 'Responsive Layouts', pattern: /md:|lg:|sm:/, message: 'Multi-screen responsive classes required' }
];

function validateFileDesign(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`\n🎨 Inspecting Design Tokens in: ${path.basename(filePath)}`);
  
  let passed = 0;
  UI_RULES.forEach(rule => {
    const ok = rule.pattern.test(content);
    if (ok) {
      console.log(`  ✅ [PASS] ${rule.name}`);
      passed++;
    } else {
      console.log(`  ⚠️ [WARN] ${rule.name}: ${rule.message}`);
    }
  });

  const score = Math.round((passed / UI_RULES.length) * 100);
  console.log(`  🌟 UI/UX Intelligence Rating: ${score}%\n`);
}

['components/PremiumLanding.tsx', 'components/Pricing.tsx', 'App.tsx'].forEach(validateFileDesign);
