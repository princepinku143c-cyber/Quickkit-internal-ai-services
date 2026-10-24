import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = (process.env.TEST_BASE_URL || '').replace(/\/$/, '');
const TEST_WEBHOOK_SECRET = process.env.TEST_WEBHOOK_SECRET || '';
const TEST_WEBHOOK_UID = process.env.TEST_WEBHOOK_UID || '';
if (!BASE_URL) {
  console.error('Set TEST_BASE_URL to a dedicated local Vercel Dev/staging API before running this integration suite. It submits test leads and calls AI endpoints; it intentionally has no implicit localhost/production default.');
  process.exit(2);
}
if (!TEST_WEBHOOK_SECRET || !TEST_WEBHOOK_UID) {
  console.error('Set TEST_WEBHOOK_SECRET and TEST_WEBHOOK_UID for a dedicated staging user before running the webhook integration test.');
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
    const res = await fetch(`${BASE_URL}/api/webhook?uid=${encodeURIComponent(TEST_WEBHOOK_UID)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': TEST_WEBHOOK_SECRET },
      body: JSON.stringify({
        name: 'Mock Webhook Lead',
        email: 'test-webhook@example.com',
        phone: '1234567890',
        projectName: 'Webhook API Ingestion Test',
        budget: 2500,
        requirement: 'Verifying Universal Webhook Endpoint routing.',
        custom_metadata: {
          niche: 'Real Estate Automation',
          source: 'Universal Integration Suite'
        }
      })
    });

    const status = res.status;
    const body = await res.json();
    console.log(`Test A Response Status: ${status}`, body);

    const data = body.data || body;
    if (status === 200 && (data.status === 'LEAD_INGESTED' || data.leadId)) {
      console.log('✅ Test A: Universal Webhook - PASS');
      return true;
    } else {
      console.log(`❌ Test A: Universal Webhook - FAIL (Expected 200 with leadId/LEAD_INGESTED, got ${status})`);
      return false;
    }
  } catch (error) {
    console.error('❌ Test A: Universal Webhook - FAIL with exception:', error.message);
    return false;
  }
}

async function testKellyChat() {
  console.log('Running Test B: Kelly AI Chat Engine...');
  try {
    const res = await fetch(`${BASE_URL}/api/ai?action=kelly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hi Kelly, my email is testrobot@global.com',
        history: []
      })
    });

    const status = res.status;
    const body = await res.json();
    console.log(`Test B Response Status: ${status}`, body);

    const data = body.data || body;
    if (status === 200 && data.reply && typeof data.reply === 'string') {
      console.log('✅ Test B: Kelly AI Chat Engine - PASS');
      return true;
    } else {
      console.log(`❌ Test B: Kelly AI Chat Engine - FAIL (Expected 200 with reply string, got status ${status})`);
      return false;
    }
  } catch (error) {
    console.error('❌ Test B: Kelly AI Chat Engine - FAIL with exception:', error.message);
    return false;
  }
}

async function testCrmSync() {
  console.log('Running Test C: System CRM Sync...');
  try {
    const res = await fetch(`${BASE_URL}/api/system?action=lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'CRM Sync Test Lead',
        email: 'crmtest@example.com',
        phone: '9876543210',
        projectName: 'System CRM Sync Test',
        requirement: 'Testing Nodemailer and Odoo JSON-RPC routing pipeline.',
        price: 3500
      })
    });

    const status = res.status;
    const body = await res.json();
    console.log(`Test C Response Status: ${status}`, body);

    const data = body.data || body;
    if (status === 200 && (data.status === 'LEAD_CREATED' || data.projectId)) {
      console.log('✅ Test C: System CRM Sync - PASS');
      return true;
    } else {
      console.log(`❌ Test C: System CRM Sync - FAIL (Expected 200, got ${status})`);
      return false;
    }
  } catch (error) {
    console.error('❌ Test C: System CRM Sync - FAIL with exception:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log(`=== STARTING BACKEND INTEGRATION TEST SUITE ===`);
  console.log(`Targeting base URL: ${BASE_URL}\n`);

  const results = {
    webhook: await testUniversalWebhook(),
    kelly: await testKellyChat(),
    crmSync: await testCrmSync()
  };

  console.log(`\n=== TEST SUITE RESULTS SUMMARY ===`);
  console.log(`Test A (Universal Webhook): ${results.webhook ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test B (Kelly AI Engine):   ${results.kelly ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test C (System CRM Sync):   ${results.crmSync ? '✅ PASS' : '❌ FAIL'}`);

  const allPass = Object.values(results).every(r => r === true);
  if (allPass) {
    console.log('\n✅ TEST PASS: All integration routes responded successfully.');
    process.exit(0);
  } else {
    console.log('\n❌ TEST FAIL: One or more critical route integrations failed.');
    process.exit(1);
  }
}

runAllTests();
