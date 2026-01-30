
import { ExecutionLog, Project, Transaction, WorkflowResult } from '../types';

// Default Demo User ID
const CLIENT_ID = 'user-123';
const OTHER_ID = 'user-999';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'wf-001',
    userId: CLIENT_ID,
    name: 'Lead Enrichment V2',
    description: 'Enriches email leads with LinkedIn data and company info.',
    status: 'PUBLISHED',
    public_form_enabled: true,
    icon: 'Users',
    triggerConfig: [
      { id: 'email', label: 'Lead Email', type: 'email', required: true },
      { id: 'company', label: 'Company Name', type: 'text', required: false }
    ]
  },
  {
    id: 'wf-002',
    userId: CLIENT_ID,
    name: 'Invoice Generator',
    description: 'Generates PDF invoices from raw sales data inputs.',
    status: 'PUBLISHED',
    public_form_enabled: true,
    icon: 'FileText',
    triggerConfig: [
      { id: 'client_name', label: 'Client Name', type: 'text', required: true },
      { id: 'amount', label: 'Amount (USD)', type: 'number', required: true },
      { id: 'due_date', label: 'Due Date', type: 'date', required: true }
    ]
  },
  {
    id: 'wf-003',
    userId: OTHER_ID, // Should not be visible to CLIENT_ID
    name: 'Secret Admin Workflow',
    description: 'Internal system checks.',
    status: 'PUBLISHED',
    public_form_enabled: false,
    icon: 'Shield',
    triggerConfig: []
  }
];

export const MOCK_LOGS: ExecutionLog[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `log-${i}`,
  userId: i % 4 === 0 ? OTHER_ID : CLIENT_ID, // Mix of users
  workflowId: i % 2 === 0 ? 'wf-001' : 'wf-002',
  workflowName: i % 2 === 0 ? 'Lead Enrichment V2' : 'Invoice Generator',
  status: Math.random() > 0.1 ? 'SUCCESS' : 'ERROR',
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  usage: {
    tokens: Math.floor(Math.random() * 500) + 100,
    cost: (Math.floor(Math.random() * 500) + 100) * 0.0002,
    creditsCost: Math.random() > 0.1 ? Math.floor(Math.random() * 10) + 1 : 0 // 0 cost if failed usually
  }
}));

export const MOCK_RESULTS: WorkflowResult[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `res-${i}`,
  userId: i % 4 === 0 ? OTHER_ID : CLIENT_ID,
  date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  workflowName: i % 3 === 0 ? 'Lead Enrichment' : 'Invoice Gen',
  inputSummary: i % 3 === 0 ? 'john@doe.com' : 'Client: Acme Corp',
  outputResult: i % 3 === 0 ? 'Enriched: CEO at Tech...' : 'Invoice #INV-2024 generated',
  duration: `${(Math.random() * 2).toFixed(2)}s`,
  status: 'COMPLETED'
}));

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-101', userId: CLIENT_ID, date: '2024-05-01', amount: 49.00, status: 'PAID', description: 'Pro Plan - May', invoiceUrl: '#' },
  { id: 'tx-102', userId: CLIENT_ID, date: '2024-04-01', amount: 49.00, status: 'PAID', description: 'Pro Plan - April', invoiceUrl: '#' },
  { id: 'tx-103', userId: CLIENT_ID, date: '2024-03-01', amount: 49.00, status: 'PAID', description: 'Pro Plan - March', invoiceUrl: '#' },
  { id: 'tx-999', userId: OTHER_ID, date: '2024-05-01', amount: 999.00, status: 'PAID', description: 'Enterprise Plan', invoiceUrl: '#' },
];
