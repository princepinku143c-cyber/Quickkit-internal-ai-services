import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
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
  });

  const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' }).firestore();
  const bob = testEnv.authenticatedContext('bob', { email: 'bob@example.com' }).firestore();
  const admin = testEnv.authenticatedContext('admin', { email: 'admin@quickkitai.com' }).firestore();
  const newProfile = testEnv.authenticatedContext('new-profile', { email: 'new-profile@example.com' }).firestore();
  const freshUser = testEnv.authenticatedContext('fresh-user', { email: 'fresh@example.com' }).firestore();

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
  await assertFails(setDoc(doc(freshUser, 'users', 'fresh-user'), {
    uid: 'fresh-user',
    email: 'fresh@example.com',
    role: 'client',
    credits: 500,
    plan: 'free',
    tenantId: 'victim-tenant',
  }));
  await assertSucceeds(setDoc(doc(freshUser, 'users', 'fresh-user'), {
    uid: 'fresh-user',
    email: 'fresh@example.com',
    role: 'client',
    credits: 500,
    plan: 'free',
    createdAt: stamp,
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
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), { tenantId: 'victim-tenant' }));
  await assertFails(updateDoc(doc(alice, 'users', 'alice'), { email: 'bob@example.com' }));
  await assertSucceeds(updateDoc(doc(alice, 'users', 'alice'), {
    displayName: 'Alice',
    workspaceName: 'Alice Realty',
    updated_at: stamp,
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
  await assertFails(updateDoc(doc(alice, 'agents', 'alice-agent'), { tenantId: 'victim-tenant' }));
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

  console.log('Firestore security rules emulator tests passed.');
} finally {
  await testEnv.cleanup();
}
