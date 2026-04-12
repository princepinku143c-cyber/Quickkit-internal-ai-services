
export type UserRole = 'client' | 'admin';

export interface ClientSettings {
  contactEmail: string;
  slackWebhook: string;
  notificationPhone: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  // Wallet System
  credits: number;
  monthlyLimit: number;
  tier: 'FREE' | 'PRO' | 'BUSINESS';
  currentBusinessId?: string;
  // Config Bridge
  settings?: ClientSettings;
}

export interface TriggerRequest {
  id: string;
  projectId: string;
  projectName: string;
  userId: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  cost: number;
}

export interface Project {
  id: string;
  userId: string; // Multi-tenancy: Owner of this project
  name: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT';
  public_form_enabled: boolean;
  triggerConfig: FormField[];
  icon: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'date';
  options?: string[]; // for select
  required?: boolean;
}

export interface ExecutionLog {
  id: string;
  userId: string; // Multi-tenancy: Data Separation
  workflowId: string;
  workflowName: string;
  status: 'SUCCESS' | 'ERROR' | 'RUNNING';
  timestamp: string; // ISO string
  usage: {
    tokens: number;
    cost: number; // Legacy monetary cost
    creditsCost: number; // New Wallet System Cost
  };
}

export interface WorkflowResult {
  id: string;
  userId: string; // Multi-tenancy
  date: string;
  workflowName: string;
  inputSummary: string;
  outputResult: string;
  duration: string;
  status: 'COMPLETED' | 'FAILED';
}

export interface Transaction {
  id: string;
  userId: string; // Multi-tenancy
  date: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
  description: string;
  invoiceUrl: string;
}

export interface DashboardStats {
  successRate: number;
  totalProcessed: number;
  totalCost: number;
  systemHealth: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
}

export type Language = 'en' | 'hi';

export enum PlanTier {
  STARTER = 'Starter',
  PRO = 'Pro',
  BUSINESS = 'Business'
}

export type Currency = 'INR' | 'USD';

export interface CalculationResult {
  dailySavedHours: number;
  monthlySavedHours: number;
  monthlySavedMoney: number;
  recommendedPlan: PlanTier;
  setupCost: number;
  monthlyFee: number;
  paybackMonths: number;
}

// NEW: Isolated AI Quote Structure
export interface AIQuote {
  setupCost: number;
  monthlyCost: number;
  roiEstimate: number;
  buildTime: string;
  generatedAt: string;
  isCustomEstimate?: boolean;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'WON' | 'LOST';

export interface LeadSubmission {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessType: string;
  plan: string;
  submittedAt: string;
  notes?: string;
  // Optional Quote Data attached to lead
  aiQuote?: AIQuote;
  status?: LeadStatus; // CRM Status
}

export interface ServiceItem {
  id: number;
  name: string;
  setupUSD: number;
  monthlyUSD: number;
  categoryId?: string;
  description?: string;
  badge?: string;
  outcome?: string;
  actions?: string[];
  handles?: string;
  integrations?: string;
  bestFor?: string;
}

export interface CatalogCategory {
  id: string;
  title: string;
  description?: string;
  items: ServiceItem[];
}
