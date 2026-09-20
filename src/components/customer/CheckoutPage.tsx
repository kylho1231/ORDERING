import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { Order, OrderType } from '../../types';
import { ArrowLeft, CheckCircle2, AlertCircle, CreditCard, Banknote, Store, Sparkles, Loader2 } from 'lucide-react';
import { notify } from '../../utils/alert';

interface Props {
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<Props> = ({ onBack, onOrderSuccess }) => {
  const { items, subtotal, totalItems, formatPrice, clearCart, addCustomerOrder } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('Dine-In');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Counter' | 'Cash' | 'Card'>('Counter');

  // Stripe card simulator / test mode info
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!customerName.trim()) {
      return 'Please enter your full name.';
    }
    if (!contactNumber.trim()) {
      return 'Please enter your contact number.';
    }
    if (orderType === 'Dine-In' && !tableNumber.trim()) {
      return 'Please enter a table number for dine-in.';
    }
    if (items.length === 0) {
      return 'No items in your cart.';
    }
    return null;
  };

  const handleReviewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMessage(err);
      notify.warning('Please check your order details', err);
      return;
    }
    setErrorMessage(null);
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let stripeIntentId: string | undefined = undefined;

      // If user chose card payment, process payment intent through Stripe API
      if (paymentMethod === 'Card') {
        const paymentRes = await api.createPaymentIntent({
          amount: subtotal,
          orderDetails: {
            customer_name: customerName,
            order_type: orderType,
          },
        });
        stripeIntentId = paymentRes.id;
      }

      const orderPayload = {
        customer_name: customerName.trim(),
        contact_number: contactNumber.trim(),
        order_type: orderType,
        table_number: orderType === 'Dine-In' ? tableNumber.trim() : undefined,
        notes: notes.trim(),
        source: 'ONLINE' as const,
        payment_method: paymentMethod,
        payment_status: (paymentMethod === 'Card' ? 'Paid' : 'Pending') as 'Pending' | 'Paid',
        stripe_payment_intent_id: stripeIntentId,
        items: items.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
          notes: it.specialInstructions,
        })),
      };

      const createdOrder = await api.createOrder(orderPayload);
      addCustomerOrder(createdOrder);
      clearCart();
      setShowConfirmModal(false);
      notify.toast(`Order #${createdOrder.order_number} confirmed!`);
      onOrderSuccess(createdOrder);
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Something went wrong while placing your order.';
      setErrorMessage(msg);
      notify.error('Order Submission Failed', msg);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          id="checkout-back-btn"
          onClick={onBack}
          className="p-2 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Checkout</h1>
          <p className="text-xs text-stone-500">Complete your Lovely Eatery order</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Please check your details</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleReviewOrder} className="space-y-5">
        {/* Customer Information Card */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            1. Customer Information
          </h2>

          <div className="space-y-3">
            <div>
              <label htmlFor="customer-name" className="block text-xs font-bold text-stone-600 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Juan Dela Cruz"
                required
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label htmlFor="contact-number" className="block text-xs font-bold text-stone-600 mb-1">
                Contact Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="contact-number"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g., 0917 123 4567"
                required
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Order Type Card */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            2. Order Type
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              id="order-type-dine-in"
              onClick={() => setOrderType('Dine-In')}
              className={`p-4 rounded-2xl border text-center font-bold text-sm transition flex flex-col items-center gap-1.5 ${
                orderType === 'Dine-In'
                  ? 'bg-amber-50/80 border-amber-500 text-amber-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Store className="w-5 h-5 text-amber-600" />
              <span>Dine-In</span>
              <span className="text-[10px] font-normal text-stone-500">Eat at our restaurant</span>
            </button>

            <button
              type="button"
              id="order-type-take-out"
              onClick={() => setOrderType('Take-Out')}
              className={`p-4 rounded-2xl border text-center font-bold text-sm transition flex flex-col items-center gap-1.5 ${
                orderType === 'Take-Out'
                  ? 'bg-amber-50/80 border-amber-500 text-amber-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Banknote className="w-5 h-5 text-amber-600" />
              <span>Take-Out</span>
              <span className="text-[10px] font-normal text-stone-500">Pick up to go</span>
            </button>
          </div>

          {orderType === 'Dine-In' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <label htmlFor="table-number" className="block text-xs font-bold text-stone-600 mb-1">
                Table Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="table-number"
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g., Table 4"
                  required={orderType === 'Dine-In'}
                  className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                />
                <div className="flex gap-1">
                  {['1', '2', '3', '4', '5', '6'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTableNumber(num)}
                      className={`px-2.5 py-1 text-xs rounded-xl border font-bold transition ${
                        tableNumber === num
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="order-notes" className="block text-xs font-bold text-stone-600 mb-1">
              Order Notes (Optional)
            </label>
            <input
              id="order-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Utensils needed, condiments, allergic to peanuts..."
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              3. Payment Option
            </h2>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Seamless Checkout
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setPaymentMethod('Counter')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                paymentMethod === 'Counter'
                  ? 'bg-amber-50/80 border-amber-500 text-amber-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Banknote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Pay at Counter / Cash</span>
                <span className="text-xs text-stone-500">Pay when receiving your food</span>
              </div>
            </div>

            <div
              onClick={() => setPaymentMethod('Card')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                paymentMethod === 'Card'
                  ? 'bg-amber-50/80 border-amber-500 text-amber-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <CreditCard className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Credit / Debit Card (Stripe)</span>
                <span className="text-xs text-stone-500">Instant online card authorization</span>
              </div>
            </div>
          </div>

          {paymentMethod === 'Card' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  Stripe Payment Processing
                </span>
                <span className="text-[10px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                  PHP ₱
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Card Number: 4242 •••• •••• 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-amber-800/80">
                Processed safely via Stripe. If live credentials are not set, a demo transaction token is generated automatically.
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            4. Order Summary
          </h2>

          <div className="divide-y divide-stone-100 text-xs">
            {items.map((it, idx) => (
              <div key={idx} className="py-2 flex justify-between items-start">
                <div>
                  <span className="font-bold text-stone-900">
                    {it.quantity} × {it.product.name}
                  </span>
                  {it.specialInstructions && (
                    <p className="text-stone-400 italic mt-0.5">&ldquo;{it.specialInstructions}&rdquo;</p>
                  )}
                </div>
                <span className="font-semibold text-stone-900 shrink-0">
                  {formatPrice(it.product.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-stone-400 block">Total ({totalItems} items)</span>
              <span className="text-xs text-stone-500">VAT inclusive</span>
            </div>
            <span className="text-2xl font-black text-amber-700">{formatPrice(subtotal)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="place-order-submit-btn"
          type="submit"
          className="w-full py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-base shadow-xl transition flex items-center justify-center gap-2 active:scale-98"
        >
          <Sparkles className="w-5 h-5 text-amber-200" />
          <span>Place Order • {formatPrice(subtotal)}</span>
        </button>
      </form>

      {/* Confirmation Dialog Modal as requested in Item 8 */}
      {showConfirmModal && (
        <div
          id="checkout-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-stone-900">Confirm Your Order</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Please review your order details before placing it with Lovely Eatery.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-xs space-y-1.5 text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-400">Customer:</span>
                <span className="font-semibold">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Type:</span>
                <span className="font-bold text-amber-800">
                  {orderType} {orderType === 'Dine-In' && `(Table ${tableNumber})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Payment:</span>
                <span>{paymentMethod === 'Card' ? 'Card (Stripe)' : 'Pay at Counter'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-200 font-bold text-stone-900 text-sm">
                <span>Grand Total:</span>
                <span className="text-amber-700">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                id="cancel-confirm-order-btn"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="final-confirm-order-btn"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing...</span>
                  </>
                ) : (
                  <span>Confirm Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
