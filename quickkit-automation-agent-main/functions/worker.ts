/**
 * NEXUS STREAM - BACKEND WORKER (Firebase Cloud Functions)
 *
 * The real DAG executor and safe polling service are not implemented or
 * registered in Firebase yet. Until they exist, these triggers fail closed:
 * queued cloud runs are marked FAILED instead of receiving fake success, and
 * the poller performs no outbound network requests.
 *
 * Deployment is not configured in quickkit-automation-agent-main/firebase.json.
 * Do not register/deploy this file as a production worker until a real DAG
 * executor, tenant-scoped polling, URL allowlisting, response limits, and
 * regression tests are implemented.
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

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

// Disabled until tenant authorization, URL allowlisting, response limits,
// and concurrency-safe polling are implemented and tested.
export const universalPoller = onSchedule('every 1 minutes', async () => {
    console.warn('[Poller] Disabled: secure tenant-scoped polling is not implemented.');
});
