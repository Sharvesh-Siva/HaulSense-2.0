/**
 * HaulSense - Transporter Operations Control Dashboard
 * Pixel-perfect implementation matching Screenshot 2:
 * - Header: "Transporter Operations Control", subtitle, "+ Create & Evaluate Load" button
 * - 4 Metric Cards:
 *   1. Active Loads (4 / 3 Open in Market)
 *   2. Available Vehicles (5/5 Total / Fleet ready for assignment)
 *   3. Pending Requests (1 / Review driver profiles)
 *   4. Projected Net Profit (₹41,738 / Across active evaluated shipments)
 * - Banner: "HaulSense Operational Intelligence", "Generate Dispatch Briefing" button
 *   3 Insight Cards: Route Economics (42.1% operating margin), Driver Match (Arun Kumar 92/100), Return Opportunity (+₹17,937 additional profit)
 * - Lower Section: Real-time decision queue with "Analyze Trip" connecting directly to HaulSense Agent Orchestrator.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Truck,
  Inbox,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { TARGET_SHIPMENTS, VEHICLES, DRIVERS } from '../data/mockData';
import { formatDateTime, formatINR } from '../utils';
import { ManagerGraphicalAnalytics } from '../components/ManagerGraphicalAnalytics';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [briefingGenerating, setBriefingGenerating] = useState(false);
  const [briefingGenerated, setBriefingGenerated] = useState(false);

  const handleGenerateBriefing = () => {
    setBriefingGenerating(true);
    setTimeout(() => {
      setBriefingGenerating(false);
      setBriefingGenerated(true);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Action Row matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white font-heading tracking-tight">
            Transporter Operations Control
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Logistics decision intelligence for Indian corridor freight management
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/manager/agent/S-GOLDEN')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs md:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-indigo-200" />
          <span>Create & Evaluate Load</span>
        </button>
      </div>

      {/* 4 Top KPI Cards matching Screenshot 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ACTIVE LOADS */}
        <div
          onClick={() => navigate('/manager/shipments')}
          className="bg-[#121824] border border-slate-800/90 rounded-2xl p-5 shadow-sm hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Active Loads
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-950/70 text-indigo-400 flex items-center justify-center border border-indigo-800/50">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-heading text-white">4</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>3 Open in Market</span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Card 2: AVAILABLE VEHICLES */}
        <div
          onClick={() => navigate('/manager/vehicles')}
          className="bg-[#121824] border border-slate-800/90 rounded-2xl p-5 shadow-sm hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Available Vehicles
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center border border-emerald-800/50">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-heading text-white">5</span>
            <span className="text-sm font-medium text-slate-400">/5 Total</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>Fleet ready for assignment</span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Card 3: PENDING REQUESTS */}
        <div
          onClick={() => navigate('/manager/drivers')}
          className="bg-[#121824] border border-slate-800/90 rounded-2xl p-5 shadow-sm hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/70 text-amber-400 flex items-center justify-center border border-amber-800/50">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-heading text-white">1</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>Review driver profiles</span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Card 4: PROJECTED NET PROFIT */}
        <div
          onClick={() => navigate('/manager/agent/S-GOLDEN')}
          className="bg-[#121824] border border-slate-800/90 rounded-2xl p-5 shadow-sm hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Projected Net Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center border border-emerald-800/50">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">₹41,738</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>Across active evaluated shipments</span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>

      {/* Graphical Demonstrations & Yield Modeling */}
      <ManagerGraphicalAnalytics />

      {/* Operational Intelligence Section matching Screenshot 2 */}
      <div className="bg-[#121824] border border-slate-800/90 rounded-2xl p-6 shadow-sm">
        {/* Section Header with Generate Dispatch Briefing button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                HaulSense Operational Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                Explainable recommendations based on corridor analytics & trust
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateBriefing}
            disabled={briefingGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            {briefingGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Corridor Data...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-indigo-200" />
                <span>Generate Dispatch Briefing</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Insight Panels matching Screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Panel 1: Route Economics */}
          <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-2">
              Route Economics
            </span>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              "Chennai → Bengaluru offers a <strong className="text-white font-bold">42.1% operating margin</strong>, exceeding your 15% target margin."
            </p>
          </div>

          {/* Panel 2: Driver Match */}
          <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-2">
              Driver Match
            </span>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              "<strong className="text-white font-bold">Ravi Kumar</strong> (Trust: <span className="text-indigo-400 font-mono font-bold">92/100</span>) is your strongest match with 10T capacity stationed in Chennai."
            </p>
          </div>

          {/* Panel 3: Return Opportunity */}
          <div className="bg-[#0B0F17]/90 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-2">
              Return Opportunity
            </span>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              "A potential Bengaluru → Chennai return load could generate <strong className="text-emerald-400 font-mono font-bold">+₹14,350</strong> additional profit."
            </p>
          </div>
        </div>
      </div>

      {/* Lower Section: Pending Hauls Queue */}
      <div className="bg-[#121824] border border-slate-800/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white font-heading">
              Pending Freight Dispatch Decisions ({TARGET_SHIPMENTS.length})
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated using HaulSense Autonomous Agent Orchestrator
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-1 rounded-full">
            Autonomous Evaluator Ready
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Shipment / Route</th>
                <th className="py-2.5 px-3">Cargo Spec</th>
                <th className="py-2.5 px-3">Offered Freight</th>
                <th className="py-2.5 px-3">Departure Time</th>
                <th className="py-2.5 px-3 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {TARGET_SHIPMENTS.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white font-heading">{s.origin} → {s.destination}</div>
                    <span className="text-[11px] font-mono text-slate-400">{s.id} • {s.distanceKm} km</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-300 capitalize">{s.weightTons}t {s.cargoType}</span>
                    {s.isHighValue && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50 font-bold uppercase">
                        High Value
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400 text-sm">
                    {formatINR(s.offeredFreight)}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    {formatDateTime(s.departureTime)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/manager/agent/${s.id}`)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                    >
                      <span>Analyze Trip</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-200" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
