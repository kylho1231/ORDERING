import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { Check, ChefHat, BellRing, Sparkles, X, Printer, Store, Bike, Globe, Phone, Clock, FileText, Filter } from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';
import { notify } from '../../utils/alert';

interface Props {
  orders: Order[];
  onOrderUpdated: () => void;
}

export const ManagerOrders: React.FC<Props> = ({ orders, onOrderUpdated }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'ONLINE' | 'WALK_IN'>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (order: Order, nextStatus: OrderStatus) => {
    if (nextStatus === 'Cancelled') {
      const confirmed = await notify.confirm({
        title: 'Cancel / Reject Order?',
        text: `Are you sure you want to cancel order #${order.order_number}?`,
        confirmButtonText: 'Yes, cancel order',
        isDanger: true,
      });
      if (!confirmed) return;
    }

    setActionLoadingId(order.id);
    try {
      await api.updateOrderStatus(order.id, nextStatus);
      notify.toast(`Order #${order.order_number} marked as ${nextStatus}`);
      onOrderUpdated();
    } catch (err) {
      notify.error('Failed to update status', (err as Error).message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === 'ALL' || o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSource =
      sourceFilter === 'ALL' || o.source === sourceFilter;
    return matchesStatus && matchesSource;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Preparing':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Ready':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Completed':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight uppercase">
            Orders Management
          </h1>
          <p className="text-xs text-stone-500">Live order tickets &amp; kitchen workflow</p>
        </div>
        <span className="text-xs font-bold text-stone-700 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'ticket' : 'tickets'}
        </span>
      </div>

      {/* Filter Row: Status & Source */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2.5">
        {/* Source Filter */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Filter className="w-3 h-3" /> Source
          </span>
          <div className="flex gap-1">
            {(['ALL', 'ONLINE', 'WALK_IN'] as const).map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  sourceFilter === src
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {src === 'ALL' ? 'All' : src === 'ONLINE' ? '🟢 Online' : '🟠 Walk-In'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold">
          {['ALL', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((st) => {
            const isSelected = statusFilter.toLowerCase() === st.toLowerCase();
            const count = orders.filter(
              (o) => st === 'ALL' || o.status.toLowerCase() === st.toLowerCase()
            ).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{st}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <p className="font-bold text-stone-700 text-sm">No orders matching this filter</p>
          <p className="text-xs text-stone-400">All current orders have been processed.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const isBusy = actionLoadingId === order.id;
            const date = new Date(order.created_at);
            const timeStr = date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                id={`manager-order-card-${order.id}`}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3 transition"
              >
                {/* Header: Order Number, Source, Type, Status */}
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base sm:text-lg text-stone-900 font-sans tracking-wide">
                        #{order.order_number}
                      </span>

                      {/* Source tag: ONLINE vs WALK-IN (Item 13) */}
                      {order.source === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                          <Globe className="w-3 h-3" /> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                          <Store className="w-3 h-3" /> Walk-In
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                      <span className="flex items-center gap-1 font-bold text-stone-800">
                        {order.order_type === 'Dine-In' ? (
                          <Store className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Bike className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        {order.order_type}
                        {order.order_type === 'Dine-In' && order.table_number && (
                          <span className="text-amber-800 font-extrabold">
                            • TABLE {order.table_number}
                          </span>
                        )}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" /> {timeStr}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="flex items-center justify-between text-xs bg-stone-50 p-2.5 rounded-xl text-stone-700">
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">
                      Customer
                    </span>
                    <span className="font-bold text-stone-900">{order.customer_name}</span>
                  </div>
                  {order.contact_number && (
                    <div className="text-right">
                      <span className="text-stone-400 text-[10px] uppercase font-bold block">
                        Contact
                      </span>
                      <span className="font-mono text-stone-800 flex items-center gap-1 justify-end">
                        <Phone className="w-3 h-3 text-stone-400" /> {order.contact_number}
                      </span>
                    </div>
                  )}
                </div>

                {/* Items Ordered */}
                <div className="space-y-1.5 text-xs py-1">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="pr-2">
                        <span className="font-bold text-stone-900">
                          {it.quantity} × {it.product_name_snapshot}
                        </span>
                        {it.notes && (
                          <p className="text-[11px] text-amber-800 italic mt-0.5">
                            Note: &ldquo;{it.notes}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-stone-800 shrink-0">
                        ₱{it.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Notes if present */}
                {order.notes && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900">
                    <span className="font-bold">Customer Notes: </span>
                    <span>{order.notes}</span>
                  </div>
                )}

                {/* Footer: Price, Receipt & Workflow Actions */}
                <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-baseline justify-between sm:justify-start gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Total Amount
                      </span>
                      <span className="text-lg font-black text-amber-700">
                        ₱{order.total.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedReceipt(order)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 transition"
                      title="Print / View Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </div>

                  {/* Status Action Buttons with large touch targets (>= 44px) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {order.status === 'Pending' && (
                      <>
                        <button
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(order, 'Confirmed')}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition flex items-center justify-center gap-1 min-h-[44px]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(order, 'Cancelled')}
                          className="px-3 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold active:scale-95 transition flex items-center justify-center min-h-[44px]"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      </>
                    )}

                    {order.status === 'Confirmed' && (
                      <button
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(order, 'Preparing')}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs active:scale-95 transition flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {order.status === 'Preparing' && (
                      <button
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(order, 'Ready')}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Food Ready</span>
                      </button>
                    )}

                    {order.status === 'Ready' && (
                      <button
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(order, 'Completed')}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs active:scale-95 transition flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Complete Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedReceipt && (
        <ReceiptModal
          order={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
