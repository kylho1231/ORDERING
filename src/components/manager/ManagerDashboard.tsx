import React, { useState, useEffect } from 'react';
import { Order, SalesSummary } from '../../types';
import { api } from '../../services/api';
import { Plus, ShoppingBag, Banknote, Clock, CheckCircle2, ChevronRight, Volume2, VolumeX, Store, ArrowUpRight, TrendingUp } from 'lucide-react';
import { notify } from '../../utils/alert';

interface Props {
  orders: Order[];
  onNavigateTab: (tab: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const ManagerDashboard: React.FC<Props> = ({
  orders,
  onNavigateTab,
  soundEnabled,
  onToggleSound,
}) => {
  const [sales, setSales] = useState<SalesSummary | null>(null);

  const handleToggleAudio = () => {
    onToggleSound();
    notify.toast(
      !soundEnabled ? 'Kitchen chime sound turned ON' : 'Kitchen chime muted',
      'info'
    );
  };

  useEffect(() => {
    async function loadSales() {
      try {
        const s = await api.getSalesReport('today');
        setSales(s);
      } catch (err) {
        console.error('Failed to load sales summary:', err);
      }
    }
    loadSales();
  }, [orders]);

  // Metric cards
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const preparingCount = orders.filter((o) => o.status === 'Preparing' || o.status === 'Confirmed').length;
  const readyCount = orders.filter((o) => o.status === 'Ready').length;
  const completedCount = orders.filter((o) => o.status === 'Completed').length;

  const totalSalesToday = sales ? sales.totalSales : orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const totalOrdersToday = sales ? sales.totalOrders : orders.length;

  const recentActiveOrders = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled').slice(0, 5);

  return (
    <div className="space-y-5 pb-20">
      {/* Top Welcome Bar with Audio Sound Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
            Lovely Eatery Android POS
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-1">
            Store Dashboard
          </h1>
        </div>

        <button
          id="toggle-sound-btn"
          onClick={handleToggleAudio}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-bold transition shadow-xs ${
            soundEnabled
              ? 'bg-amber-500 text-stone-950 border-amber-400'
              : 'bg-stone-100 text-stone-500 border-stone-200'
          }`}
          title="Toggle kitchen order audio alert chime"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{soundEnabled ? 'Chime ON' : 'Chime Muted'}</span>
        </button>
      </div>

      {/* Primary Walk-in CTA Button (Large touch target >= 48px) */}
      <button
        id="dashboard-new-walk-in-btn"
        onClick={() => onNavigateTab('WALK_IN')}
        className="w-full py-4 px-6 rounded-3xl bg-amber-600 hover:bg-amber-700 text-white font-black text-base shadow-lg shadow-amber-900/20 transition flex items-center justify-between active:scale-98 min-h-[56px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <div className="text-left">
            <span className="block text-base font-black uppercase tracking-wide">
              + New Walk-In Order
            </span>
            <span className="block text-xs font-medium text-amber-100">
              Counter POS terminal &amp; receipt printer
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-amber-200" />
      </button>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Today's Sales */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today&apos;s Sales</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-900 font-sans">
            ₱{totalSalesToday.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> Live Gross
          </span>
        </div>

        {/* Today's Orders */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-900 font-sans">
            {totalOrdersToday}
          </p>
          <span className="text-[10px] text-stone-400">
            {orders.filter((o) => o.source === 'ONLINE').length} online • {orders.filter((o) => o.source === 'WALK_IN').length} walk-in
          </span>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => onNavigateTab('ORDERS')}
          className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-1 cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <div className={`p-1.5 rounded-lg ${pendingCount > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-stone-50 text-stone-400'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-black ${pendingCount > 0 ? 'text-amber-700' : 'text-stone-900'}`}>
            {pendingCount}
          </p>
          <span className="text-[10px] text-amber-700 font-bold">
            {pendingCount > 0 ? 'Needs confirmation' : 'Queue clear'}
          </span>
        </div>

        {/* Active In Kitchen / Completed */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Cooks</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-stone-900">
            {preparingCount + readyCount}
          </p>
          <span className="text-[10px] text-purple-700 font-bold">
            {readyCount} ready for pickup
          </span>
        </div>
      </div>

      {/* Active Orders Quick-Board */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              Kitchen Live Queue ({recentActiveOrders.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('ORDERS')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentActiveOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No active orders waiting in the kitchen right now.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentActiveOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => onNavigateTab('ORDERS')}
                className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50/80 rounded-2xl px-2 -mx-2 transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-stone-900 font-sans">
                      #{ord.order_number}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {ord.order_type} {ord.table_number && `(T-${ord.table_number})`}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700">
                      {ord.items.length} items
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {ord.customer_name} • {ord.items.map((i) => `${i.quantity}x ${i.product_name_snapshot}`).join(', ')}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      ord.status === 'Pending'
                        ? 'bg-amber-100 text-amber-900'
                        : ord.status === 'Preparing'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {ord.status}
                  </span>
                  <span className="block font-black text-xs text-stone-900 mt-1">
                    ₱{ord.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateTab('MENU')}
          className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-400 text-left transition space-y-1"
        >
          <span className="text-2xl block">🍲</span>
          <span className="font-black text-sm text-stone-900 block">Manage Menu</span>
          <span className="text-xs text-stone-500 block">Add dishes, prices, availability</span>
        </button>

        <button
          onClick={() => onNavigateTab('REPORTS')}
          className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-400 text-left transition space-y-1"
        >
          <span className="text-2xl block">📊</span>
          <span className="font-black text-sm text-stone-900 block">Sales Reports</span>
          <span className="text-xs text-stone-500 block">Dine-in vs take-out, daily totals</span>
        </button>
      </div>
    </div>
  );
};
