import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Product, BusinessSettings } from '../../types';
import { useCart } from '../../context/CartContext';
import { MapPin, Clock, Phone, ChevronRight, Sparkles, Utensils, Award, ShieldCheck } from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface Props {
  onNavigateToMenu: (category?: string) => void;
  onNavigateToCart: () => void;
  onOpenAiChat?: (prompt?: string) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigateToMenu, onOpenAiChat }) => {
  const { formatPrice } = useCart();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [s, prods] = await Promise.all([api.getSettings(), api.getMenu()]);
        setSettings(s);
        setFeatured(prods.slice(0, 4));
      } catch (err) {
        console.error('Failed to load home data:', err);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900 text-white shadow-xl">
        <div className="absolute inset-0 opacity-25 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
            alt="Delicious Filipino Food"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative p-6 sm:p-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Antique&apos;s Local Eatery Favorite</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              {settings?.name || 'LOVELY EATERY'}
            </h1>
            <p className="text-amber-100 text-base sm:text-lg font-medium mt-1">
              &ldquo;{settings?.tagline || 'Delicious food, made for you.'}&rdquo;
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-2.5 sm:gap-3">
            <button
              id="hero-order-now-btn"
              onClick={() => onNavigateToMenu()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm shadow-lg transition active:scale-95"
            >
              <Utensils className="w-4 h-4" />
              <span>Order Now</span>
            </button>
            <button
              id="hero-view-menu-btn"
              onClick={() => onNavigateToMenu()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm backdrop-blur-xs border border-white/20 transition active:scale-95"
            >
              <span>View Full Menu</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Restaurant Information & Business Hours Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Location
            </span>
            <p className="text-xs font-semibold text-stone-800 leading-snug mt-0.5">
              {settings?.address || 'Business Park, Barangay 5, San Jose de Buenavista, Antique'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Operating Hours
            </span>
            <p className="text-xs font-semibold text-stone-800 leading-snug mt-0.5">
              {settings?.hours || 'Mon – Sun: 8:00 AM – 8:30 PM'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Contact Us
            </span>
            <p className="text-xs font-semibold text-stone-800 leading-snug mt-0.5">
              {settings?.phone || '+63 917 890 2345'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Chat Studio Interactive Concierge Banner */}
      {onOpenAiChat && (
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-sky-900 to-amber-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/15 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1.5 text-center sm:text-left z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Chat Studio • Powered by Gemini</span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white">
              Not sure what to order today?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
              Ask our AI Food Concierge for personalized dish recommendations, budget combos under
              ₱150, or meal pairings.
            </p>
          </div>
          <button
            id="home-ask-ai-banner-btn"
            onClick={() => onOpenAiChat()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0 z-10"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>Chat with AI</span>
          </button>
        </div>
      )}

      {/* Quick Category Browsing Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-stone-900 uppercase tracking-wide">
            Our Menu Categories
          </h2>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { name: 'Rice Meals', desc: 'Silog & Plates', emoji: '🍛' },
            { name: 'Main Dishes', desc: 'Antique Specialties', emoji: '🥘' },
            { name: 'Snacks', desc: 'Merienda Bites', emoji: '🥟' },
            { name: 'Drinks', desc: 'Chilled Drinks', emoji: '🍹' },
            { name: 'Desserts', desc: 'Sweet Delicacies', emoji: '🍮' },
          ].map((c) => (
            <button
              key={c.name}
              id={`quick-cat-${c.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onNavigateToMenu(c.name)}
              className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition text-left group"
            >
              <span className="text-2xl block mb-1.5">{c.emoji}</span>
              <span className="font-bold text-sm text-stone-900 block group-hover:text-amber-700">
                {c.name}
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">{c.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Specialties */}
      {featured.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-wide">
              Popular Specialties
            </h2>
            <span className="text-xs text-amber-700 font-bold">Chef Recommendations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {featured.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigateToMenu(item.category)}
                className="bg-white rounded-3xl p-3.5 border border-stone-200/80 shadow-xs hover:border-amber-300 transition cursor-pointer flex gap-3.5"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-stone-900 text-sm mt-1 line-clamp-1">
                      {item.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-stone-900 text-sm">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-xs font-semibold text-amber-600 group-hover:underline">
                      Order &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust & Local Hospitality Banner */}
      <div className="rounded-3xl p-5 bg-amber-50/70 border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-amber-900">
          <div className="p-3 rounded-2xl bg-amber-200/60 text-amber-800 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Cooked Fresh with Local Pride</h4>
            <p className="text-xs text-amber-800/80 mt-0.5">
              Supporting Antique farmers and purveyors. Every dish prepared fresh upon ordering.
            </p>
          </div>
        </div>

        <PWAInstallButton variant="button" label="Install Lovely Eatery App" />
      </div>
    </div>
  );
};
