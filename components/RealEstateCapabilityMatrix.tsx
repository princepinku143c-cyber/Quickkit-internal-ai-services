import React from 'react';
import { ArrowRight, CheckCircle2, CircleHelp, FileText, LockKeyhole, Plug, ShieldCheck, XCircle } from 'lucide-react';

const VERIFIED = ['VERIFIED', 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'];
const CUSTOM = ['CUSTOM / CONDITIONAL', 'bg-amber-500/10 text-amber-300 border-amber-500/20'];
const NOT_FOUND = ['NOT PUBLICLY VERIFIED', 'bg-slate-800 text-slate-400 border-slate-700'];

type StatusRow = { item: string; status: typeof VERIFIED | typeof CUSTOM | typeof NOT_FOUND; note: string };

const rows: StatusRow[] = [
  { item: 'Website / landing-page lead intake', status: VERIFIED, note: 'Public website has a business lead form that posts to the lead-submit backend.' },
  { item: 'Generic API / webhook lead intake', status: VERIFIED, note: 'Backend includes /api/webhook; account-level client_id/uid verification is required.' },
  { item: 'Facebook / Instagram Ads', status: CUSTOM, note: 'Meta Ads is listed in the internal automation catalog; a real-estate production connection is not publicly demonstrated.' },
  { item: 'Google Ads / Lead Forms', status: CUSTOM, note: 'Google Ads is listed as an available automation integration; account connection and field mapping are project-specific.' },
  { item: '99acres / Magicbricks / Housing.com', status: NOT_FOUND, note: 'No public proof of a live portal-specific connector was found.' },
  { item: 'Automatic CRM lead creation', status: VERIFIED, note: 'Odoo CRM sync exists in the backend for¶»§q«^