import React, { useState } from 'react';
import { Product } from '../../types';
import { X, Plus, Minus, Clock, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { notify } from '../../utils/alert';

interface Props {
  product: Product;
  onClose: () => void;
}

const QUICK_INSTRUCTION_TAGS = [
  'Extra gravy / sauce',
  'Separate soup',
  'Spicy',
  'Mild / Less spicy',
  'Less oil',
  'No onions',
  'Extra crispy',
];

export const ProductDetailModal: React.FC<Props> = ({ product, onClose }) => {
  const { addToCart, formatPrice } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    if (!product.available) return;
    addToCart(product, quantity, specialInstructions);
    notify.toast(`${quantity}x ${product.name} added to order!`);
    setAddedAnimation(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  const handleTagToggle = (tag: string) => {
    if (specialInstructions.includes(tag)) {
      setSpecialInstructions(
        specialInstructions
          .replace(tag, '')
          .replace(/,\s*,/g, ',')
          .replace(/^,\s*|,\s*$/g, '')
          .trim()
      );
    } else {
      const updated = specialInstructions.trim()
        ? `${specialInstructions.trim()}, ${tag}`
        : tag;
      setSpecialInstructions(updated);
    }
  };

  const totalPrice = product.price * quantity;

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-card"
        className="w-full max-w-lg rounded-t-[32px] sm:rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-250 border border-stone-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Swipe / Grab Handle */}
        <div className="w-12 h-1.5 rounded-full bg-stone-300 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Large Food Image with floating close button & badges */}
        <div className="relative w-full h-52 sm:h-64 bg-stone-100 overflow-hidden shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            id="close-product-detail-btn"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Availability Badges */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-500/90 text-white text-xs font-black backdrop-blur-xs uppercase tracking-wider shadow-xs">
              {product.category}
            </span>
            {product.available ? (
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-xs">
                Available Fresh
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-xs">
                SOLD OUT
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4.5 flex-1 divide-y divide-stone-100">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                {product.name}
              </h2>
              <span className="text-xl sm:text-2xl font-black text-amber-800 shrink-0">
                {formatPrice(product.price)}
              </span>
            </div>

            {product.preparationTime && (
              <div className="flex items-center gap-1.5 text-stone-500 text-xs mt-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Preparation time: ~{product.preparationTime}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-2">
              {product.description || 'Authentic Antique recipe, prepared fresh upon ordering with quality local ingredients.'}
            </p>
          </div>

          {product.available ? (
            <div className="pt-3.5 space-y-4">
              {/* Ergonomic Quantity Selector (48px touch targets) */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                    Quantity
                  </span>
                  <span className="text-xs font-black text-stone-900">
                    Total: {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-stone-100 p-1 rounded-2xl border border-stone-200/80">
                  <button
                    id="decrease-qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-11 h-11 rounded-xl bg-white text-stone-800 flex items-center justify-center font-bold shadow-xs disabled:opacity-40 disabled:shadow-none active:scale-90 transition"
                    title="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-black text-base text-stone-900">
                    {quantity}
                  </span>
                  <button
                    id="increase-qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs hover:bg-amber-700 active:scale-90 transition"
                    title="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Special Instructions & Quick Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="special-instructions"
                    className="text-xs font-bold uppercase tracking-wider text-stone-500"
                  >
                    Kitchen Notes &amp; Preferences
                  </label>
                  <span className="text-[10px] text-stone-400">Optional</span>
                </div>

                {/* Quick Preference Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_INSTRUCTION_TAGS.map((tag) => {
                    const isSelected = specialInstructions.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>

                <input
                  id="special-instructions"
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder='e.g., "Less spicy, extra garlic, sauce on the side"'
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                  maxLength={120}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-medium">
              <span className="font-bold block text-sm mb-0.5">Currently Sold Out</span>
              This specialty viand is not available right now. Please explore other delicious dishes from our Antique menu!
            </div>
          )}
        </div>

        {/* Sticky Action Footer (High-Contrast 10% Accent CTA) */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200/80 shrink-0">
          {product.available ? (
            <button
              id="confirm-add-to-cart-btn"
              onClick={handleAdd}
              disabled={addedAnimation}
              className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 ${
                addedAnimation
                  ? 'bg-emerald-600 scale-98'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-900/20'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added to Order!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Order • {formatPrice(totalPrice)}</span>
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-4 px-6 rounded-2xl bg-stone-200 text-stone-500 font-bold text-sm cursor-not-allowed"
            >
              Currently Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
