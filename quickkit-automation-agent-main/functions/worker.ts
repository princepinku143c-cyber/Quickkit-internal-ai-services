/**
 * NEXUS STREAM - BACKEND WORKER (Firebase Cloud Functions)
 *
 * The real DAG executor is not implemented or registered in Firebase yet.
 * Until it exists, this trigger must fail queued cloud runs explicitly rather
 * than simulate node execution and report a false COMPLETED state.
 *
 * DEPLOYMENT IS NOT CONFIGURED:
 * - quickkit-automation-agent-main/firebase.json has no Functions target.
 * - This file is not a registered Functions entry point.
 * - Do not deploy it as a production worker until a real, tested DAG executor
 *   and its least-privilege service configuration are supplied.
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import axios from 'axios';

if (!getApps().length) initializeApp();
const db = getFirestore();

interface ExecutionState {
    status?: string;
}

// Fail closed while the actual graph executor is unavailable. A queued run
// must never be marked COMPLETED by a placeholder or simulated worker.
export const onWorkflowTrigger = onDocumentCreated('active_runs/{runId}', async (event) => {
    const snap = event.data;
    if (!snap) return;

    const state = snap.data() as ExecutionState;
    if (state.status !== 'QUEUED') return;

    await snap.ref.update({
        status: 'FAILED',
        errorCode: 'CLOUD_WORKER_NOT_IMPLEMENTED',
        errorMessage: 'Cloud workflow execution is unavailable until a real DAG executor is configured.',
        lastUpdateTime: Date.now(),
    });

    console.warn('[Worker] Refused to simulate cloud execution; real DAG executor is not configured.');
});

// This poller is also a placeholder. Do not deploy it until URL allowlisting,
// tenant authorization, response limits, and awaited/concurrency-bounded work
// are implemented and covered by tests.
export const universalPoller = onSchedule('every 1 minutes', async () => {
    const activePollers = await db.collection('pollers').where('status', '==', 'active').get();

    await Promise.all(activePollers.docs.map(async (doc) => {
        const config = doc.data();
        try {
            const res = await axios.get(config.url);
            console.log('[Poller] Placeholder check completed with status:', res.status);
        } catch {
            console.error('[Poller] Placeholder check failed for record:', doc.id);
        }
    }));
});
