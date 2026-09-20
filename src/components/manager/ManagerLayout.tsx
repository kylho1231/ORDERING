import React, { useState } from 'react';
import { LayoutDashboard, ClipboardList, PlusCircle, Utensils, MoreHorizontal, Volume2, VolumeX, LogOut, ArrowLeft, BarChart3, Settings, Bell, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { OfflineIndicator } from '../common/OfflineIndicator';
import { notify } from '../../utils/alert';

export type ManagerTab = 'DASHBOARD' | 'ORDERS' | 'WALK_IN' | 'MENU' | 'REPORTS' | 'SETTINGS';

interface Props {
  activeTab: ManagerTab;
  onTabChange: (tab: ManagerTab) => void;
  children: React.ReactNode;
  onSwitchToCustomer: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  newOrderAlert: Order | null;
  onDismissAlert: () => void;
  pendingCount: number;
  onOpenAiChat?: () => void;
}

export const ManagerLayout: React.FC<Props> = ({
  activeTab,
  onTabChange,
  children,
  onSwitchToCustomer,
  soundEnabled,
  onToggleSound,
  newOrderAlert,
  onDismissAlert,
  pendingCount,
  onOpenAiChat,
}) => {
  const { logout, role, switchRole } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleRoleToggle = (newRole: 'admin' | 'manager') => {
    switchRole(newRole);
    notify.toast(
      newRole === 'admin'
        ? 'Switched to Admin mode: You can add menus and upload food pictures'
        : 'Switched to Manager mode: You can set and update prices'
    );
  };

  const handleLogout = async () => {
    const confirmed = await notify.confirm({
      title: 'Log out?',
      text: 'Are you sure you want to lock the manager portal?',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Stay logged in',
    });
    if (confirmed) {
      logout();
      notify.toast('Logged out of manager portal', 'info');
    }
  };

  const handleSelectMoreTab = (tab: ManagerTab) => {
    onTabChange(tab);
    setShowMoreMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f2eb] text-stone-900 font-sans pb-20">
      <OfflineIndicator />

      {/* Floating Alert Banner when a new order arrives */}
      {newOrderAlert && (
        <div
          id="new-order-toast"
          className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 rounded-2xl bg-amber-600 text-white shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300"
        >
          <div
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={() => {
              onTabChange('ORDERS');
              onDismissAlert();
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">
                New Order Received!
              </span>
              <p className="text-xs text-amber-100 font-medium">
                #{newOrderAlert.order_number} • {newOrderAlert.customer_name} (₱{newOrderAlert.total.toFixed(2)})
              </p>
            </div>
          </div>
          <button
            onClick={onDismissAlert}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Manager Header Bar */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white px-4 py-2.5 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 font-black text-sm flex items-center justify-center">
              POS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base tracking-tight uppercase">
                  Lovely Eatery
                </span>
                <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                  role === 'admin'
                    ? 'text-amber-300 bg-amber-950/80 border border-amber-800'
                    : 'text-sky-300 bg-sky-950/80 border border-sky-800'
                }`}>
                  {role === 'admin' ? '👑 Admin' : '💼 Manager'}
                </span>
              </div>
              <p className="text-[10px] text-stone-400">
                {role === 'admin' ? 'Admin: Add Menus & Food Photos' : 'Manager: Set Selling Prices & POS'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Role Switcher */}
            <div className="hidden sm:flex items-center bg-stone-800/90 p-0.5 rounded-xl border border-stone-700">
              <button
                id="role-switch-admin-btn"
                onClick={() => handleRoleToggle('admin')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition ${
                  role === 'admin'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Admin role: Add menu items and upload food pictures"
              >
                👑 Admin
              </button>
              <button
                id="role-switch-manager-btn"
                onClick={() => handleRoleToggle('manager')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition ${
                  role === 'manager'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Manager role: Set and update dish prices"
              >
                💼 Manager
              </button>
            </div>
            {onOpenAiChat && (
              <button
                id="manager-ai-studio-btn"
                onClick={onOpenAiChat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-amber-600 text-white text-xs font-bold transition hover:opacity-95 shadow-xs"
                title="AI Studio & Culinary Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="hidden sm:inline">AI Studio</span>
              </button>
            )}

            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl transition ${
                soundEnabled ? 'text-amber-400 bg-stone-800' : 'text-stone-500 bg-stone-800/50'
              }`}
              title={soundEnabled ? 'Mute Kitchen Chime' : 'Enable Kitchen Chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onSwitchToCustomer}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">{children}</main>

      {/* Bottom Navigation for Manager Mobile Phone (Item 29) */}
      <nav
        id="manager-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1.5 px-2 shadow-lg"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          <button
            id="mgr-nav-dashboard"
            onClick={() => onTabChange('DASHBOARD')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition min-h-[48px] ${
              activeTab === 'DASHBOARD'
                ? 'text-amber-700 font-black'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'DASHBOARD' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Dashboard</span>
          </button>

          <button
            id="mgr-nav-orders"
            onClick={() => onTabChange('ORDERS')}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition min-h-[48px] ${
              activeTab === 'ORDERS'
                ? 'text-amber-700 font-black'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <div className="relative">
              <ClipboardList className={`w-5 h-5 ${activeTab === 'ORDERS' ? 'stroke-[2.5]' : ''}`} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Orders</span>
          </button>

          {/* WALK-IN Highlighted Center Button (Item 29: Very Important POS Mode) */}
          <button
            id="mgr-nav-walk-in"
            onClick={() => onTabChange('WALK_IN')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition min-h-[48px] ${
              activeTab === 'WALK_IN'
                ? 'text-amber-700 font-black'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <div className="p-1 rounded-xl bg-amber-600 text-white shadow-xs">
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-wider mt-0.5 text-amber-800">
              Walk-In
            </span>
          </button>

          <button
            id="mgr-nav-menu"
            onClick={() => onTabChange('MENU')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition min-h-[48px] ${
              activeTab === 'MENU'
                ? 'text-amber-700 font-black'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Utensils className={`w-5 h-5 ${activeTab === 'MENU' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Menu</span>
          </button>

          <button
            id="mgr-nav-more"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition min-h-[48px] ${
              activeTab === 'REPORTS' || activeTab === 'SETTINGS' || showMoreMenu
                ? 'text-amber-700 font-black'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* "More" Slide-up Drawer */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-3 pb-24"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-black uppercase tracking-wider text-stone-400">
                Manager Options
              </span>
              <button onClick={() => setShowMoreMenu(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => handleSelectMoreTab('REPORTS')}
              className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 flex items-center gap-3 text-stone-800 font-bold text-xs transition"
            >
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>Sales Reports &amp; Analytics</span>
            </button>

            <button
              onClick={() => handleSelectMoreTab('SETTINGS')}
              className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 flex items-center gap-3 text-stone-800 font-bold text-xs transition"
            >
              <Settings className="w-4 h-4 text-amber-600" />
              <span>Restaurant Profile &amp; Receipt Settings</span>
            </button>

            <button
              onClick={onToggleSound}
              className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-stone-800 font-bold text-xs transition"
            >
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
                <span>Kitchen Order Sound Alert</span>
              </div>
              <span className="text-[11px] font-bold text-amber-700">{soundEnabled ? 'ON' : 'MUTED'}</span>
            </button>

            <button
              onClick={logout}
              className="w-full p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 flex items-center gap-3 text-rose-700 font-bold text-xs transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Manager Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
