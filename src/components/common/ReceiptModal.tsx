import React, { useRef } from 'react';
import { Order, BusinessSettings } from '../../types';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';

interface Props {
  order: Order;
  settings?: BusinessSettings;
  onClose?: () => void;
  isWalkIn?: boolean;
}

export const ReceiptModal: React.FC<Props> = ({ order, settings, onClose, isWalkIn }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const defaultSettings: BusinessSettings = {
    name: 'LOVELY EATERY',
    tagline: 'Delicious food, made for you.',
    address: 'Business Park, Barangay 5, San Jose de Buenavista, Antique, Philippines',
    phone: '+63 917 890 2345',
    email: 'lovelyeatery.antique@gmail.com',
    hours: '8:00 AM – 8:30 PM Daily',
    logo_url: '/icon.svg',
    receipt_footer: 'Salamat gid sa pagkaon sa Lovely Eatery! Please come again.',
    currency_symbol: '₱',
    currency_code: 'PHP',
  };

  const s = settings || defaultSettings;

  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="receipt-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto print:bg-white print:p-0"
    >
      <div
        id="receipt-container"
        className="w-full max-w-sm sm:max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none my-auto"
      >
        {/* Modal Top Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-100 border-b border-stone-200 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-stone-800 text-sm">Official Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="print-receipt-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            {onClose && (
              <button
                id="close-receipt-btn"
                onClick={onClose}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/70 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Thermal Receipt Core */}
        <div
          ref={receiptRef}
          id="printable-receipt-content"
          className="p-6 sm:p-8 font-mono text-stone-900 bg-white"
        >
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-stone-300">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight font-sans text-stone-900 uppercase">
              {s.name}
            </h1>
            <p className="text-[12px] text-stone-600 mt-1 max-w-xs mx-auto leading-relaxed">
              {s.address}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">Tel: {s.phone}</p>

            {isWalkIn && (
              <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold tracking-wider uppercase">
                Walk-In POS Order
              </div>
            )}
          </div>

          {/* Order Metadata */}
          <div className="py-3 text-[12px] space-y-1 border-b border-dashed border-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-500">Order No:</span>
              <span className="font-bold text-stone-900 font-sans tracking-wide">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date & Time:</span>
              <span>{formattedDate} {formattedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Customer:</span>
              <span className="font-semibold">{order.customer_name || 'Walk-in Customer'}</span>
            </div>
            {order.contact_number && (
              <div className="flex justify-between">
                <span className="text-stone-500">Contact:</span>
                <span>{order.contact_number}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-stone-500">Order Type:</span>
              <span className="font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                {order.order_type}
                {order.order_type === 'Dine-In' && order.table_number && ` • TABLE ${order.table_number}`}
              </span>
            </div>
            {order.payment_method && (
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Payment:</span>
                <span>{order.payment_method} ({order.payment_status || 'Paid'})</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-4 border-b border-dashed border-stone-300">
            <div className="grid grid-cols-12 text-[11px] font-bold text-stone-400 uppercase tracking-wider pb-2">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-4 text-right">Subtotal</div>
            </div>

            <div className="space-y-2.5 pt-1 text-[12px]">
              {order.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 items-start">
                  <div className="col-span-6 pr-2">
                    <p className="font-medium text-stone-900 leading-tight">
                      {item.product_name_snapshot}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      ₱{item.unit_price_snapshot.toFixed(2)} each
                    </p>
                    {item.notes && (
                      <p className="text-[10px] text-amber-700 italic mt-0.5">
                        Note: &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 text-center font-semibold text-stone-700">
                    {item.quantity}
                  </div>
                  <div className="col-span-4 text-right font-bold text-stone-900">
                    ₱{item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="py-3 text-[13px] space-y-1.5 border-b border-dashed border-stone-300">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>₱{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-stone-900 pt-1 border-t border-stone-200">
              <span>TOTAL</span>
              <span className="font-sans text-amber-700">₱{order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-500 pt-1">
              <span>Status:</span>
              <span className="font-bold uppercase tracking-wider text-emerald-700">
                {order.status}
              </span>
            </div>
          </div>

          {/* Notes if any */}
          {order.notes && (
            <div className="py-2 text-[11px] text-stone-600 italic border-b border-dashed border-stone-300">
              <span className="font-bold not-italic text-stone-700">Instructions: </span>
              {order.notes}
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-5 pb-2 text-[11px] text-stone-500 space-y-1">
            <p className="font-medium text-stone-700">{s.receipt_footer}</p>
            <p className="text-[10px] text-stone-400">Thank you for supporting our local Antique eatery!</p>
            <div className="pt-2 text-[9px] text-stone-400 tracking-widest uppercase">
              *** END OF RECEIPT ***
            </div>
          </div>
        </div>

        {/* Action Buttons at bottom for Mobile Touch */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-600 text-white font-bold text-sm shadow-md hover:bg-amber-700 transition active:scale-98"
          >
            <Download className="w-4 h-4" />
            Print / Save Receipt
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-300 transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
