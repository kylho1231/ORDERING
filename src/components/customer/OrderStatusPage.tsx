import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { CheckCircle2, Clock, ChefHat, BellRing, Sparkles, FileText, ArrowLeft, Store } from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';

interface Props {
  initialOrder: Order;
  onBackToMenu: () => void;
}

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; icon: React.FC<{ className?: string }> }> = [
  { key: 'Pending', label: 'Order Received', icon: Clock },
  { key: 'Confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
  { key: 'Preparing', label: 'Preparing Food', icon: ChefHat },
  { key: 'Ready', label: 'Ready for You', icon: BellRing },
  { key: 'Completed', label: 'Order Completed', icon: Sparkles },
];

export const OrderStatusPage: React.FC<Props> = ({ initialOrder, onBackToMenu }) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    // Poll order status to receive manager updates in real time
    const interval = setInterval(async () => {
      try {
        const fresh = await api.getOrder(initialOrder.id);
        if (fresh) setOrder(fresh);
      } catch (e) {
        // silent fallback
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [initialOrder.id]);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="space-y-6 pb-16">
      {/* Back button */}
      <button
        onClick={onBackToMenu}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Menu</span>
      </button>

      {/* Confirmation Banner */}
      <div className="text-center bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 font-sans tracking-tight">
            Order #{order.order_number}
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-sm mx-auto">
            Thank you for ordering from <span className="font-bold text-amber-800">Lovely Eatery</span>!
          </p>
        </div>

        {order.order_type === 'Dine-In' && order.table_number && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <Store className="w-4 h-4 text-amber-600" />
            <span>Serving at Table {order.table_number}</span>
          </div>
        )}
      </div>

      {/* Status Visual Tracker (Item 10) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            Live Order Status
          </h2>
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Live Updates Active
          </span>
        </div>

        {/* Step Progression Timeline */}
        <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-stone-200 ml-3 sm:ml-4">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="relative group">
                {/* Dot / Icon */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCurrent
                      ? 'bg-amber-600 text-white shadow-md ring-4 ring-amber-100'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                </div>

                <div className="pt-0.5">
                  <h3
                    className={`font-bold text-sm ${
                      isCurrent
                        ? 'text-amber-800 text-base'
                        : isCompleted
                        ? 'text-stone-900'
                        : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {step.key === 'Pending' && 'Your order was sent to the kitchen.'}
                    {step.key === 'Confirmed' && 'Manager has accepted your order.'}
                    {step.key === 'Preparing' && 'Our cooks are preparing your fresh meal.'}
                    {step.key === 'Ready' &&
                      (order.order_type === 'Dine-In'
                        ? 'Your food is on its way to your table!'
                        : 'Your food is ready for counter pickup!')}
                    {step.key === 'Completed' && 'Enjoy your meal! Salamat gid!'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details & Summary */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            Order Items
          </h2>
          <span className="text-xs text-stone-400">
            {order.order_type} • {order.items.length} items
          </span>
        </div>

        <div className="divide-y divide-stone-100 text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="py-2.5 flex justify-between items-start">
              <div>
                <span className="font-semibold text-stone-900">
                  {item.quantity} × {item.product_name_snapshot}
                </span>
                {item.notes && (
                  <p className="text-xs text-amber-700 italic mt-0.5">&ldquo;{item.notes}&rdquo;</p>
                )}
              </div>
              <span className="font-bold text-stone-900">₱{item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
          <span className="font-bold text-stone-900">Total Paid / Due</span>
          <span className="text-xl font-black text-amber-700">₱{order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Receipt Action Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="view-electronic-receipt-btn"
          onClick={() => setShowReceipt(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md transition active:scale-98"
        >
          <FileText className="w-4 h-4" />
          <span>View / Print Electronic Receipt</span>
        </button>

        <button
          onClick={onBackToMenu}
          className="py-4 px-6 rounded-2xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 font-bold text-sm transition text-center"
        >
          Order More Food
        </button>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          order={order}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};
