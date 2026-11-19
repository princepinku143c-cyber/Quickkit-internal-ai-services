import { execSync } from 'child_process';

/**
 * Superpowers Zero-Glitch Quality Verifier (Inspired by obra/superpowers)
 * Enforces strict software engineering discipline, TDD, and full pre-flight verification.
 */

console.log(`\n======================================================`);
console.log(`⚡ OBRA/SUPERPOWERS ZERO-GLITCH VERIFICATION PIPELINE`);
console.log(`======================================================\n`);

const STEPS = [
  { name: '1. TypeScript Static Typecheck', cmd: 'npx tsc --noEmit' },
  { name: '2. Security & Sanitization Suite', cmd: 'node tests/input-test.js' },
  { name: '3. SEO, AEO & LLM Assets Validation', cmd: 'node scripts/validate-seo-assets.mjs' },
  { name: '4. Prerendered Static Routes Integrity', cmd: 'node scripts/validate-prerendered-pages.mjs' },
  { name: '5. UI/UX Pro Max Design Intelligence Check', cmd: 'node scripts/design-intelligence.mjs' },
  { name: '6. Production Build & Route Prerender', cmd: 'npm run build' }
];

let allPassed = true;

for (const step of STEPS) {
  process.stdout.write(`⏳ Running [${step.name}]... `);
  try {
    execSync(step.cmd, { stdio: 'pipe' });
    console.log(`✅ PASSED`);
  } catch (err) {
    console.log(`❌ FAILED`);
    console.error(`\nError in step: ${step.name}`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    allPassed = false;
    break;
  }
}

console.log(`\n------------------------------------------------------`);
if (allPassed) {
  console.log(`🎉 ALL ZERO-GLITCH QUALITY GATES PASSED (100% GREEN)`);
  console.log(`------------------------------------------------------\n`);
  process.exit(0);
} else {
  console.log(`🚨 ZERO-GLITCH GATE FAILED — FIX ISSUES BEFORE RELEASE`);
  console.log(`------------------------------------------------------\n`);
  process.exit(1);
}
