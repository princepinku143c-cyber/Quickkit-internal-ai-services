import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { app, auth, isFirebaseConfigured } from './lib/firebaseCore';
import { generateSessionId } from './lib/utils';
import { Language, UserProfile, ServiceItem, AIQuote, PlanTier } from './types';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { QrCode, MessageCircle } from 'lucide-react';
import { IndustryProvider } from './lib/IndustryContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { IntegrationMarquee } from './components/IntegrationMarquee';
import { GlobalLoader } from './components/GlobalLoader';
import { SystemWorkflow } from './components/SystemWorkflow';
import { AdCampaignSection } from './components/AdCampaignSection';
import { WHATSAPP_DIRECT_URL, WHATSAPP_QR_ASSET, WHATSAPP_USERNAME } from './constants';

const LeadForm = lazy(() => import('./components/LeadForm').then(m => ({ default: m.LeadForm })));
const PremiumLanding = lazy(() => import('./components/PremiumLanding').then(m => ({ default: m.PremiumLanding })));
const Pricing = lazy(() => import('./components/Pricing').then(m => ({ default: m.Pricing })));
const WhyQuickKit = lazy(() => import('./components/WhyQuickKit').then(m => ({ default: m.WhyQuickKit })));
const WhoIsItFor = lazy(() => import('./components/WhoIsItFor').then(m => ({ default¶»§q«^