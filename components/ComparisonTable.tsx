
import React from 'react';
import { Check, X, Shield, Zap, Target, HeartHandshake } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
    const data = [
        { feature: 'Setup & Implementation', quickkit: 'Done-for-you (3 Days)', others: 'You do everything', highlight: true },
        { feature: 'Core AI Agents', quickkit: 'Native Neural Agents', others: 'Basic API Scripts', highlight: false },
        { feature: 'Maintenance Cost', quickkit: 'Clearly scoped pricing', others: 'Pricing varies by provider and scope', highlight: true },
        { feature: 'Custom Logic Integration', quickkit: 'Infinite (Private VPS)', others: 'Limited by platform', highlight: false },
        { feature: 'Dedicated Support', quickkit: 'Architect Support', others: 'Ticket bot', highlight: false },
    ];

    return (
        <section id="comparison" className="py-24 bg-nexus-dark relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-blue-600/5 blur-[120px] rounded-full"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Superior Engineering</h2>
                    <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        Why high-growth teams <br/>
                        choose¶»§q«^