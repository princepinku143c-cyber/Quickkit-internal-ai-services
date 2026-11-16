import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
const testEnv = await initializeTestEnvironment({
  projectId: 'demo-quickkitai-rules',
  firestore: { rules },
});

const stamp = '2026-11-15T00:00:00.000Z';

try {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'users', 'admin'), {
      uid: 'admin',
      role: 'admin',
      email: 'admin@quickkitai.com',
    });
    await setDoc(doc(db, 'users', 'alice'), {
      uid: 'alice',
      role: 'client',
      email: 'alice@example.com',
      credits: 500,
      plan: 'free',
      createdAt: stamp,
    });
    await setDoc(doc(db, 'users', 'bob'), {
      uid: 'bob',
      role: 'client',
      email: 'bob@example.com',
      credits: 500,
      plan: 'free',
      createdAt: stamp,
    });
    await setDoc(doc(db, 'users', 'new-profile'), {
      uid: 'new-profile',
      role: 'client',
      email: 'new-profile@example.com',
      createdAt: stamp,
    });
    await setDoc(doc(db, 'projects', 'alice-project'), {
      userId: 'alice',
      projectName: 'Alice project',
    });
    await setDoc(doc(db, 'agents', 'alice-agent'), {
      userId: 'alice',
      name: 'Alice agent',
    });
    await setDoc(doc(db, 'leads', 'alice-lead'), {
      userId: 'alice',
      status: 'NEW',
    });
    await setDoc(doc(db, 'logs', 'alice-log'), {
      user_id: 'alice',
      action: 'test',
    });
    await setDoc(doc(db, 'payment_requests', 'alice-request'), {
      userId: 'alice',
      userEmail: 'alice@example.com',
      credits: 100,
      price: 10,
      status: 'pending',
      createdAt: stamp,
    });
    await setDoc(doc(db, 'payments', 'alice-payment'), {
      userId: 'alice',
      amount: 10,
    });
    await setDoc(doc(db, 'projects', 'bob-project'), {
      userId: 'bob',
      projectName: 'Bob project',
    });
    await setDoc(doc(db, 'agents', 'bob-agent'), {
      userId: 'bob',
      name: 'Bob agent',
    });
    await setDoc(doc(db, 'leads', 'bob-lead'), {
      userId: 'bob',
      status: 'NEW',
    });
    await setDoc(doc(db, 'logs', 'bob-log'), {
      user_id: 'bob',
      action: 'test',
    });
    await setDoc(doc(db, 'payment_requests', 'bob-request'), {
      userId: 'bob',
      userEmail: 'bob@example.com',
      credits: 100,
      price: 10,
      status: 'pending',
      createdAt: stamp,
    });
    await setDoc(doc(db, 'payments', 'bob-payment'), {
      userId: 'bob',
      amount: 10,
    });
    // Telegram settings and chat history are server-owned records.
    await setDoc(doc(db, 'settings', 'telegram'), { chatId: 'internal-test-chat' });
    await setDoc(doc(db, 'settings', 'telegram', 'chat_history', 'private-entry'), {
      text: 'server-owned test fixture',
      timestamp: stamp,
    });
  });

  const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' }).firestore();
  const bob = testEnv.authenticatedContext('bob', { email: 'bob@example.com' }).firestore();
  const admin = testEnv.authenticatedContext('admin', { email: 'admin@quickkitai.com' }).firestore();
  const newProfile = testEnv.authenticatedContext('new-profile', { email: 'new-profile@example.com' }).firestore();
  const freshUser = testEnv.authenticatedContext('fresh-user', { email: 'fresh@example.com' }).firestore();
  const forgedAdminClaim = testEnv.authenticatedContext('forged-admin', {
    email: 'forged-admin@example.com',
    role: 'admin',
    admin: true,
  }).firestore();
  const anonymous = testEnv.unauthenticatedContext().firestore();

  // Server-owned nested Telegram history must not be readable or writable
  // through any client SDK, including an authenticated admin client.
  for (const clientDb of [anonymous, alice, admin]) {
    const telegramHistory = doc(clientDb, 'settings', 'telegram', 'chat_history', 'private-entry');
    await assertFails(getDoc(telegramHistory));
    await assertFails(getDocs(collection(clientDb, 'settings', 'telegram', 'chat_history')));
    // A collection-group query must not bypass the server-only nested-path rule.
    await assertFails(getDocs(query(collectionGroup(clientDb, 'chat_history'))));
    await assertFails(setDoc(telegramHistory, { text: 'client-forged' }));
    await assertFails(deleteDoc(telegramHistory));
  }

  // A new account cannot self-assign an admin role, quota, plan or tenant.
  await assertFails(setDoc(doc(freshUser, 'users', 'fresh-user'), {
    uid: 'fresh-user',
    email: 'fresh@example.com',
    role: 'admin',
  }));
  await assertFails(setDoc(doc(freshUser, 'users', 'fresh-user'), {
    uid: 'fresh-user',
    email: 'fresh@example.com',
    role: 'client',
    credits: 999999,
    plan: 'free',
  }));
  // Every reserved tenant/workspace identifier is server-managed on profile creation.
  for (const field of ['tenantId', 'workspaceId', 'companyId', 'organizationId']) {
    await assertFails(setDoc(doc(freshUser, 'users', 'fresh-user'), {
      uid: 'fresh-user',
      email: 'fresh@example.com',
      role: 'client',
      credits: 500,
      plan: 'free',
      [field]: 'victim-tenant',
    }));
  }
  await assertSucceeds(setDoc(doc(freshUser, 'users', 'fresh-user'), {
    uid: 'fresh-user',
    email: 'fresh@example.com',
    role: 'client',
    credits: 500,
    plan: 'free',
    createdAt: stamp,
  }));

  // Firebase custom claims alone must never grant Firestore admin access.
  // The trusted server-managed profile remains the authority for isAdmin().
  await assertSucceeds(setDoc(doc(forgedAdminClaim, 'users', 'forged-admin'), {
    uid: 'forged-admin',
    email: 'forged-admin@example.com',
    role: 'client',
    createdAt: stamp,
  }));
  await assertFails(getDoc(doc(forgedAdminClaim, 'promo_codes', 'LAUNCH')));
  await assertFails(getDocs(collection(forgedAdminClaim, 'users')));
  await assertFails(setDoc(doc(forgedAdminClaim, 'projects', 'forged-admin-project'), {
    userId: 'forged-admin',
    projectName: 'Claim-forged project',
  }));

  // Existing accounts can receive the one-time initial trial grant only.
  await assertSucceeds(updateDoc(doc(newProfile, 'users', 'new-profile'), {
    credits: 500,
    plan: 'free',
  }));
  await assertFails(updateDoc(doc(newProfile, 'users', 'new-profile'), {
    credits: 0,
  }));
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), { role: 'admin' }));
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), { credits: 999999 }));
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), { monthlyLimit: 999999 }));
  // Existing users cannot add or change any server-owned tenant identifier.
  for (const field of ['tenantId', 'workspaceId', 'companyId', 'organizationId']) {
    await assertFails(updateDoc(doc(alice, 'users', 'alice'), { [field]: 'victim-tenant' }));
  }
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), { email: 'bob@example.com' }));
  await assertSucceeds(updateDoc(doc(alice, 'users', 'alice'), {
    displayName: 'Alice',
    workspaceName: 'Alice Realty',
    updated_at: stamp,
  }));
  // The Integrations screen stores a 256-bit webhook secret on the owner's profile.
  await assertSucceeds(updateDoc(doc(alice, 'users', 'alice'), {
    webhookSecret: 'a'.repeat(64),
  }));
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), {
    webhookSecret: 'a'.repeat(63),
  }));
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), {
    webhookSecret: 'g'.repeat(64),
  }));
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), {
    webhookSecret: 'A'.repeat(64),
  }));
  await assertFails(updateDoc(doc(bob, 'users', 'alice'), {
    webhookSecret: 'b'.repeat(64),
  }));
  await assertFails(getDoc(doc(bob, 'users', 'alice')));
  await assertSucceeds(getDoc(doc(admin, 'users', 'alice')));

  // Projects are admin-created and remain isolated to their assigned user.
  await assertFails(setDoc(doc(alice, 'projects', 'forged-project'), {
    userId: 'alice',
    projectName: 'Forged project',
  }));
  await assertFails(setDoc(doc(alice, 'projects', 'victim-project'), {
    userId: 'bob',
    projectName: 'Victim project',
  }));
  await assertSucceeds(setDoc(doc(admin, 'projects', 'admin-created-project'), {
    userId: 'alice',
    projectName: 'Admin-created project',
  }));
  await assertFails(setDoc(doc(admin, 'projects', 'orphan-project'), {
    userId: 'missing-user',
    projectName: 'Orphan project',
  }));
  await assertSucceeds(getDoc(doc(alice, 'projects', 'alice-project')));
  await assertFails(getDoc(doc(bob, 'projects', 'alice-project')));

  // Agent owners cannot transfer a record to another tenant or user.
  await assertFails(updateDoc(doc(alice, 'agents', 'alice-agent'), { userId: 'bob' }));
  // An agent owner cannot attach or mutate any reserved tenant/workspace identifier.
  for (const field of ['tenantId', 'workspaceId', 'companyId', 'organizationId']) {
    await assertFails(updateDoc(doc(alice, 'agents', 'alice-agent'), { [field]: 'victim-tenant' }));
  }
  await assertSucceeds(updateDoc(doc(alice, 'agents', 'alice-agent'), { name: 'Updated agent' }));
  await assertFails(updateDoc(doc(bob, 'agents', 'alice-agent'), { name: 'Hijacked agent' }));

  // Client leads are read-only; creation and mutation stay on trusted paths.
  await assertFails(setDoc(doc(alice, 'leads', 'forged-lead'), { userId: 'alice', status: 'NEW' }));
  await assertFails(updateDoc(doc(alice, 'leads', 'alice-lead'), { status: 'WON' }));
  await assertSucceeds(updateDoc(doc(admin, 'leads', 'alice-lead'), { status: 'WON' }));
  await assertFails(getDoc(doc(bob, 'leads', 'alice-lead')));

  // Client credit requests are owner-bound and remain pending until admin approval.
  await assertSucceeds(setDoc(doc(alice, 'payment_requests', 'alice-new-request'), {
    userId: 'alice',
    userEmail: 'alice@example.com',
    credits: 100,
    price: 10,
    status: 'pending',
    createdAt: stamp,
  }));
  await assertFails(setDoc(doc(alice, 'payment_requests', 'spoofed-request'), {
    userId: 'bob',
    userEmail: 'bob@example.com',
    credits: 100,
    price: 10,
    status: 'pending',
    createdAt: stamp,
  }));
  await assertFails(updateDoc(doc(alice, 'payment_requests', 'alice-new-request'), {
    status: 'approved',
  }));
  await assertFails(getDoc(doc(bob, 'payment_requests', 'alice-request')));
  await assertSucceeds(getDoc(doc(admin, 'payment_requests', 'alice-request')));
  await assertSucceeds(updateDoc(doc(admin, 'payment_requests', 'alice-new-request'), {
    status: 'approved',
  }));

  // Admin-only collections and server-only payment writes.
  await assertFails(getDoc(doc(alice, 'promo_codes', 'LAUNCH')));
  await assertSucceeds(setDoc(doc(admin, 'promo_codes', 'LAUNCH'), {
    code: 'LAUNCH',
    amount: 100,
    maxUses: 10,
    usedBy: [],
  }));
  await assertSucceeds(setDoc(doc(admin, 'logs', 'admin-log'), {
    user_id: 'alice',
    action: 'Admin update',
  }));
  await assertSucceeds(getDoc(doc(alice, 'logs', 'admin-log')));
  await assertFails(getDoc(doc(bob, 'logs', 'admin-log')));
  await assertSucceeds(getDoc(doc(alice, 'payments', 'alice-payment')));
  await assertFails(getDoc(doc(bob, 'payments', 'alice-payment')));
  await assertFails(deleteDoc(doc(admin, 'payments', 'alice-payment')));
  await assertFails(getDoc(doc(alice, 'unknown-private-collection', 'record')));

  // Collection queries must prove ownership; Firestore rules are not filters.
  // A query that could return another user's records must be denied.
  const aliceLeads = await getDocs(query(collection(alice, 'leads'), where('userId', '==', 'alice')));
  assert.equal(aliceLeads.size, 1);
  await assertSucceeds(getDocs(query(collection(bob, 'leads'), where('userId', '==', 'bob'))));
  await assertFails(getDocs(collection(alice, 'leads')));
  await assertFails(getDocs(query(collection(alice, 'leads'), where('userId', '==', 'bob'))));
  await assertSucceeds(getDocs(collection(admin, 'leads')));

  const aliceProjects = await getDocs(query(collection(alice, 'projects'), where('userId', '==', 'alice')));
  assert.equal(aliceProjects.size, 2);
  await assertSucceeds(getDocs(query(collection(bob, 'projects'), where('userId', '==', 'bob'))));
  await assertFails(getDocs(collection(alice, 'projects')));
  await assertFails(getDocs(query(collection(alice, 'projects'), where('userId', '==', 'bob'))));
  await assertSucceeds(getDocs(collection(admin, 'projects')));

  const aliceAgents = await getDocs(query(collection(alice, 'agents'), where('userId', '==', 'alice')));
  assert.equal(aliceAgents.size, 1);
  await assertSucceeds(getDocs(query(collection(bob, 'agents'), where('userId', '==', 'bob'))));
  await assertFails(getDocs(collection(alice, 'agents')));
  await assertFails(getDocs(query(collection(alice, 'agents'), where('userId', '==', 'bob'))));
  await assertSucceeds(getDocs(collection(admin, 'agents')));

  const aliceLogs = await getDocs(query(collection(alice, 'logs'), where('user_id', '==', 'alice')));
  assert.equal(aliceLogs.size, 2);
  await assertSucceeds(getDocs(query(collection(bob, 'logs'), where('user_id', '==', 'bob'))));
  await assertFails(getDocs(collection(alice, 'logs')));
  await assertFails(getDocs(query(collection(alice, 'logs'), where('user_id', '==', 'bob'))));
  await assertSucceeds(getDocs(collection(admin, 'logs')));

  const alicePayments = await getDocs(query(collection(alice, 'payments'), where('userId', '==', 'alice')));
  assert.equal(alicePayments.size, 1);
  await assertSucceeds(getDocs(query(collection(bob, 'payments'), where('userId', '==', 'bob'))));
  await assertFails(getDocs(collection(alice, 'payments')));
  await assertFails(getDocs(query(collection(alice, 'payments'), where('userId', '==', 'bob'))));
  await assertSucceeds(getDocs(collection(admin, 'payments')));

  const aliceRequests = await getDocs(query(collection(alice, 'payment_requests'), where('userId', '==', 'alice')));
  assert.equal(aliceRequests.size, 2);
  await assertSucceeds(getDocs(query(collection(bob, 'payment_requests'), where('userId', '==', 'bob'))));
  await assertFails(getDocs(collection(alice, 'payment_requests')));
  await assertFails(getDocs(query(collection(alice, 'payment_requests'), where('userId', '==', 'bob'))));
  await assertSucceeds(getDocs(collection(admin, 'payment_requests')));

  const aliceProfileQuery = await getDocs(query(collection(alice, 'users'), where(documentId(), '==', 'alice')));
  assert.equal(aliceProfileQuery.size, 1);
  await assertFails(getDocs(collection(alice, 'users')));
  await assertSucceeds(getDocs(collection(admin, 'users')));

  await assertFails(getDocs(collection(alice, 'promo_codes')));
  await assertSucceeds(getDocs(collection(admin, 'promo_codes')));

  // Clients may create their own agent records, but cannot assign tenant/workspace identity.
  await assertSucceeds(setDoc(doc(alice, 'agents', 'alice-new-agent'), {
    userId: 'alice',
    name: 'Alice new agent',
  }));
  for (const field of ['tenantId', 'workspaceId', 'companyId', 'organizationId']) {
    await assertFails(setDoc(doc(alice, 'agents', 'spoofed-' + field), {
      userId: 'alice',
      name: 'Spoofed agent',
      [field]: 'victim-tenant',
    }));
  }

  console.log('Firestore security rules emulator tests passed.');
} finally {
  await testEnv.cleanup();
}
