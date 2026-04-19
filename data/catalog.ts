import { CatalogCategory, ServiceItem } from '../types';

export const MASTER_CATALOG: CatalogCategory[] = [
  {
    id: 'BM',
    title: 'Business & Marketing Automation',
    description: 'Automations built to capture leads, launch campaigns, and keep your growth systems moving without manual follow-up.',
    items: [
      {
        id: 1,
        name: "Lead Generation Automation",
        setupUSD: 1999,
        monthlyUSD: 499,
        badge: "Sales Automation",
        outcome: "Automates lead capture, enrichment, outreach, and CRM updates so your pipeline keeps moving.",
        actions: ["Lead sourcing and enrichment", "Personalized outreach triggers", "CRM sync and alert routing"],
        handles: "New lead data → qualify and enrich → CRM updated + team notified",
        integrations: "Smart AI CRM, Apollo, Clay, Gmail, Sheets",
        bestFor: "Agencies, consultants, B2B sales teams"
      },
      {
        id: 2,
        name: "Email Marketing Automation",
        setupUSD: 1299,
        monthlyUSD: 349,
        badge: "Marketing Automation",
        outcome: "Runs campaign sequences, follow-ups, and reporting without manual email management.",
        actions: ["Campaign and drip setup", "Behavior-based follow-ups", "Performance tracking and reporting"],
        handles: "Contact enters segment → email sequence starts → results tracked and optimized",
        integrations: "Mailchimp, Klaviyo, Smart AI CRM, ConvertKit, Gmail",
        bestFor: "Brands, consultants, growth teams, e-commerce"
      },
      {
        id: 3,
        name: "WhatsApp Chatbot Automation",
        setupUSD: 1799,
        monthlyUSD: 449,
        badge: "Messaging Automation",
        outcome: "Captures leads, answers routine questions, and routes conversations without manual reply delays.",
        actions: ["Instant response logic", "Lead qualification flows", "Booking and escalation routing"],
        handles: "Message received → auto qualify or answer → booking or handoff triggered",
        integrations: "WhatsApp, Twilio, CRM tools, calendars, forms",
        bestFor: "Local businesses, clinics, agencies, service teams"
      },
      {
        id: 4,
        name: "Social Media Auto Posting",
        setupUSD: 1099,
        monthlyUSD: 299,
        badge: "Content Automation",
        outcome: "Keeps your channels active with scheduled content, timing optimization, and basic engagement support.",
        actions: ["Post scheduling and publishing", "Caption and timing optimization", "Engagement response support"],
        handles: "Content approved → posts scheduled → activity tracked and logged",
        integrations: "Instagram, Facebook, LinkedIn, X, scheduling tools",
        bestFor: "Creators, agencies, personal brands, DTC brands"
      },
      {
        id: 5,
        name: "Ad Campaign Automation (FB/Google)",
        setupUSD: 2299,
        monthlyUSD: 599,
        badge: "Paid Growth Automation",
        outcome: "Automates campaign setup logic, performance monitoring, and low-performing ad response workflows.",
        actions: ["Campaign and audience setup", "Budget and rule monitoring", "Reporting and optimization alerts"],
        handles: "Campaign launched → performance monitored → budget or alert actions triggered",
        integrations: "Meta Ads, Google Ads, analytics tools, Sheets, CRM",
        bestFor: "Agencies, local businesses, lead gen teams, brands"
      }
    ]
  },
  {
    id: 'EC',
    title: 'E-commerce Automation',
    description: 'Automations built for stores that need smoother order handling, stock visibility, and customer recovery workflows.',
    items: [
      {
        id: 6,
        name: "Shopify Order Automation",
        setupUSD: 1499,
        monthlyUSD: 399,
        badge: "Commerce Automation",
        outcome: "Streamlines order processing, confirmations, and operational follow-up after every purchase.",
        actions: ["Order confirmation workflows", "Shipping and status updates", "Payment and fraud checks"],
        handles: "Order placed → fulfillment actions triggered → customer and ops updated",
        integrations: "Shopify, Stripe, ShipStation, email tools, inventory systems",
        bestFor: "Shopify stores, DTC brands, multi-order businesses"
      },
      {
        id: 7,
        name: "Inventory + Stock Sync",
        setupUSD: 1299,
        monthlyUSD: 349,
        badge: "Inventory Automation",
        outcome: "Keeps stock data aligned across systems and alerts your team before inventory problems grow.",
        actions: ["Real-time stock sync", "Low-stock alert triggers", "Reorder workflow support"],
        handles: "Stock changes → systems sync → reorder or alert action triggered",
        integrations: "Shopify, inventory tools, Sheets, supplier systems, ERP",
        bestFor: "Retail brands, e-commerce teams, product sellers"
      },
      {
        id: 8,
        name: "Customer Support Bot",
        setupUSD: 1899,
        monthlyUSD: 499,
        badge: "Support Automation",
        outcome: "Handles routine customer questions and routes complex support issues to the right place faster.",
        actions: ["FAQ and order response flows", "Refund and ticket routing", "Sentiment-based escalation support"],
        handles: "Support request arrives → bot handles or routes → case logged and updated",
        integrations: "Shopify, WhatsApp, Zendesk, Intercom, helpdesk tools",
        bestFor: "E-commerce brands, SaaS products, support teams"
      },
      {
        id: 9,
        name: "Abandoned Cart Recovery",
        setupUSD: 1099,
        monthlyUSD: 299,
        badge: "Revenue Recovery",
        outcome: "Recovers lost carts with timed reminders, offer logic, and re-engagement workflows.",
        actions: ["Cart reminder triggers", "Discount or offer logic", "Recovery tracking and reporting"],
        handles: "Cart abandoned → reminder sequence starts → recovery outcome tracked",
        integrations: "Shopify, Klaviyo, email tools, WhatsApp, Stripe",
        bestFor: "DTC brands, online stores, retention-focused teams"
      }
    ]
  },
  {
    id: 'AC',
    title: 'AI + Content Automation',
    description: 'Automations that help produce, package, and distribute content faster across blogs, social, audio, and short-form media.',
    items: [
      {
        id: 10,
        name: "AI Content Generator",
        setupUSD: 999,
        monthlyUSD: 299,
        badge: "Content Automation",
        outcome: "Speeds up content production with structured drafting, brand alignment, and publishing support.",
        actions: ["Draft generation workflows", "Brand voice alignment", "Content publishing support"],
        handles: "Topic added → content drafted → review and publish workflow triggered",
        integrations: "Notion, Google Docs, WordPress, CMS tools, SEO tools",
        bestFor: "Agencies, content teams, bloggers, founders"
      },
      {
        id: 11,
        name: "AI Video + Reel Creator",
        setupUSD: 2299,
        monthlyUSD: 599,
        badge: "Media Automation",
        outcome: "Turns scripts or content ideas into short-form video workflows ready for publishing.",
        actions: ["Script-to-video generation", "Captions and thumbnail prep", "Platform formatting support"],
        handles: "Script approved → media assets generated → export ready for posting",
        integrations: "Drive, video tools, social schedulers, media libraries",
        bestFor: "Creators, brands, agencies, short-form teams"
      },
      {
        id: 12,
        name: "AI Voiceover System",
        setupUSD: 899,
        monthlyUSD: 249,
        badge: "Audio Automation",
        outcome: "Produces ready-to-use voiceovers across languages and formats with less manual editing time.",
        actions: ["Text-to-speech generation", "Voice and tone selection", "Export and audio cleanup support"],
        handles: "Script submitted → voice generated → final audio exported",
        integrations: "Audio tools, video editors, storage platforms, publishing tools",
        bestFor: "Creators, course builders, video teams, brands"
      }
    ]
  },
  {
    id: 'PA',
    title: 'Productivity Automation',
    description: 'Internal systems that reduce admin work, improve coordination, and keep operations moving without repetitive manual effort.',
    items: [
      {
        id: 13,
        name: "CRM Automation (Smart AI CRM)",
        setupUSD: 1499,
        monthlyUSD: 399,
        badge: "CRM Automation",
        outcome: "Keeps your pipeline updated with automated follow-ups, assignments, and stage movement.",
        actions: ["Contact and pipeline sync", "Follow-up sequence triggers", "Task assignment and reporting"],
        handles: "Lead activity occurs → workflow runs → CRM, tasks, and reminders updated",
        integrations: "Smart AI CRM, Gmail, forms, calendars, Slack",
        bestFor: "Sales teams, agencies, consultants, B2B ops"
      },
      {
        id: 14,
        name: "Invoice + Billing Automation",
        setupUSD: 1099,
        monthlyUSD: 299,
        badge: "Finance Automation",
        outcome: "Reduces billing admin by automating invoices, reminders, and payment status workflows.",
        actions: ["Invoice generation and sending", "Reminder and overdue logic", "Payment tracking and reporting"],
        handles: "Invoice due → reminder workflow starts → payment status updated",
        integrations: "QuickBooks, Xero, Stripe, email tools, accounting platforms",
        bestFor: "Agencies, service providers, finance admin teams"
      },
      {
        id: 15,
        name: "HR + Hiring Automation",
        setupUSD: 1999,
        monthlyUSD: 499,
        badge: "HR Automation",
        outcome: "Streamlines repetitive hiring tasks so recruiting moves faster with less manual coordination.",
        actions: ["Resume intake and sorting", "Interview scheduling workflows", "Offer and onboarding support"],
        handles: "Application received → candidate routed → interview or onboarding step triggered",
        integrations: "ATS tools, Gmail, Calendar, forms, docs",
        bestFor: "Recruiters, agencies, HR teams, growing companies"
      }
    ]
  },
  {
    id: 'AD',
    title: 'Advanced 2026 Systems',
    description: 'Higher-value automations built for forecasting, voice operations, SEO execution, and decision-support workflows.',
    items: [
      {
        id: 16,
        name: "AI SEO Automation & Ranking Tracker",
        setupUSD: 1999,
        monthlyUSD: 499,
        badge: "Trending",
        outcome: "Automates ranking visibility, content opportunity tracking, and search performance reporting.",
        actions: ["Keyword and ranking tracking", "SEO issue monitoring", "Report and alert generation"],
        handles: "Rankings update → opportunities detected → reports and action items generated",
        integrations: "Google Search Console, Ahrefs, SEMrush, CMS tools",
        bestFor: "Publishers, agencies, SEO teams, content-led brands"
      },
      {
        id: 17,
        name: "AI Business Analytics & Predictive Dashboard",
        setupUSD: 1499,
        monthlyUSD: 399,
        badge: "Analytics System",
        outcome: "Gives decision-makers a clearer view of KPIs, anomalies, and future performance trends.",
        actions: ["Data aggregation and cleanup", "KPI and trend dashboarding", "Forecast and anomaly alerts"],
        handles: "Data pulled from sources → dashboard updates → insights and alerts delivered",
        integrations: "Sheets, Looker Studio, Smart AI CRM, Stripe, databases",
        bestFor: "Founders, operators, finance teams, growth leaders"
      },
      {
        id: 18,
        name: "Voice AI Receptionist & Call Automation",
        setupUSD: 2299,
        monthlyUSD: 599,
        badge: "High Demand",
        outcome: "Ensures incoming calls are answered, qualified, and routed without losing opportunities.",
        actions: ["Call answering and qualification", "Booking and routing logic", "Voicemail and CRM follow-up"],
        handles: "Call received → caller qualified → appointment or handoff triggered",
        integrations: "Twilio, Calendars, CRM tools, dialers, voicemail systems",
        bestFor: "Clinics, agencies, local businesses, appointment-driven teams"
      },
      {
        id: 19,
        name: "Agentic AI Sales Qualification & Pipeline Automation",
        setupUSD: 1999,
        monthlyUSD: 499,
        badge: "Pipeline Automation",
        outcome: "Moves leads through qualification and follow-up workflows with less manual sales coordination.",
        actions: ["Lead scoring and routing", "Outreach and meeting triggers", "Pipeline movement and reminders"],
        handles: "Lead enters system → qualification logic runs → next-step workflow triggered",
        integrations: "Smart AI CRM, Salesforce, Gmail, calendars, pipeline tools",
        bestFor: "B2B sales teams, agencies, consultants, closers"
      },
      {
        id: 20,
        name: "Predictive Demand & Inventory Forecasting",
        setupUSD: 1299,
        monthlyUSD: 349,
        badge: "Forecasting System",
        outcome: "Helps teams prepare for demand shifts with smarter inventory planning and reorder visibility.",
        actions: ["Sales and demand forecasting", "Reorder threshold monitoring", "Seasonal trend alerting"],
        handles: "Sales data updates → forecast recalculated → reorder signals triggered",
        integrations: "Shopify, ERP, Sheets, inventory systems, supplier tools",
        bestFor: "Retail brands, e-commerce ops, inventory teams"
      }
    ]
  }
];

export const AI_AGENTS_CATALOG: ServiceItem[] = [
  { 
    id: 401, 
    name: "AI Lead Generation Agent", 
    setupUSD: 2499, 
    monthlyUSD: 599, 
    badge: "Sales Agent",
    outcome: "Finds, qualifies, and routes ready-to-contact prospects into your pipeline automatically.",
    actions: ["Lead sourcing and enrichment", "Personalized outreach sequences", "CRM sync with hot-lead alerts"],
    handles: "outbound prospecting, lead scoring, and pipeline entry",
    integrations: "Smart AI CRM, Apollo, Clay, Gmail, LinkedIn data tools",
    bestFor: "agencies, consultants, B2B SaaS, service sales teams"
  },
  { 
    id: 402, 
    name: "AI Customer Support Agent", 
    setupUSD: 2799, 
    monthlyUSD: 699, 
    badge: "Support Agent",
    outcome: "Handles customer questions, common issues, and ticket routing without slowing your team down.",
    actions: ["FAQ and order query handling", "Refund and complaint routing", "Conversation logging and escalation"],
    handles: "first-line support across chat, messages, and routine service requests",
    integrations: "Zendesk, Intercom, Shopify, WhatsApp, helpdesk tools",
    bestFor: "e-commerce brands, SaaS products, support teams"
  },
  { 
    id: 403, 
    name: "Voice AI Sales Agent", 
    setupUSD: 3499, 
    monthlyUSD: 799, 
    badge: "🔥 High Demand",
    outcome: "Answers, qualifies, and converts inbound or outbound calls into booked opportunities.",
    actions: ["Real-time voice qualification", "Appointment booking and sync", "Post-call CRM updates"],
    handles: "sales calls, objection handling, and booking workflows",
    integrations: "Twilio, Smart AI CRM, Google Calendar, Salesforce, dialer tools",
    bestFor: "clinics, agencies, local businesses, high-volume sales teams"
  },
  { 
    id: 404, 
    name: "AI Email Marketing Agent", 
    setupUSD: 1999, 
    monthlyUSD: 499, 
    badge: "Marketing Agent",
    outcome: "Runs smarter email campaigns with less manual writing, testing, and follow-up work.",
    actions: ["Campaign and sequence drafting", "A/B test optimization", "Performance tracking and reporting"],
    handles: "drip flows, campaign launches, and response-based follow-up logic",
    integrations: "Mailchimp, Klaviyo, Smart AI CRM, Gmail, ConvertKit",
    bestFor: "brands, e-commerce, consultants, growth teams"
  },
  { 
    id: 405, 
    name: "Social Media Growth Agent", 
    setupUSD: 1699, 
    monthlyUSD: 399, 
    badge: "Growth Agent",
    outcome: "Keeps your social channels active with AI-assisted posting, replies, and engagement flow support.",
    actions: ["Content generation and scheduling", "Caption and hashtag optimization", "Engagement tracking and response support"],
    handles: "day-to-day posting workflows and audience engagement assistance",
    integrations: "Instagram, Facebook, LinkedIn, X, scheduling platforms",
    bestFor: "creators, agencies, personal brands, DTC businesses"
  },
  { 
    id: 406, 
    name: "E-commerce Sales Agent", 
    setupUSD: 2999, 
    monthlyUSD: 699, 
    badge: "Commerce Agent",
    outcome: "Increases order value and reduces lost revenue through automated sales and cart actions.",
    actions: ["Product recommendation logic", "Upsell and cross-sell triggers", "Cart recovery and sales insights"],
    handles: "on-site conversion flows, checkout recovery, and purchase support",
    integrations: "Shopify, WooCommerce, Stripe, Klaviyo, WhatsApp",
    bestFor: "DTC brands, online stores, multi-product sellers"
  },
  { 
    id: 407, 
    name: "AI Business Analytics Agent", 
    setupUSD: 2199, 
    monthlyUSD: 499, 
    badge: "Analytics Agent",
    outcome: "Turns disconnected business data into clear KPI visibility, trend analysis, and decision-ready reports.",
    actions: ["Cross-platform data collection", "KPI dashboard generation", "Forecasting and anomaly alerts"],
    handles: "reporting, trend monitoring, and performance summaries",
    integrations: "Google Sheets, Looker Studio, Smart AI CRM, Stripe, databases",
    bestFor: "founders, operators, finance teams, growth managers"
  },
  { 
    id: 408, 
    name: "AI Content Creation Agent", 
    setupUSD: 1499, 
    monthlyUSD: 349, 
    badge: "Content Agent",
    outcome: "Produces content assets faster while keeping messaging aligned with your brand and growth goals.",
    actions: ["Blog and content draft generation", "SEO-aligned content planning", "Publishing workflow support"],
    handles: "written content production, calendar support, and brand-aligned output",
    integrations: "Notion, WordPress, Google Docs, CMS tools, SEO tools",
    bestFor: "content teams, SEO teams, agencies, founders"
  },
  { 
    id: 409, 
    name: "AI Sales Closing Agent", 
    setupUSD: 2999, 
    monthlyUSD: 699, 
    badge: "Closing Agent",
    outcome: "Moves qualified opportunities toward conversion with structured follow-up and deal progression support.",
    actions: ["Lead qualification checks", "Meeting and follow-up automation", "Deal risk monitoring"],
    handles: "pipeline movement, closing support, and next-step coordination",
    integrations: "Smart AI CRM, Salesforce, Gmail, Calendar, pipeline tools",
    bestFor: "B2B sales teams, agencies, service businesses"
  },
  { 
    id: 410, 
    name: "AI Personal Business Agent", 
    setupUSD: 4999, 
    monthlyUSD: 1199, 
    badge: "🔥 Premium",
    outcome: "Acts as a high-level digital operator that helps manage tasks, priorities, and business visibility.",
    actions: ["Daily task and priority coordination", "Executive summaries and reminders", "Cross-function insight support"],
    handles: "business assistance, scheduling, summaries, and action tracking",
    integrations: "Gmail, Calendar, Notion, Slack, CRM tools",
    bestFor: "founders, executives, solo operators, small business owners"
  },
  { 
    id: 411, 
    name: "AI HR Recruitment Agent", 
    setupUSD: 2499, 
    monthlyUSD: 599, 
    badge: "HR Agent",
    outcome: "Speeds up hiring by filtering candidates, organizing interviews, and reducing repetitive recruiting work.",
    actions: ["Resume screening and ranking", "Candidate matching and tracking", "Interview scheduling support"],
    handles: "recruiting intake, shortlist management, and hiring coordination",
    integrations: "ATS tools, Google Calendar, Gmail, HR forms, docs",
    bestFor: "recruiters, agencies, hiring teams, growing companies"
  },
  { 
    id: 412, 
    name: "AI Finance & Invoice Agent", 
    setupUSD: 2199, 
    monthlyUSD: 499, 
    badge: "Finance Agent",
    outcome: "Automates invoicing, reminders, and finance visibility so your team spends less time chasing payments.",
    actions: ["Invoice generation and dispatch", "Payment reminder automation", "Cash-flow and expense tracking support"],
    handles: "billing operations, collections follow-up, and finance admin visibility",
    integrations: "QuickBooks, Xero, Stripe, email tools, accounting systems",
    bestFor: "agencies, service businesses, finance ops, operators"
  },
  { 
    id: 413, 
    name: "AI Supply Chain Optimization Agent", 
    setupUSD: 2799, 
    monthlyUSD: 699, 
    badge: "Operations Agent",
    outcome: "Helps reduce stock issues, supplier delays, and inventory inefficiencies across operational workflows.",
    actions: ["Inventory tracking and alerts", "Reorder and supplier triggers", "Delay and demand monitoring"],
    handles: "supply visibility, stock coordination, and operational alerts",
    integrations: "ERP tools, Shopify, inventory systems, Sheets, supplier data tools",
    bestFor: "retail brands, e-commerce operations, product-based businesses"
  },
  { 
    id: 414, 
    name: "AI Compliance & Risk Agent", 
    setupUSD: 2999, 
    monthlyUSD: 699, 
    badge: "🔥 High Value",
    outcome: "Flags compliance issues, policy risks, and review points before they become operational problems.",
    actions: ["Policy and contract checks", "Risk scoring and alerting", "Audit-ready reporting support"],
    handles: "compliance reviews, documentation checks, and risk workflows",
    integrations: "document systems, internal policy docs, legal workflows, reporting tools",
    bestFor: "healthcare, finance, legal, regulated businesses"
  },
  { 
    id: 415, 
    name: "AI Personalized Marketing Agent", 
    setupUSD: 2499, 
    monthlyUSD: 599, 
    badge: "Personalization Agent",
    outcome: "Delivers more targeted campaigns using customer behavior, segmentation, and dynamic messaging logic.",
    actions: ["Audience segmentation", "Behavior-based messaging", "Conversion-focused offer targeting"],
    handles: "personalized campaign logic and customer-level targeting flows",
    integrations: "Klaviyo, Meta Ads, Smart AI CRM, CRM tools, analytics platforms",
    bestFor: "brands, retention teams, growth marketers, e-commerce"
  },
  { 
    id: 416, 
    name: "AI Fraud Detection Agent", 
    setupUSD: 2799, 
    monthlyUSD: 699, 
    badge: "Security Agent",
    outcome: "Monitors suspicious activity patterns and flags risky events before they become costly issues.",
    actions: ["Transaction anomaly detection", "Alert and escalation routing", "Risk event monitoring"],
    handles: "fraud signals, suspicious pattern checks, and alert workflows",
    integrations: "payment systems, internal dashboards, reporting tools, finance platforms",
    bestFor: "finance teams, e-commerce, payment-driven businesses"
  },
  { 
    id: 417, 
    name: "AI Meeting & Calendar Agent", 
    setupUSD: 1999, 
    monthlyUSD: 499, 
    badge: "Productivity Agent",
    outcome: "Keeps meetings organized with scheduling, summaries, action items, and follow-up support.",
    actions: ["Calendar coordination", "Meeting transcription and summary", "Action-item extraction and routing"],
    handles: "meeting admin, scheduling conflicts, and next-step follow-up",
    integrations: "Zoom, Google Calendar, Teams, Notion, Slack",
    bestFor: "founders, managers, operations teams, agencies"
  },
  { 
    id: 418, 
    name: "AI SEO & Ranking Agent", 
    setupUSD: 2499, 
    monthlyUSD: 599, 
    badge: "🔥 Trending",
    outcome: "Improves organic visibility with ranking insights, optimization support, and search-focused execution.",
    actions: ["Keyword and content opportunity tracking", "On-page optimization support", "Ranking and competitor monitoring"],
    handles: "SEO workflow support, content alignment, and visibility tracking",
    integrations: "Google Search Console, Ahrefs, SEMrush, CMS tools",
    bestFor: "publishers, agencies, content-led brands, SEO teams"
  },
  { 
    id: 419, 
    name: "AI Customer Retention Agent", 
    setupUSD: 2199, 
    monthlyUSD: 499, 
    badge: "Retention Agent",
    outcome: "Helps reduce churn by identifying risk signals and triggering win-back or loyalty workflows automatically.",
    actions: ["Churn signal monitoring", "Re-engagement sequence triggers", "Loyalty and retention logic"],
    handles: "retention campaigns, win-back flows, and customer recovery support",
    integrations: "CRM tools, email platforms, Shopify, analytics tools, WhatsApp",
    bestFor: "subscription brands, SaaS, customer success teams, DTC brands"
  },
  { 
    id: 420, 
    name: "AI Multi-Agent Orchestrator", 
    setupUSD: 5499, 
    monthlyUSD: 1299, 
    badge: "🔥 Ultimate",
    outcome: "Coordinates multiple AI systems across departments so workflows stay connected, visible, and scalable.",
    actions: ["Cross-agent task delegation", "Unified decision routing", "Company-wide workflow coordination"],
    handles: "orchestration, multi-step execution, and system-level oversight",
    integrations: "CRM, support, finance, content, analytics, workflow platforms",
    bestFor: "scaling companies, multi-team operations, advanced AI deployments"
  }
];

export const BUNDLE_CATALOG: ServiceItem[] = [
  { 
    id: 301, 
    name: "Basic Package (Chat Assistant)", 
    setupUSD: 599, 
    monthlyUSD: 199, 
    badge: "Start with AI",
    description: "Start with OpenClaw. Automate customer support, email drafts, and lead qualification with Gemini 2.0 Flash." 
  },
  { 
    id: 302, 
    name: "Advanced Package (Business Pro)", 
    setupUSD: 799, 
    monthlyUSD: 299, 
    badge: "Train your AI",
    description: "OpenClaw + ChromaDB. Let AI remember PDFs, integrate with Slack/WhatsApp, and track real-time tokens." 
  },
  { 
    id: 303, 
    name: "Full Automation (The AI Employee)", 
    setupUSD: 1299, 
    monthlyUSD: 499, 
    badge: "Replace Manual Work",
    description: "Paperclip Browser Automation + CRM Auto-Login. End-to-end execution on a high-performance VPS." 
  }
];
