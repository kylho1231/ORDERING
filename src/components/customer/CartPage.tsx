import React from 'react';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils } from 'lucide-react';
import { notify } from '../../utils/alert';

interface Props {
  onProceedToCheckout: () => void;
  onNavigateToMenu: () => void;
}

export const CartPage: React.FC<Props> = ({ onProceedToCheckout, onNavigateToMenu }) => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, totalItems, formatPrice } =
    useCart();

  const handleClearCart = async () => {
    const confirmed = await notify.confirm({
      title: 'Clear Shopping Cart?',
      text: 'Are you sure you want to remove all dishes from your order?',
      confirmButtonText: 'Yes, clear all',
      isDanger: true,
    });
    if (confirmed) {
      clearCart();
      notify.toast('Cart cleared', 'info');
    }
  };

  const handleRemoveItem = (id: string, name: string, notes?: string) => {
    removeFromCart(id, notes);
    notify.toast(`Removed ${name}`, 'info');
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">Your cart is empty</h2>
          <p className="text-xs text-stone-500 mt-1">
            No delicious choices yet. Browse our menu to get started!
          </p>
        </div>
        <button
          id="cart-browse-menu-btn"
          onClick={onNavigateToMenu}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 text-white font-bold text-sm shadow-md hover:bg-amber-700 transition active:scale-95"
        >
          <Utensils className="w-4 h-4" />
          <span>Browse Menu</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Cart Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your order
          </p>
        </div>
        <button
          id="clear-cart-btn"
          onClick={handleClearCart}
          className="text-xs font-semibold text-stone-400 hover:text-rose-600 transition"
        >
          Clear All
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const itemSubtotal = item.product.price * item.quantity;
          return (
            <div
              key={`${item.product.id}-${idx}`}
              id={`cart-item-${item.product.id}`}
              className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs flex items-center gap-3.5"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 bg-stone-100"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {formatPrice(item.product.price)} each
                    </p>
                    {item.specialInstructions && (
                      <p className="text-[11px] text-amber-700 italic mt-1 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                        &ldquo;{item.specialInstructions}&rdquo;
                      </p>
                    )}
                  </div>
                  <button
                    id={`remove-item-${item.product.id}`}
                    onClick={() => handleRemoveItem(item.product.id, item.product.name, item.specialInstructions)}
                    className="p-1.5 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                  {/* Quantity adjustment */}
                  <div className="flex items-center gap-2 bg-stone-100 p-0.5 rounded-xl">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity - 1,
                          item.specialInstructions
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-white text-stone-700 flex items-center justify-center shadow-2xs hover:bg-stone-50 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity + 1,
                          item.specialInstructions
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-2xs hover:bg-amber-700 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="font-extrabold text-stone-900 text-sm sm:text-base">
                    {formatPrice(itemSubtotal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Order Summary
        </h4>

        <div className="space-y-2 text-sm text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal ({totalItems} items)</span>
            <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-stone-500">
            <span>Estimated Prep Time</span>
            <span>~10-20 minutes</span>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
          <span className="text-base font-bold text-stone-900">Total Amount</span>
          <span className="text-2xl font-black text-amber-700">{formatPrice(subtotal)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="pt-2">
        <button
          id="proceed-to-checkout-btn"
          onClick={onProceedToCheckout}
          className="w-full py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-base shadow-xl transition flex items-center justify-center gap-2 active:scale-98"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
