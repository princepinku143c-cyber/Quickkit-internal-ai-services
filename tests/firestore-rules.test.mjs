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
      projectName: ¶»§q«^