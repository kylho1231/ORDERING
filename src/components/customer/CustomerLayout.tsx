import React from 'react';
import {
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { OfflineIndicator } from '../common/OfflineIndicator';

export type CustomerTab = 'HOME' | 'MENU' | 'CART' | 'ORDERS';

interface Props {
  activeTab: CustomerTab;
  onTabChange: (tab: CustomerTab) => void;
  children: React.ReactNode;
  onSwitchToManager: () => void;
  onOpenAiChat?: () => void;
}

export const CustomerLayout: React.FC<Props> = ({
  activeTab,
  onTabChange,
  children,
  onSwitchToManager,
  onOpenAiChat,
}) => {
  const { totalItems, subtotal, formatPrice } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-800 font-sans pb-28 selection:bg-amber-100 selection:text-amber-900">
      {/* Offline connectivity banner */}
      <OfflineIndicator />

      {/* Top Mobile Header Bar (60/30/10 Color Harmony & Ergonomics) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/70 px-3.5 sm:px-4 py-2.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & Location Indicator */}
          <div
            onClick={() => onTabChange('HOME')}
            className="flex items-center gap-2.5 cursor-pointer select-none group min-w-0"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-amber-600/20 shrink-0 group-hover:scale-105 transition-transform">
              LE
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-stone-900 text-sm sm:text-base tracking-tight uppercase truncate">
                  Lovely Eatery
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                <span>San Jose de Buenavista, Antique</span>
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <PWAInstallButton variant="header" label="Install" />

            {/* AI Studio Assistant Button */}
            {onOpenAiChat && (
              <button
                id="header-ai-studio-btn"
                onClick={onOpenAiChat}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-amber-600 text-white hover:opacity-95 text-xs font-bold transition shadow-xs active:scale-95"
                title="Lovely AI Culinary Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="hidden sm:inline">AI Studio</span>
              </button>
            )}

            {/* Staff / Admin Portal Access */}
            <button
              id="switch-to-manager-btn"
              onClick={onSwitchToManager}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-900 text-amber-400 hover:bg-stone-800 text-xs font-bold transition shadow-xs active:scale-95"
              title="Admin & POS Management Portal"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            {/* Quick Cart Trigger in Header */}
            <button
              id="header-cart-btn"
              onClick={() => onTabChange('CART')}
              className="relative p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition active:scale-95 ml-0.5"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3.5 sm:p-6">{children}</main>

      {/* Floating "Quick Cart" Bottom Pill (Peak-End Rule & Emotional E-commerce UX) */}
      {totalItems > 0 && activeTab !== 'CART' && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              id="floating-quick-cart-bar"
              onClick={() => onTabChange('CART')}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white font-black text-xs sm:text-sm shadow-xl shadow-stone-900/30 border border-amber-500/30 flex items-center justify-between gap-2 hover:opacity-95 active:scale-98 transition transform duration-150 animate-in slide-in-from-bottom-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xs shadow-xs">
                  {totalItems}
                </div>
                <div className="text-left">
                  <span className="block text-white leading-tight">
                    {totalItems} {totalItems === 1 ? 'item selected' : 'items selected'}
                  </span>
                  <span className="text-[10px] text-amber-300 font-normal">
                    Ready to place order
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-amber-400">
                  {formatPrice(subtotal)}
                </span>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Floating AI Studio FAB */}
      {onOpenAiChat && (
        <button
          id="floating-ai-studio-fab"
          onClick={onOpenAiChat}
          className="fixed bottom-36 right-4 sm:bottom-24 sm:right-8 z-30 flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-blue-600 via-sky-600 to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 border border-white/30 backdrop-blur-xs group"
          title="Open AI Chat Studio"
          aria-label="Chat with Lovely AI Concierge"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="tracking-tight hidden sm:inline">AI Food Guide</span>
        </button>
      )}

      {/* Floating Mobile Bottom Navigation Dock (Ergonomic 8-Point Grid) */}
      <nav
        id="customer-bottom-nav"
        className="fixed bottom-2 left-0 right-0 z-40 px-3 pointer-events-none"
      >
        <div className="max-w-md mx-auto pointer-events-auto bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-3xl p-1.5 shadow-2xl shadow-stone-900/15">
          <div className="grid grid-cols-4 gap-1">
            {/* Home Tab */}
            <button
              id="nav-home-btn"
              onClick={() => onTabChange('HOME')}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all min-h-[48px] ${
                activeTab === 'HOME'
                  ? 'bg-amber-500/15 text-amber-900 font-black'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Home className={`w-5 h-5 transition-transform ${activeTab === 'HOME' ? 'scale-110 text-amber-700 stroke-[2.5]' : ''}`} />
              <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Home</span>
            </button>

            {/* Menu Tab */}
            <button
              id="nav-menu-btn"
              onClick={() => onTabChange('MENU')}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all min-h-[48px] ${
                activeTab === 'MENU'
                  ? 'bg-amber-500/15 text-amber-900 font-black'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <UtensilsCrossed
                className={`w-5 h-5 transition-transform ${activeTab === 'MENU' ? 'scale-110 text-amber-700 stroke-[2.5]' : ''}`}
              />
              <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Menu</span>
            </button>

            {/* Cart Tab with Badge */}
            <button
              id="nav-cart-btn"
              onClick={() => onTabChange('CART')}
              className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all min-h-[48px] ${
                activeTab === 'CART'
                  ? 'bg-amber-500/15 text-amber-900 font-black'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <div className="relative">
                <ShoppingBag
                  className={`w-5 h-5 transition-transform ${activeTab === 'CART' ? 'scale-110 text-amber-700 stroke-[2.5]' : ''}`}
                />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-amber-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Cart</span>
            </button>

            {/* Orders Tab */}
            <button
              id="nav-orders-btn"
              onClick={() => onTabChange('ORDERS')}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all min-h-[48px] ${
                activeTab === 'ORDERS'
                  ? 'bg-amber-500/15 text-amber-900 font-black'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Clock className={`w-5 h-5 transition-transform ${activeTab === 'ORDERS' ? 'scale-110 text-amber-700 stroke-[2.5]' : ''}`} />
              <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Orders</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};
