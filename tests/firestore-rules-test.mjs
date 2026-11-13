import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const projectId = "demo-quickkit-firestore-rules";
const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: { rules },
});

const anonymousDb = testEnv.unauthenticatedContext().firestore();
const clientOneDb = testEnv.authenticatedContext("client-1").firestore();
const spoofedAdminDb = testEnv.authenticatedContext("client-1", { role: "admin", admin: true }).firestore();
const adminDb = testEnv.authenticatedContext("admin-1").firestore();

try {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, "users/admin-1"), { role: "admin", uid: "admin-1" }),
      setDoc(doc(db, "users/client-1"), { role: "client", uid: "client-1", operatorName: "Client One" }),
      setDoc(doc(db, "users/client-2"), { role: "client", uid: "client-2", operatorName: "Client Two" }),
      setDoc(doc(db, "leads/lead-client-1"), { userId: "client-1", name: "Lead One" }),
      setDoc(doc(db, "leads/lead-client-2"), { userId: "client-2", name: "Lead Two" }),
      setDoc(doc(db, "projects/project-client-1"), { userId: "client-1", name: "Project One" }),
      setDoc(doc(db, "projects/project-client-2"), { userId: "client-2", name: "Project Two" }),
      setDoc(doc(db, "payments/payment-client-1"), { userId: "client-1", amount: 100 }),
      setDoc(doc(db, "payments/payment-client-2"), { userId: "client-2", amount: 200 }),
      setDoc(doc(db, "logs/log-client-1"), { userId: "client-1", message: "own log" }),
      setDoc(doc(db, "logs/log-client-2"), { userId: "client-2", message: "other log" }),
      setDoc(doc(db, "agents/agent-client-1"), { userId: "client-1", name: "Own Agent" }),
      setDoc(doc(db, "agents/agent-client-2"), { userId: "client-2", name: "Other Agent" }),
      setDoc(doc(db, "leads_outreach/outreach-1"), { userId: "client-1", status: "queued" }),
      // These collections are intentionally server-only; client SDK access must stay denied.
      setDoc(doc(db, "aeo_generations/server-seed"), { userId: "admin-1", status: "draft" }),
      setDoc(doc(db, "settings/server-seed"), { serverOnly: true }),
      setDoc(doc(db, "chat_history/server-seed"), { userId: "client-1", messages: [] }),
      // Nested collection paths must not inherit top-level client access rules.
      setDoc(doc(db, "users/client-1/aeo_generations/nested-server-seed"), { status: "draft" }),
      setDoc(doc(db, "users/client-1/settings/nested-server-seed"), { serverOnly: true }),
      setDoc(doc(db, "users/client-1/chat_history/nested-server-seed"), { messages: [] }),
      setDoc(doc(db, "users/client-1/private/secret"), { ownerId: "client-1" }),
      setDoc(doc(db, "users/client-2/private/secret"), { ownerId: "client-2" }),
    ]);
  });

  // Anonymous users cannot read protected user data.
  await assertFails(getDoc(doc(anonymousDb, "users/client-1")));
  // Anonymous callers cannot read any protected collection.
  await Promise.all([
    assertFails(getDoc(doc(anonymousDb, "leads/lead-client-1"))),
    assertFails(getDoc(doc(anonymousDb, "projects/project-client-1"))),
    assertFails(getDoc(doc(anonymousDb, "payments/payment-client-1"))),
    assertFails(getDoc(doc(anonymousDb, "logs/log-client-1"))),
    assertFails(getDoc(doc(anonymousDb, "agents/agent-client-1"))),
    assertFails(getDoc(doc(anonymousDb, "leads_outreach/outreach-1"))),
  ]);

  // AEO drafts, operational settings, and chat history are server-only collections.
  // Even authenticated admin users must use trusted API/Admin SDK paths rather than
  // gaining direct client-SDK access to these records.
  for (const collectionName of ["aeo_generations", "settings", "chat_history"]) {
    const seedPath = `${collectionName}/server-seed`;
    await Promise.all([
      assertFails(getDoc(doc(anonymousDb, seedPath))),
      assertFails(getDoc(doc(clientOneDb, seedPath))),
      assertFails(getDoc(doc(adminDb, seedPath))),
      assertFails(getDocs(collection(anonymousDb, collectionName))),
      assertFails(getDocs(collection(clientOneDb, collectionName))),
      assertFails(getDocs(collection(adminDb, collectionName))),
      assertFails(getDocs(collectionGroup(anonymousDb, collectionName))),
      assertFails(getDocs(collectionGroup(clientOneDb, collectionName))),
      assertFails(getDocs(collectionGroup(adminDb, collectionName))),
      assertFails(setDoc(doc(clientOneDb, `${collectionName}/client-create`), { attempted: true })),
      assertFails(setDoc(doc(adminDb, `${collectionName}/admin-client-create`), { attempted: true })),
      assertFails(updateDoc(doc(clientOneDb, seedPath), { attempted: true })),
      assertFails(updateDoc(doc(adminDb, seedPath), { attempted: true })),
      assertFails(deleteDoc(doc(clientOneDb, seedPath))),
      assertFails(deleteDoc(doc(adminDb, seedPath))),
    ]);
  }

  // Anonymous callers cannot create, update, or delete protected records.
  await Promise.all([
    assertFails(setDoc(doc(anonymousDb, "users/anonymous-created"), { role: "client" })),
    assertFails(updateDoc(doc(anonymousDb, "users/client-1"), { operatorName: "Anonymous" })),
    assertFails(deleteDoc(doc(anonymousDb, "users/client-1"))),
    assertFails(setDoc(doc(anonymousDb, "leads/anonymous-created"), { userId: "client-1" })),
    assertFails(updateDoc(doc(anonymousDb, "leads/lead-client-1"), { status: "tampered" })),
    assertFails(deleteDoc(doc(anonymousDb, "leads/lead-client-1"))),
    assertFails(setDoc(doc(anonymousDb, "projects/anonymous-created"), { userId: "client-1" })),
    assertFails(updateDoc(doc(anonymousDb, "projects/project-client-1"), { name: "tampered" })),
    assertFails(deleteDoc(doc(anonymousDb, "projects/project-client-1"))),
    assertFails(setDoc(doc(anonymousDb, "payments/anonymous-created"), { userId: "client-1", amount: 1 })),
    assertFails(updateDoc(doc(anonymousDb, "payments/payment-client-1"), { amount: 1 })),
    assertFails(deleteDoc(doc(anonymousDb, "payments/payment-client-1"))),
    assertFails(setDoc(doc(anonymousDb, "logs/anonymous-created"), { userId: "client-1" })),
    assertFails(updateDoc(doc(anonymousDb, "logs/log-client-1"), { message: "tampered" })),
    assertFails(deleteDoc(doc(anonymousDb, "logs/log-client-1"))),
    assertFails(setDoc(doc(anonymousDb, "agents/anonymous-created"), { userId: "client-1" })),
    assertFails(updateDoc(doc(anonymousDb, "agents/agent-client-1"), { name: "tampered" })),
    assertFails(deleteDoc(doc(anonymousDb, "agents/agent-client-1"))),
    assertFails(setDoc(doc(anonymousDb, "leads_outreach/anonymous-created"), { status: "queued" })),
    assertFails(updateDoc(doc(anonymousDb, "leads_outreach/outreach-1"), { status: "sent" })),
    assertFails(deleteDoc(doc(anonymousDb, "leads_outreach/outreach-1"))),
  ]);

  // Client-supplied custom claims do not grant admin access; the server-managed
  // Firestore profile role remains the authority for this ruleset.
  await assertFails(setDoc(doc(spoofedAdminDb, "leads/claim-spoof-created"), { userId: "client-1" }));
  await assertFails(setDoc(doc(spoofedAdminDb, "projects/claim-spoof-created"), { userId: "client-1" }));
  await assertFails(getDoc(doc(spoofedAdminDb, "leads_outreach/outreach-1")));


  // Users can read only their own profile and cannot self-create or self-promote.
  await assertSucceeds(getDoc(doc(clientOneDb, "users/client-1")));
  await assertFails(getDoc(doc(clientOneDb, "users/client-2")));
  await assertFails(setDoc(doc(clientOneDb, "users/client-new"), { role: "client" }));
  await assertFails(updateDoc(doc(clientOneDb, "users/client-1"), { role: "admin" }));
  await assertFails(updateDoc(doc(clientOneDb, "users/client-1"), { credits: 999 }));
  await assertFails(updateDoc(doc(clientOneDb, "users/client-1"), { tenantId: "tenant-victim" }));
  await assertFails(updateDoc(doc(clientOneDb, "users/client-1"), { workspaceId: "workspace-victim" }));
  await assertSucceeds(updateDoc(doc(clientOneDb, "users/client-1"), { operatorName: "Updated Name" }));

  // Collection queries must prove ownership for every possible result.
  // Unfiltered and cross-user queries are denied because Firestore rules are
  // authorization checks, not post-query filters.
  await assertFails(getDocs(collection(clientOneDb, "users")));
  await assertFails(getDocs(collection(clientOneDb, "leads")));
  await assertFails(getDocs(query(collection(clientOneDb, "leads"), where("userId", "==", "client-2"))));
  const ownLeadQuery = await assertSucceeds(
    getDocs(query(collection(clientOneDb, "leads"), where("userId", "==", "client-1")))
  );
  assert.deepEqual(ownLeadQuery.docs.map((snapshot) => snapshot.id), ["lead-client-1"]);

  await assertFails(getDocs(collection(clientOneDb, "projects")));
  await assertFails(getDocs(query(collection(clientOneDb, "projects"), where("userId", "==", "client-2"))));
  const ownProjectQuery = await assertSucceeds(
    getDocs(query(collection(clientOneDb, "projects"), where("userId", "==", "client-1")))
  );
  assert.deepEqual(ownProjectQuery.docs.map((snapshot) => snapshot.id), ["project-client-1"]);

  await assertFails(getDocs(collection(clientOneDb, "payments")));
  const ownPaymentQuery = await assertSucceeds(
    getDocs(query(collection(clientOneDb, "payments"), where("userId", "==", "client-1")))
  );
  assert.deepEqual(ownPaymentQuery.docs.map((snapshot) => snapshot.id), ["payment-client-1"]);

  await assertFails(getDocs(collection(clientOneDb, "logs")));
  const ownLogQuery = await assertSucceeds(
    getDocs(query(collection(clientOneDb, "logs"), where("userId", "==", "client-1")))
  );
  assert.deepEqual(ownLogQuery.docs.map((snapshot) => snapshot.id), ["log-client-1"]);

  await assertFails(getDocs(collection(clientOneDb, "agents")));
  const ownAgentQuery = await assertSucceeds(
    getDocs(query(collection(clientOneDb, "agents"), where("userId", "==", "client-1")))
  );
  assert.deepEqual(ownAgentQuery.docs.map((snapshot) => snapshot.id), ["agent-client-1"]);

  await assertFails(getDocs(collection(clientOneDb, "leads_outreach")));
  const adminOutreachQuery = await assertSucceeds(getDocs(collection(adminDb, "leads_outreach")));
  assert.deepEqual(adminOutreachQuery.docs.map((snapshot) => snapshot.id), ["outreach-1"]);

  // Leads are owner-readable but all client-side mutations are denied.
  await assertSucceeds(getDoc(doc(clientOneDb, "leads/lead-client-1")));
  await assertFails(getDoc(doc(clientOneDb, "leads/lead-client-2")));
  await assertFails(setDoc(doc(clientOneDb, "leads/client-created"), { userId: "client-1" }));
  await assertFails(updateDoc(doc(clientOneDb, "leads/lead-client-1"), { status: "qualified" }));
  await assertFails(deleteDoc(doc(clientOneDb, "leads/lead-client-1")));
  await assertSucceeds(setDoc(doc(adminDb, "leads/admin-created"), { userId: "client-1" }));
  await assertSucceeds(updateDoc(doc(adminDb, "leads/lead-client-1"), { status: "qualified" }));
  await assertSucceeds(deleteDoc(doc(adminDb, "leads/admin-created")));

  // Projects are owner-readable; direct client create/update/delete is admin-only.
  await assertSucceeds(getDoc(doc(clientOneDb, "projects/project-client-1")));
  await assertFails(getDoc(doc(clientOneDb, "projects/project-client-2")));
  await assertFails(setDoc(doc(clientOneDb, "projects/client-created"), { userId: "client-1" }));
  await assertFails(updateDoc(doc(clientOneDb, "projects/project-client-1"), { name: "tampered" }));
  await assertFails(deleteDoc(doc(clientOneDb, "projects/project-client-1")));
  await assertSucceeds(setDoc(doc(adminDb, "projects/admin-created"), { userId: "client-1" }));
  await assertSucceeds(updateDoc(doc(adminDb, "projects/project-client-1"), { name: "Admin Update" }));
  await assertSucceeds(deleteDoc(doc(adminDb, "projects/admin-created")));

  // Payments are read-only for everyone, with per-user reads for clients.
  await assertSucceeds(getDoc(doc(clientOneDb, "payments/payment-client-1")));
  await assertFails(getDoc(doc(clientOneDb, "payments/payment-client-2")));
  await assertSucceeds(getDoc(doc(adminDb, "payments/payment-client-2")));
  await assertFails(updateDoc(doc(adminDb, "payments/payment-client-1"), { amount: 0 }));

  // Logs are owner-readable; only admins can create and nobody can mutate afterwards.
  await assertSucceeds(getDoc(doc(clientOneDb, "logs/log-client-1")));
  await assertFails(getDoc(doc(clientOneDb, "logs/log-client-2")));
  await assertFails(setDoc(doc(clientOneDb, "logs/client-created"), { userId: "client-1" }));
  await assertSucceeds(setDoc(doc(adminDb, "logs/admin-created"), { userId: "client-1", message: "audit" }));
  await assertFails(updateDoc(doc(adminDb, "logs/log-client-1"), { message: "tampered" }));
  await assertFails(deleteDoc(doc(adminDb, "logs/log-client-1")));

  // Agent documents are user-owned; ownership and future tenant identifiers
  // remain server-managed so clients cannot self-assign another workspace.
  await assertSucceeds(getDoc(doc(clientOneDb, "agents/agent-client-1")));
  await assertFails(getDoc(doc(clientOneDb, "agents/agent-client-2")));
  await assertSucceeds(setDoc(doc(clientOneDb, "agents/client-created"), { userId: "client-1", name: "My Agent" }));
  await assertFails(setDoc(doc(clientOneDb, "agents/forged-owner"), { userId: "client-2", name: "Forged" }));
  await assertFails(setDoc(doc(clientOneDb, "agents/tenant-spoof"), {
    userId: "client-1", name: "Tenant Spoof", tenantId: "tenant-victim"
  }));
  await assertFails(setDoc(doc(clientOneDb, "agents/workspace-spoof"), {
    userId: "client-1", name: "Workspace Spoof", workspaceId: "workspace-victim"
  }));
  await assertSucceeds(updateDoc(doc(clientOneDb, "agents/agent-client-1"), { name: "Updated Agent" }));
  await assertFails(updateDoc(doc(clientOneDb, "agents/agent-client-1"), { userId: "client-2" }));
  await assertFails(updateDoc(doc(clientOneDb, "agents/agent-client-1"), { tenantId: "tenant-victim" }));
  await assertFails(updateDoc(doc(clientOneDb, "agents/agent-client-1"), { workspaceId: "workspace-victim" }));
  await assertSucceeds(deleteDoc(doc(clientOneDb, "agents/client-created")));
  await assertFails(deleteDoc(doc(clientOneDb, "agents/agent-client-2")));

  // Outreach queue is admin-only.
  await assertFails(getDoc(doc(clientOneDb, "leads_outreach/outreach-1")));
  await assertFails(setDoc(doc(clientOneDb, "leads_outreach/client-write"), { userId: "client-1" }));
  await assertSucceeds(getDoc(doc(adminDb, "leads_outreach/outreach-1")));
  await assertSucceeds(setDoc(doc(adminDb, "leads_outreach/admin-write"), { userId: "client-1" }));

  // Collection-group queries must not bypass the default-deny policy for nested paths.
  for (const db of [anonymousDb, clientOneDb, adminDb]) {
    await assertFails(
      getDocs(query(collectionGroup(db, "private"), where("ownerId", "==", "client-1")))
    );
  }

  // Unmatched collections and nested subcollections must remain default-deny,
  // including for authenticated users and admins. New collections require an
  // explicit reviewed rule instead of inheriting accidental access.
  for (const db of [anonymousDb, clientOneDb, adminDb]) {
    await assertFails(getDoc(doc(db, "unregistered_collection/secret")));
    await assertFails(getDocs(collection(db, "unregistered_collection")));
    await assertFails(setDoc(doc(db, "unregistered_collection/client-write"), { userId: "client-1" }));
    await assertFails(getDoc(doc(db, "users/client-1/private/secret")));
  }

  console.log("Firestore Emulator rules tests passed: user-owned collections, server-only AEO/settings/chat collections, anonymous denial, and role/tenant spoofing checks.");
} finally {
  await testEnv.cleanup();
}
