/**
 * HaulSense - Manager Operations Layout
 * Pixel-perfect match to Screenshot 2:
 * - Top header with Emblem, HaulSense wordmark, MVP 2026 chip, notification bell, settings, refresh, Manager/Driver toggle, and logout.
 * - Horizontal navigation bar: Operations Control, Corridor Loads, Driver Requests, Trip Lifecycle, Fleet & Trucks, Analytics Dashboards (7), Simulator, Fleet Profit.
 */

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Inbox,
  Send,
  Truck,
  LineChart,
  Sliders,
  TrendingUp,
  Bell,
  Settings,
  RotateCw,
  LogOut,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  X,
  MessageSquare,
} from 'lucide-react';
import { Emblem } from './Emblem';
import { useAuth } from '../context/AuthContext';
import { useLogistics } from '../context/LogisticsContext';
import { TripChatDrawer } from './TripChatDrawer';

export const ManagerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useLogistics();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const managerNotifs = notifications.filter(
    (n) => n.targetRole === 'manager' || n.targetRole === 'all'
  );
  const unreadCount = managerNotifs.filter((n) => !n.read).length;

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Operations Control', path: '/manager', icon: LayoutDashboard, end: true },
    { label: 'Corridor Loads', path: '/manager/shipments', icon: Layers },
    { label: 'Driver Requests', path: '/manager/drivers', icon: Inbox, badge: '1' },
    { label: 'Trip Lifecycle', path: '/manager/agent/S-GOLDEN', icon: Send },
    { label: 'Fleet & Trucks', path: '/manager/vehicles', icon: Truck },
    { label: 'Trip Comms (Chat)', path: '/manager/chat', icon: MessageSquare },
    { label: 'Analytics Dashboards (7)', path: '/manager/returns', icon: LineChart, hasDropdown: true },
    { label: 'Simulator', path: '/manager/agent/S-CASE-B', icon: Sliders },
    { label: 'Fleet Profit', path: '/manager/agent/S-GOLDEN', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F3F4F6] flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Operations Header (Matching Screenshot 2) */}
      <header className="bg-[#0E1420] border-b border-slate-800/80 px-4 md:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        {/* Brand Section */}
        <div className="flex items-center gap-3">
          <Emblem size={34} onClick={() => navigate('/manager')} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base tracking-tight text-white">
                HaulSense
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-semibold uppercase">
                MVP 2026
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
              Logistics Decision Intelligence
            </span>
          </div>
        </div>

        {/* Right utility toolbar matching Screenshot 2 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification bell with live badge and dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0D131F] border border-slate-700 shadow-2xl z-50 overflow-hidden text-xs">
                <div className="p-3 bg-[#121A29] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white font-heading">Dispatch Alerts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto p-2 space-y-2">
                  {managerNotifs.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">No active alerts</div>
                  ) : (
                    managerNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          n.read
                            ? 'bg-[#0E1522] border-slate-800/80 opacity-70'
                            : 'bg-[#141C2B] border-indigo-700/60 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white flex items-center gap-1.5 font-heading">
                            {n.type === 'mismatch_alert' || n.type === 'incident' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                            )}
                            {n.title}
                          </span>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          From {n.source.toUpperCase()} • {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Live Trip Dispatch Chat with Driver */}
          <button
            type="button"
            onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
            className={`p-1.5 rounded-lg transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              isChatDrawerOpen
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Live Corridor Chat with Driver (Ravi Kumar)"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline text-xs font-semibold text-slate-300">
              Trip Chat
            </span>
          </button>

          {/* Settings */}
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Reload Workspace"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Manager / Driver Pill Toggle */}
          <div className="bg-[#080C13] p-0.5 rounded-lg border border-slate-800 flex items-center text-xs">
            <button
              type="button"
              onClick={() => navigate('/manager')}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                location.pathname.startsWith('/manager')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => navigate('/driver')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                location.pathname.startsWith('/driver')
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
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

      {/* Horizontal Operational Tab Navigation Bar (Matching Screenshot 2) */}
      <nav className="bg-[#0E1420]/90 border-b border-slate-800 px-4 md:px-6 py-1.5 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-950/90 text-indigo-400 border border-indigo-800/80 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`
            }
          >
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-navy-950 font-mono text-[9px] font-bold flex items-center justify-center">
                {item.badge}
              </span>
            )}
            {item.hasDropdown && (
              <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* Floating / Slide-out Trip Dispatch Chat Drawer */}
      <TripChatDrawer
        tripId="S-GOLDEN"
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
      />
    </div>
  );
};
