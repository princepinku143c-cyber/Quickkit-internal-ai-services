import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const rules = await readFile(
  new URL("../quickkit-automation-agent-main/firestore.rules", import.meta.url),
  "utf8",
);
const config = JSON.parse(await readFile(
  new URL("../quickkit-automation-agent-main/firebase.json", import.meta.url),
  "utf8",
));
assert.equal(
  config.firestore?.rules,
  "firestore.rules",
  "nested Firebase CLI config must reference the rules exercised by this suite",
);

const testEnv = await initializeTestEnvironment({
  projectId: "demo-quickkitai-nested-rules",
  firestore: { rules },
});

const defaultProfile = (uid, email) => ({
  uid,
  email,
  tier: "FREE",
  region: "GLOBAL",
  role: "USER",
  status: "active",
  expiresAt: 0,
  updatedAt: 1,
  autoRenew: false,
  credits: 5,
  aiUsed: 0,
  monthlyLimit: 5,
  usage: { workflows: 0, runs: 0, apiCalls: 0 },
  warningSent: false,
  createdAt: 1,
  onboardingDone: false,
});

const project = (userId) => ({
  userId,
  title: "Tenant project",
  description: "Isolated test project",
  createdAt: 1,
  updatedAt: 1,
  nexuses: [],
  synapses: [],
  settings: {},
});

const activeRun = (runId, userId, mode) => ({
  runId,
  userId,
  projectId: userId + "-project",
  mode,
  status: "RUNNING",
  currentQueue: [],
  completedNodeIds: [],
  context: {},
  startTime: 1,
  lastUpdateTime: 1,
  nodeLimitCount: 0,
});

try {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "users", "alice"), defaultProfile("alice", "alice@example.com"));
    await setDoc(doc(db, "users", "bob"), defaultProfile("bob", "bob@example.com"));
    await setDoc(doc(db, "projects", "alice-project"), project("alice"));
    await setDoc(doc(db, "projects", "bob-project"), project("bob"));
    await setDoc(doc(db, "active_runs", "alice-local"), activeRun("alice-local", "alice", "local"));
    await setDoc(doc(db, "active_runs", "alice-cloud"), activeRun("alice-cloud", "alice", "cloud"));
    await setDoc(doc(db, "active_runs", "bob-local"), activeRun("bob-local", "bob", "local"));
    await setDoc(doc(db, "architect_memory", "alice-memory"), {
      userId: "alice",
      userPrompt: "Private Alice prompt",
      blueprintSummary: "Alice summary",
      fullBlueprint: { nexuses: [], synapses: [] },
      createdAt: 1,
      likes: 1,
    });
    await setDoc(doc(db, "architect_memory", "bob-memory"), {
      userId: "bob",
      userPrompt: "Private Bob prompt",
      blueprintSummary: "Bob summary",
      fullBlueprint: { nexuses: [], synapses: [] },
      createdAt: 1,
      likes: 1,
    });
    await setDoc(doc(db, "execution_logs", "alice-log"), {
      id: "alice-log",
      timestamp: 1,
      nexusId: "node-a",
      status: "success",
      message: "Alice execution",
      duration: 1,
      userId: "alice",
      createdAt: new Date(1),
    });
    await setDoc(doc(db, "execution_logs", "bob-log"), {
      id: "bob-log",
      timestamp: 1,
      nexusId: "node-b",
      status: "success",
      message: "Bob execution",
      duration: 1,
      userId: "bob",
      createdAt: new Date(1),
    });
    await setDoc(doc(db, "payments", "alice-payment"), { userId: "alice", amount: 100 });
    await setDoc(doc(db, "payments", "bob-payment"), { userId: "bob", amount: 200 });
    await setDoc(doc(db, "coupons", "welcome"), { code: "WELCOME", active: true });
  });

  const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com" }).firestore();
  const bob = testEnv.authenticatedContext("bob", { email: "bob@example.com" }).firestore();
  const fresh = testEnv.authenticatedContext("fresh-user", { email: "fresh@example.com" }).firestore();
  const anonymous = testEnv.unauthenticatedContext().firestore();

  // Profiles: a user can read/update only their own profile and cannot self-promote.
  await assertSucceeds(getDoc(doc(alice, "users", "alice")));
  await assertFails(getDoc(doc(bob, "users", "alice")));
  await assertFails(getDoc(doc(anonymous, "users", "alice")));
  await assertSucceeds(updateDoc(doc(alice, "users", "alice"), { lastLoginAt: 2 }));
  await assertFails(updateDoc(doc(alice, "users", "alice"), { role: "ADMIN" }));
  await assertFails(updateDoc(doc(alice, "users", "alice"), { credits: 999999 }));
  await assertFails(deleteDoc(doc(alice, "users", "alice")));
  await assertSucceeds(setDoc(doc(fresh, "users", "fresh-user"), defaultProfile("fresh-user", "fresh@example.com")));
  await assertFails(setDoc(doc(fresh, "users", "fresh-user"), { ...defaultProfile("fresh-user", "fresh@example.com"), role: "ADMIN" }));
  await assertFails(setDoc(doc(fresh, "users", "fresh-user"), { ...defaultProfile("fresh-user", "fresh@example.com"), tenantId: "other-tenant" }));

  // Projects: ownership is bound at creation and cannot be reassigned.
  await assertSucceeds(getDoc(doc(alice, "projects", "alice-project")));
  await assertFails(getDoc(doc(bob, "projects", "alice-project")));
  const aliceProjects = await getDocs(query(collection(alice, "projects"), where("userId", "==", "alice")));
  assert.equal(aliceProjects.size, 1);
  await assertFails(getDocs(collection(alice, "projects")));
  await assertSucceeds(setDoc(doc(alice, "projects", "alice-new-project"), project("alice")));
  await assertFails(setDoc(doc(alice, "projects", "forged-project"), project("bob")));
  await assertFails(updateDoc(doc(alice, "projects", "alice-project"), { userId: "bob" }));
  await assertSucceeds(updateDoc(doc(alice, "projects", "alice-project"), { settings: { theme: "dark" }, updatedAt: 2 }));

  // Active runs: clients cannot create runs; only local owner checkpoints are mutable.
  await assertSucceeds(getDoc(doc(alice, "active_runs", "alice-local")));
  await assertFails(getDoc(doc(bob, "active_runs", "alice-local")));
  await assertFails(getDocs(collection(alice, "active_runs")));
  await assertFails(setDoc(doc(alice, "active_runs", "forged-run"), activeRun("forged-run", "alice", "local")));
  await assertSucceeds(updateDoc(doc(alice, "active_runs", "alice-local"), { status: "PAUSED", lastUpdateTime: 2 }));
  await assertFails(updateDoc(doc(alice, "active_runs", "alice-local"), { userId: "bob" }));
  await assertFails(updateDoc(doc(alice, "active_runs", "alice-cloud"), { status: "PAUSED", lastUpdateTime: 2 }));
  await assertSucceeds(deleteDoc(doc(alice, "active_runs", "alice-local")));
  await assertFails(deleteDoc(doc(alice, "active_runs", "alice-cloud")));

  // Architect memory and execution logs remain tenant-scoped and immutable after creation.
  await assertSucceeds(getDoc(doc(alice, "architect_memory", "alice-memory")));
  await assertFails(getDoc(doc(bob, "architect_memory", "alice-memory")));
  await assertFails(getDocs(collection(alice, "architect_memory")));
  await assertSucceeds(getDocs(query(collection(alice, "architect_memory"), where("userId", "==", "alice"))));
  await assertSucceeds(setDoc(doc(alice, "architect_memory", "alice-new-memory"), {
    userId: "alice",
    userPrompt: "A valid private prompt",
    blueprintSummary: "A short summary",
    fullBlueprint: { nexuses: [], synapses: [] },
    createdAt: 2,
    likes: 1,
  }));
  await assertFails(setDoc(doc(alice, "architect_memory", "forged-memory"), {
    userId: "bob",
    userPrompt: "Spoofed owner",
    blueprintSummary: "Invalid",
    fullBlueprint: { nexuses: [], synapses: [] },
    createdAt: 2,
    likes: 1,
  }));
  await assertFails(updateDoc(doc(alice, "architect_memory", "alice-memory"), { likes: 2 }));
  await assertFails(deleteDoc(doc(alice, "architect_memory", "alice-memory")));

  await assertSucceeds(getDoc(doc(alice, "execution_logs", "alice-log")));
  await assertFails(getDoc(doc(bob, "execution_logs", "alice-log")));
  await assertSucceeds(getDocs(query(collection(alice, "execution_logs"), where("userId", "==", "alice"))));
  await assertFails(getDocs(collection(alice, "execution_logs")));
  await assertSucceeds(setDoc(doc(alice, "execution_logs", "alice-new-log"), {
    id: "alice-new-log",
    timestamp: 2,
    nexusId: "node-a",
    status: "success",
    message: "Created by Alice",
    duration: 1,
    userId: "alice",
    createdAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(alice, "execution_logs", "forged-log"), {
    id: "forged-log",
    timestamp: 2,
    nexusId: "node-a",
    status: "success",
    message: "Spoofed owner",
    duration: 1,
    userId: "bob",
    createdAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(doc(alice, "execution_logs", "alice-log"), { message: "tampered" }));
  await assertFails(deleteDoc(doc(alice, "execution_logs", "alice-log")));

  // Payment records are read-only to clients and visible only to their owner.
  await assertSucceeds(getDoc(doc(alice, "payments", "alice-payment")));
  await assertFails(getDoc(doc(bob, "payments", "alice-payment")));
  await assertSucceeds(getDocs(query(collection(alice, "payments"), where("userId", "==", "alice"))));
  await assertFails(getDocs(collection(alice, "payments")));
  await assertFails(setDoc(doc(alice, "payments", "forged-payment"), { userId: "alice", amount: 1 }));
  await assertFails(updateDoc(doc(alice, "payments", "alice-payment"), { amount: 1 }));
  await assertFails(deleteDoc(doc(alice, "payments", "alice-payment")));

  // Coupon lookup is intentionally available to authenticated customers; writes stay server-only.
  await assertSucceeds(getDoc(doc(alice, "coupons", "welcome")));
  await assertFails(getDoc(doc(anonymous, "coupons", "welcome")));
  await assertFails(setDoc(doc(alice, "coupons", "forged-coupon"), { code: "FORGED", active: true }));
  await assertFails(getDoc(doc(alice, "unknown_private_collection", "record")));

  console.log("Nested Firestore authorization regression tests passed.");
} finally {
  await testEnv.cleanup();
}
