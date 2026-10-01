/**
 * HaulSense - Driver Workspace Shell & Navigation Layout
 * Provides persistent operations header, driver status toggle, Trust Passport pill,
 * and comprehensive horizontal sub-navigation for the 10 Driver features:
 * - Overview
 * - My Trips
 * - My Vehicles
 * - Vehicle Matching
 * - Load Opportunities
 * - Earnings
 * - Trust Passport
 * - Vehicle Health
 * - Documents
 * - Driver Assist (AI)
 */

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Truck,
  Layers,
  Sparkles,
  ShieldCheck,
  IndianRupee,
  Activity,
  FileText,
  Clock,
  Compass,
  LogOut,
  Bell,
  RotateCw,
  Sliders,
  Send,
  User,
  MessageSquare,
} from 'lucide-react';
import { Emblem } from '../../components/Emblem';
import { useAuth } from '../../context/AuthContext';
import { useLogistics } from '../../context/LogisticsContext';
import { DriverAssistModal } from './DriverAssistModal';
import { DriverNotificationsModal } from './DriverNotificationsModal';
import { DriverProfileModal } from './DriverProfileModal';
import { TripChatDrawer } from '../../components/TripChatDrawer';

export const DriverLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { drivers, notifications, updateDriverAvailability } = useLogistics();
  const navigate = useNavigate();
  const location = useLocation();

  const currentDriver = drivers.find((d) => d.id === user?.driverId) || drivers[0];
  const [isAssistOpen, setIsAssistOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const unreadNotifs = notifications.filter(
    (n) => (n.targetRole === 'driver' || n.targetRole === 'all') && !n.read
  ).length;

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', path: '/driver', icon: Compass, end: true },
    { label: 'My Trips', path: '/driver/trips', icon: Send },
    { label: 'Dispatch Chat', path: '/driver/chat', icon: MessageSquare },
    { label: 'My Vehicles', path: '/driver/vehicles', icon: Truck },
    { label: 'Vehicle Matching', path: '/driver/matching', icon: Sliders },
    { label: 'Load Opportunities', path: '/driver/loads', icon: Layers },
    { label: 'Earnings', path: '/driver/earnings', icon: IndianRupee },
    { label: 'Trust Passport', path: '/driver/trust', icon: ShieldCheck },
    { label: 'Vehicle Health', path: '/driver/health', icon: Activity },
    { label: 'Documents', path: '/driver/documents', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F3F4F6] flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Operations Header */}
      <header className="bg-[#0E1420] border-b border-slate-800/80 px-4 md:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        {/* Brand & Driver Identity */}
        <div className="flex items-center gap-3">
          <Emblem size={34} onClick={() => navigate('/driver')} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base tracking-tight text-white">
                HaulSense
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/70 font-bold uppercase tracking-wider">
                Driver Portal
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="text-[10px] text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1 hover:text-emerald-400 transition-colors text-left"
            >
              <span>{currentDriver.name}</span>
              <span className="text-slate-600">•</span>
              <span>Trust {currentDriver.reliabilityScore}/100</span>
            </button>
          </div>
        </div>

        {/* Right utility toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Availability Status Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#080C13] px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                currentDriver.status === 'available'
                  ? 'bg-emerald-400 animate-pulse'
                  : currentDriver.status === 'on_trip'
                  ? 'bg-blue-400'
                  : 'bg-amber-400'
              }`}
            />
            <select
              value={currentDriver.status}
              onChange={(e) => updateDriverAvailability(currentDriver.id, e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer font-mono"
            >
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="available_after_delivery">Available After Delivery</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          {/* Live Dispatch Comms Chat */}
          <button
            type="button"
            onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
            className={`p-1.5 rounded-xl transition-all relative cursor-pointer flex items-center gap-1.5 ${
              isChatDrawerOpen
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Live Dispatch Comms with Manager (Karthik S)"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline text-xs font-semibold text-slate-300">
              Dispatch Chat
            </span>
          </button>

          {/* AI Driver Assist Button */}
          <button
            type="button"
            onClick={() => setIsAssistOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden md:inline">Driver Assist</span>
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Dispatch Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-[#070A0F] font-bold text-[9px] rounded-full flex items-center justify-center font-mono animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Profile / Preferences */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Profile & Preferences"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Manager / Driver Toggle */}
          <div className="bg-[#080C13] p-0.5 rounded-lg border border-slate-800 flex items-center text-xs">
            <button
              type="button"
              onClick={() => navigate('/manager')}
              className="px-3 py-1 rounded-md font-medium text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => navigate('/driver')}
              className="px-3 py-1 rounded-md font-bold bg-emerald-600 text-white shadow-sm transition-all cursor-pointer"
            >
              Driver
            </button>
          </div>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Horizontal Driver Sub-Navigation Bar */}
      <nav className="bg-[#0E1420]/90 border-b border-slate-800 px-4 md:px-6 py-1.5 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`
            }
          >
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main View Outlet */}
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* AI Driver Assist Modal */}
      {isAssistOpen && (
        <DriverAssistModal onClose={() => setIsAssistOpen(false)} driver={currentDriver} />
      )}

      {/* Notifications Modal */}
      {isNotifOpen && (
        <DriverNotificationsModal onClose={() => setIsNotifOpen(false)} />
      )}

      {/* Profile & Preferences Modal */}
      {isProfileOpen && (
        <DriverProfileModal onClose={() => setIsProfileOpen(false)} driver={currentDriver} />
      )}

      {/* Floating / Slide-out Dispatch Chat Drawer */}
      <TripChatDrawer
        tripId="S-GOLDEN"
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
      />
    </div>
  );
};
