import React, { useState, useEffect } from 'react';
import { Product, Category, Order, OrderType } from '../../types';
import { api } from '../../services/api';
import { Plus, Minus, Trash2, CheckCircle2, Store, Bike, Search, Sparkles, Receipt, RefreshCw, Loader2 } from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';
import { notify } from '../../utils/alert';

export const WalkInPOS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // POS Order State
  const [orderItems, setOrderItems] = useState<
    Array<{ product: Product; quantity: number; notes: string }>
  >([]);
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('Dine-In');
  const [tableNumber, setTableNumber] = useState('1');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [cats, prods] = await Promise.all([api.getCategories(), api.getMenu()]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load menu for POS:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Quick-tap product logic: if already in cart, increment quantity; else add
  const handleQuickAdd = (product: Product) => {
    if (!product.available) return;

    setOrderItems((prev) => {
      const idx = prev.findIndex((it) => it.product.id === product.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((it) => {
          if (it.product.id === productId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as Array<{ product: Product; quantity: number; notes: string }>
    );
  };

  const removeItem = (productId: string) => {
    setOrderItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const handleReset = async () => {
    if (orderItems.length > 0) {
      const confirmed = await notify.confirm({
        title: 'Reset POS Cart?',
        text: 'Are you sure you want to clear current items?',
        confirmButtonText: 'Yes, reset',
        isDanger: true,
      });
      if (!confirmed) return;
    }
    setOrderItems([]);
    setCustomerName('');
    setTableNumber('1');
    setOrderNotes('');
    setCompletedOrder(null);
    notify.toast('POS reset', 'info');
  };

  // Calculations
  const totalQuantity = orderItems.reduce((s, it) => s + it.quantity, 0);
  const grandTotal = orderItems.reduce((s, it) => s + it.product.price * it.quantity, 0);

  const handleCompleteOrder = async () => {
    if (orderItems.length === 0) return;
    if (orderType === 'Dine-In' && !tableNumber.trim()) {
      notify.warning('Table Required', 'Please select or enter a table number for Dine-In.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalName = customerName.trim() || 'Walk-in Customer';
      const order = await api.createOrder({
        customer_name: finalName,
        contact_number: '',
        order_type: orderType,
        table_number: orderType === 'Dine-In' ? tableNumber.trim() : undefined,
        notes: orderNotes.trim(),
        source: 'WALK_IN',
        payment_method: 'Cash',
        payment_status: 'Paid',
        items: orderItems.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
          notes: it.notes,
        })),
      });

      setCompletedOrder(order);
      notify.toast(`Walk-in order #${order.order_number} created!`);
    } catch (err: unknown) {
      notify.error('Order Failed', (err as Error).message || 'Failed to complete walk-in order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight uppercase">
              Walk-In Order / Mobile POS
            </h1>
          </div>
          <p className="text-xs text-stone-500">Fast counter order entry for Lovely Eatery</p>
        </div>

        {orderItems.length > 0 && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold transition flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Quick-Tap Menu Browser (cols 7) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search and Category Pills */}
          <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search food item..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  selectedCategory === 'ALL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                    selectedCategory.toLowerCase() === c.name.toLowerCase()
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick-tap Grid */}
          {loading ? (
            <div className="p-8 text-center text-xs text-stone-400">Loading menu items...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[52vh] lg:max-h-[65vh] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => {
                const currentInCart = orderItems.find((it) => it.product.id === prod.id)?.quantity || 0;
                return (
                  <button
                    key={prod.id}
                    id={`pos-tap-prod-${prod.id}`}
                    onClick={() => handleQuickAdd(prod)}
                    disabled={!prod.available}
                    className={`relative p-2.5 rounded-2xl border text-left flex flex-col justify-between transition active:scale-95 min-h-[92px] ${
                      !prod.available
                        ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
                        : currentInCart > 0
                        ? 'bg-amber-50 border-amber-400 shadow-sm ring-1 ring-amber-300'
                        : 'bg-white border-stone-200 hover:border-amber-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-black text-xs text-stone-900 leading-tight line-clamp-2">
                          {prod.name}
                        </span>
                        {currentInCart > 0 && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-black">
                            ×{currentInCart}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100">
                      <span className="font-extrabold text-xs text-amber-700">
                        ₱{prod.price.toFixed(2)}
                      </span>
                      {prod.available ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          + Tap
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: POS Cart & Instant Checkout (cols 5) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-black uppercase tracking-wider text-stone-900">
                Walk-In Order Slip
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Selected Items List */}
            {orderItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 space-y-1">
                <p className="font-bold text-stone-600">No items selected</p>
                <p>Tap any food item from the menu on the left to add.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-stone-100 pr-1">
                {orderItems.map((item) => (
                  <div key={item.product.id} className="pt-2 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-stone-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        ₱{item.product.price.toFixed(2)} × {item.quantity} ={' '}
                        <span className="font-bold text-stone-700">
                          ₱{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order Configuration: Type & Table */}
            <div className="pt-2 border-t border-stone-100 space-y-3 text-xs">
              {/* Dine-In vs Take-Out */}
              <div>
                <label className="block font-bold text-stone-500 uppercase tracking-wider mb-1 text-[11px]">
                  Order Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('Dine-In')}
                    className={`py-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      orderType === 'Dine-In'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Dine-In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('Take-Out')}
                    className={`py-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      orderType === 'Take-Out'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Take-Out</span>
                  </button>
                </div>
              </div>

              {/* Table Picker if Dine-In */}
              {orderType === 'Dine-In' && (
                <div>
                  <label className="block font-bold text-stone-500 uppercase tracking-wider mb-1 text-[11px]">
                    Table Number
                  </label>
                  <div className="grid grid-cols-6 gap-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((tbl) => (
                      <button
                        key={tbl}
                        type="button"
                        onClick={() => setTableNumber(tbl)}
                        className={`py-1.5 rounded-lg border font-black text-xs transition ${
                          tableNumber === tbl
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {tbl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label className="block font-bold text-stone-500 uppercase tracking-wider mb-1 text-[11px]">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder='Default: "Walk-in Customer"'
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Totals & Complete Order Button */}
            <div className="pt-3 border-t border-stone-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-black uppercase text-stone-500">Order Total</span>
                <span className="text-2xl font-black text-amber-700">₱{grandTotal.toFixed(2)}</span>
              </div>

              <button
                id="pos-complete-order-btn"
                onClick={handleCompleteOrder}
                disabled={orderItems.length === 0 || isSubmitting}
                className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 min-h-[48px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Order • ₱{grandTotal.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Walk-in Receipt Modal when completed */}
      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          isWalkIn={true}
          onClose={() => {
            setCompletedOrder(null);
            handleReset();
          }}
        />
      )}
    </div>
  );
};
