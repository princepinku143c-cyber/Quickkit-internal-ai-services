import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = (process.env.TEST_BASE_URL || '').replace(/\/$/, '');
if (!BASE_URL) {
  console.error('Set TEST_BASE_URL to a dedicated local Vercel Dev/staging API before running this integration suite. It submits test leads and calls AI endpoints; it intentionally has no implicit localhost/production default.');
  process.exit(2);
}
const testUrl = new URL(BASE_URL);
const isProductionHost = testUrl.hostname === 'quickkitai.com' || testUrl.hostname.endsWith('.quickkitai.com');
if (isProductionHost) {
  console.error('Refusing to run mutating API integration tests against the production domain. Use an isolated local/staging API.');
  process.exit(2);
}
if (!['localhost', '127.0.0.1', '::1'].includes(testUrl.hostname) && process.env.ALLOW_REMOTE_API_TESTS !== '1') {
  console.error('Remote API tests require ALLOW_REMOTE_API_TESTS=1 and a dedicated non-production staging backend.');
  process.exit(2);
}

async function testUniversalWebhook() {
  console.log('Running Test A: Universal Webhook...');
  try {
    const res = await fetch(`${BASE_URL}/api/webhook?uid=test_uid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mock Webhook Lead',
        email: 'test-webhook@example.com',
        phone: '1234567890',
        projectName: 'Webhook API Ingestion Test',
        budget: 2500,
        requirement: 'Verifying Universal Webhoo¶»§q«^