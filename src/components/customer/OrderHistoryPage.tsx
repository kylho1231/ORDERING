import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Order } from '../../types';
import { Clock, ChevronRight, FileText, Utensils, Store, Bike } from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';

interface Props {
  onSelectOrder: (order: Order) => void;
  onNavigateToMenu: () => void;
}

export const OrderHistoryPage: React.FC<Props> = ({ onSelectOrder, onNavigateToMenu }) => {
  const { customerOrders, formatPrice } = useCart();
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);

  if (customerOrders.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
        <div className="w-18 h-18 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
          <Clock className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">No orders yet</h2>
          <p className="text-xs text-stone-500 mt-1">
            You haven&apos;t placed any orders yet. Check out our delicious menu!
          </p>
        </div>
        <button
          onClick={onNavigateToMenu}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 text-white font-bold text-sm shadow-md hover:bg-amber-700 transition"
        >
          <Utensils className="w-4 h-4" />
          <span>Browse Menu</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Your Orders</h1>
        <p className="text-xs text-stone-500 mt-0.5">Track status and receipts for your recent orders</p>
      </div>

      <div className="space-y-3">
        {customerOrders.map((order) => {
          const date = new Date(order.created_at);
          const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs hover:border-amber-300 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-stone-900 font-sans tracking-wide">
                    #{order.order_number}
                  </span>
                  <p className="text-[11px] text-stone-400">
                    {dateStr} • {timeStr}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : order.status === 'Cancelled'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items preview */}
              <div className="text-xs text-stone-600 space-y-1 bg-stone-50/70 p-3 rounded-2xl">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.product_name_snapshot}
                    </span>
                    <span className="font-semibold text-stone-800">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-[11px] text-stone-400 italic">
                    +{order.items.length - 3} more items...
                  </p>
                )}
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1">
                    {order.order_type === 'Dine-In' ? (
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Bike className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {order.order_type}
                    {order.table_number && ` (Table ${order.table_number})`}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="font-black text-amber-700 text-sm">
                    {formatPrice(order.total)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReceipt(order)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 transition"
                    title="View Receipt"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Receipt</span>
                  </button>
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                  >
                    <span>Track</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedReceipt && (
        <ReceiptModal
          order={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
