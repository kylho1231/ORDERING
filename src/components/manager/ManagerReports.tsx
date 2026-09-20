import React, { useState, useEffect } from 'react';
import { SalesSummary } from '../../types';
import { api } from '../../services/api';
import { Calendar, Banknote, ShoppingBag, TrendingUp, Store, Globe, PieChart as PieIcon, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export const ManagerReports: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today');
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const s = await api.getSalesReport(period);
        setSummary(s);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  const typeData = summary
    ? [
        { name: 'Dine-In', value: summary.dineInSales, count: summary.dineInCount, color: '#d97706' },
        { name: 'Take-Out', value: summary.takeOutSales, count: summary.takeOutCount, color: '#2563eb' },
      ]
    : [];

  const sourceData = summary
    ? [
        { name: 'Walk-In POS', count: summary.walkInCount, color: '#f59e0b' },
        { name: 'Online Ordering', count: summary.onlineCount, color: '#10b981' },
      ]
    : [];

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight uppercase">
          Sales Summary &amp; Analytics
        </h1>
        <p className="text-xs text-stone-500">Performance metrics for Lovely Eatery</p>
      </div>

      {/* Period Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs">
        {[
          { key: 'today', label: 'Today' },
          { key: 'yesterday', label: 'Yesterday' },
          { key: 'week', label: 'This Week' },
          { key: 'month', label: 'This Month' },
          { key: 'all', label: 'All Time' },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key as typeof period)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex-1 ${
              period === p.key
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading sales analytics...</div>
      ) : summary ? (
        <div className="space-y-4">
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Gross Sales</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 font-sans">
                ₱{summary.totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-stone-400">Total revenue for period</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 font-sans">
                {summary.totalOrders}
              </p>
              <span className="text-[10px] text-stone-400">Completed tickets</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Dishes Cooked</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 font-sans">
                {summary.totalItemsSold}
              </p>
              <span className="text-[10px] text-stone-400">Portions prepared</span>
            </div>
          </div>

          {/* Breakdown Section: Dine-in vs Take-out & Walk-in vs Online */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dine-In vs Take-Out */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                  Dine-In vs Take-Out Sales
                </h3>
                <Store className="w-4 h-4 text-amber-600" />
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#78716c" fontSize={11} width={75} />
                    <Tooltip
                      formatter={(val: unknown) => [`₱${Number(val || 0).toFixed(2)}`, 'Sales']}
                      contentStyle={{ borderRadius: 12, fontSize: 12 }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-stone-100">
                <div className="p-2.5 rounded-xl bg-amber-50">
                  <span className="text-stone-500 font-bold block text-[11px]">Dine-In</span>
                  <span className="font-black text-amber-900 text-sm">₱{summary.dineInSales.toFixed(2)}</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">{summary.dineInCount} orders</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50">
                  <span className="text-stone-500 font-bold block text-[11px]">Take-Out</span>
                  <span className="font-black text-blue-900 text-sm">₱{summary.takeOutSales.toFixed(2)}</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">{summary.takeOutCount} orders</span>
                </div>
              </div>
            </div>

            {/* Walk-in vs Online Channels */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                  Order Channels Breakdown
                </h3>
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Walk-In Counter Orders
                    </span>
                    <span className="font-black text-stone-900">
                      {summary.walkInCount} ({summary.totalOrders > 0 ? Math.round((summary.walkInCount / summary.totalOrders) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${summary.totalOrders > 0 ? (summary.walkInCount / summary.totalOrders) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Online Customer Orders
                    </span>
                    <span className="font-black text-stone-900">
                      {summary.onlineCount} ({summary.totalOrders > 0 ? Math.round((summary.onlineCount / summary.totalOrders) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${summary.totalOrders > 0 ? (summary.onlineCount / summary.totalOrders) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-[11px] text-stone-500">
                Direct online ordering allows Antique residents to view menus and place orders without waiting in line.
              </div>
            </div>
          </div>

          {/* Top Selling Dishes Ranking */}
          {summary.popularItems && summary.popularItems.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Top Selling Dishes
                </h3>
                <span className="text-[10px] text-stone-400 font-bold">Ranked by volume</span>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {summary.popularItems.map((dish: { name: string; quantity: number; revenue: number }, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-stone-900 text-sm block">{dish.name}</span>
                        <span className="text-[11px] text-stone-400">{dish.quantity} orders sold</span>
                      </div>
                    </div>
                    <span className="font-black text-amber-700 text-sm">
                      ₱{dish.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
