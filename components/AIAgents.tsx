import React from 'react';
import { ArrowRight, BarChart3, CalendarCheck, FileText, Globe2, MapPinned, MessageCircle, RefreshCw, ShieldCheck, Target, ThumbsUp, UserSearch, UsersRound } from 'lucide-react';

interface AIAgentsProps { onSelectAgent: (item:any)=>void; }

const AGENTS = [
  {id:'agent-1',icon:MessageCircle,color:'blue',title:'WhatsApp Lead Qualification',desc:'Inbound qualifier and appointment booker that works in WhatsApp voice notes + text, designed around the first-contact moment.',tasks:['Response target defined per signed scope','Voice note + text','Qualification','Appointment booking']},
  {id:'agent-2',icon:UserSearch,color:'purple',title:'Apify B2B Lead Prospector + Competitor Intelligence',desc:'Builds targeted prospect lists, checks public business/ad signals and turns research into executive-ready dossiers, with a max 50-prospect/day throttle.',tasks:['Google Maps prospecting','Meta Ad Library monitoring','Executive dossiers','50/day throttle']},
  {id:'agent-3',icon:ShieldCheck,color:'emerald',title:'CRM Sentinel + No-Show Guard',desc:'Protects the booking pipeline with calendar locking, GPS reminders and proof-oriented appointment handling.',tasks:['Calendar slot lock','2h location reminder','Maps + transport link','No-show workflow']},
  {id:'agent-4',icon:RefreshCw,color:'amber',title:'Dead Lead Reviver',desc:'Re-engages dormant databases with short conversational hooks and routes responses back into the sales workflow.',tasks:['6+ month dormant le¶»§q«^