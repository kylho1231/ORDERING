import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../types';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Search, Plus, Minus, Ban, Sparkles, Clock, Utensils, Flame } from 'lucide-react';
import { ProductDetailModal } from './ProductDetailModal';
import { notify } from '../../utils/alert';

interface Props {
  initialCategory?: string;
  onNavigateToCart?: () => void;
  onOpenAiChat?: (prompt?: string) => void;
}

const getCategoryEmoji = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('rice') || c.includes('meal')) return '🥘';
  if (c.includes('noodle') || c.includes('pancit') || c.includes('soup')) return '🍜';
  if (c.includes('silog') || c.includes('breakfast') || c.includes('egg')) return '🍳';
  if (c.includes('dessert') || c.includes('halo') || c.includes('sweet')) return '🍧';
  if (c.includes('beverage') || c.includes('drink') || c.includes('juice')) return '🥤';
  if (c.includes('pork') || c.includes('beef') || c.includes('meat')) return '🥩';
  if (c.includes('chicken') || c.includes('inasal') || c.includes('bbq')) return '🍗';
  if (c.includes('seafood') || c.includes('fish')) return '🐟';
  return '🍽️';
};

export const MenuPage: React.FC<Props> = ({ initialCategory, onOpenAiChat }) => {
  const { items, addToCart, updateQuantity, removeFromCart, formatPrice } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [cats, prods] = await Promise.all([api.getCategories(), api.getMenu()]);
        setCategories(cats);
        setProducts(prods);
      } catch (e) {
        console.error('Failed to load menu:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Sticky Mobile Search & Category Rail (Frosted Blur + 8-Point Spacing) */}
      <div className="sticky top-14 z-30 bg-[#faf8f5]/95 backdrop-blur-md pt-2 pb-2.5 -mx-3.5 sm:-mx-6 px-3.5 sm:px-6 border-b border-stone-200/60 shadow-2xs">
        {/* Search Input with Integrated AI Guide Button */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="menu-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, silogs, merienda..."
              className="w-full pl-9.5 pr-14 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-stone-400 hover:text-stone-700 py-1 px-1.5"
              >
                Clear
              </button>
            )}
          </div>

          {onOpenAiChat && (
            <button
              id="menu-ask-ai-quick-btn"
              onClick={() =>
                onOpenAiChat(
                  selectedCategory === 'ALL'
                    ? 'What do you recommend for today from Lovely Eatery?'
                    : `What are your best recommended dishes under the ${selectedCategory} category?`
                )
              }
              className="px-3 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-amber-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0"
              title="Ask Lovely AI Concierge for recommendations"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">AI Recs</span>
              <span className="sm:hidden">AI</span>
            </button>
          )}
        </div>

        {/* Horizontal Category Carousel with Icons & Count */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold">
          <button
            id="cat-all-btn"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-102'
                : 'bg-white border border-stone-200/90 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span>🍽️</span>
            <span>All Dishes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'ALL'
                  ? 'bg-amber-700 text-amber-100'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {products.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.category.toLowerCase() === cat.name.toLowerCase()
            ).length;
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-102'
                    : 'bg-white border border-stone-200/90 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>{getCategoryEmoji(cat.name)}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-3.5 border border-stone-100 shadow-xs animate-pulse flex gap-3.5"
            >
              <div className="w-24 h-24 rounded-2xl bg-stone-200 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-full" />
                <div className="h-4 bg-stone-200 rounded w-1/3 pt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-xs my-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-stone-900 uppercase">No dishes found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            {searchQuery
              ? `No menu items matching "${searchQuery}". Try a different keyword.`
              : 'No items in this category currently.'}
          </p>
          {(searchQuery || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-xs"
            >
              Show All Menu
            </button>
          )}
        </div>
      ) : (
        /* Modern Mobile Food Grid (60/30/10 Rule & Frictionless Quick-Add Stepper) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProducts.map((product) => {
            const cartItem = items.find((ci) => ci.product.id === product.id);

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                onClick={() => setActiveProduct(product)}
                className={`group relative bg-white rounded-3xl p-3.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                  product.available
                    ? 'border-stone-200/80 hover:border-amber-300'
                    : 'border-stone-200 bg-stone-50/70 opacity-80'
                }`}
              >
                <div className="flex gap-3">
                  {/* Food Picture with Prep Badge */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {product.image.startsWith('data:image') && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded-full bg-amber-600/90 text-white text-[9px] font-black shadow-xs">
                        Fresh
                      </span>
                    )}
                  </div>

                  {/* Food Information */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                          {product.category}
                        </span>
                        {product.preparationTime && (
                          <span className="text-[10px] text-stone-400 font-medium flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-stone-400" />
                            {product.preparationTime}
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-sm text-stone-900 group-hover:text-amber-700 transition line-clamp-1 mt-1">
                        {product.name}
                      </h3>

                      <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {product.description || 'Authentic Antique recipe, prepared fresh daily.'}
                      </p>
                    </div>

                    {/* Price & In-Card Instant Add / Stepper */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100">
                      <span className="text-sm sm:text-base font-black text-amber-800">
                        {formatPrice(product.price)}
                      </span>

                      {/* Direct In-Card Add / Stepper Control */}
                      {product.available ? (
                        cartItem ? (
                          <div
                            className="flex items-center bg-amber-50 rounded-xl p-0.5 border border-amber-300 shadow-2xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              id={`card-dec-btn-${product.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (cartItem.quantity <= 1) {
                                  removeFromCart(product.id, cartItem.specialInstructions);
                                  notify.toast(`Removed ${product.name}`, 'info');
                                } else {
                                  updateQuantity(
                                    product.id,
                                    cartItem.quantity - 1,
                                    cartItem.specialInstructions
                                  );
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-white text-stone-900 flex items-center justify-center font-bold text-xs shadow-xs hover:bg-stone-50 active:scale-90 transition"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-black text-xs text-amber-950">
                              {cartItem.quantity}
                            </span>
                            <button
                              id={`card-inc-btn-${product.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(
                                  product.id,
                                  cartItem.quantity + 1,
                                  cartItem.specialInstructions
                                );
                                notify.toast(`Added another ${product.name}`);
                              }}
                              className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs hover:bg-amber-700 active:scale-90 transition"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`card-add-btn-${product.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, 1);
                              notify.toast(`${product.name} added to cart!`);
                            }}
                            className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs flex items-center gap-1 active:scale-95 transition"
                            title="Add 1 to cart"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Bottom-Sheet Modal */}
      {activeProduct && (
        <ProductDetailModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
        />
      )}
    </div>
  );
};
