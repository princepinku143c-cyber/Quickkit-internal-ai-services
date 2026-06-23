import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

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

    if (status === 200 && (body.status === 'LEAD_INGESTED' || body.leadId)) {
      console.log('✅ Test A: Universal Webhook - PASS');
      return true;
    } else {
      console.log(`❌ Test A: Universal Webhook - FAIL (Expected 200, got ${status})`);
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

    if (status === 200 && body.reply && typeof body.reply === 'string') {
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

    if (status === 200 && (body.status === 'LEAD_CREATED' || body.projectId)) {
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
