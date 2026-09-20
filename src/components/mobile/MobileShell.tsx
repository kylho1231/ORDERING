import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Maximize2,
  Minimize2,
  QrCode,
  RotateCcw,
  Sparkles,
  Wifi,
  Download,
} from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { MobileInstallModal } from './MobileInstallModal';

interface Props {
  children: React.ReactNode;
}

export const MobileShell: React.FC<Props> = ({ children }) => {
  // Check if screen is small (natural mobile phone)
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Mobile device frame simulation mode on desktop
  const [isPhoneFrame, setIsPhoneFrame] = useState(() => {
    if (typeof window !== 'undefined') {
      // If mobile screen, default to full viewport; if desktop, default to phone frame simulation
      return window.innerWidth >= 768;
    }
    return true;
  });

  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Responsive resize listener
  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth < 768;
      setIsSmallScreen(small);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  const handleRestart = () => {
    setShowSplash(true);
    setTimeout(() => {
      setShowSplash(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-900 flex flex-col justify-center items-center relative selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
      {/* Subtle modern ambient background blur on desktop */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Desktop Floating Device Controller Bar */}
      {!isSmallScreen && (
        <aside
          aria-label="Mobile Simulation Controls"
          className="fixed top-3 z-50 flex items-center gap-2 bg-stone-950/90 text-white px-3 py-1.5 rounded-full border border-stone-800 shadow-2xl backdrop-blur-md text-xs"
        >
          <div className="flex items-center gap-1.5 pr-2 border-r border-stone-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-stone-300">Lovely Eatery Mobile</span>
          </div>

          {/* Toggle Phone Frame / Full View */}
          <button
            id="toggle-phone-frame-btn"
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition active:scale-95 ${
              isPhoneFrame
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
            title="Toggle Smartphone Mockup Frame vs Full Responsive View"
          >
            {isPhoneFrame ? (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone View</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand View</span>
              </>
            )}
          </button>

          {/* Install / QR Code Button */}
          <button
            id="open-qr-install-btn"
            onClick={() => setInstallModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold transition active:scale-95"
            title="Scan QR code to open on your actual mobile phone"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan QR / Install</span>
          </button>

          {/* Simulate Refresh */}
          <button
            onClick={handleRestart}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition active:scale-90"
            title="Restart Mobile App"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Main Container: either Phone Frame on Desktop OR Full Viewport */}
      {isPhoneFrame && !isSmallScreen ? (
        /* Realistic Smartphone Bezel Simulation */
        <div className="relative my-10 w-full max-w-[425px] h-[890px] max-h-[94vh] bg-black rounded-[52px] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_12px_#262626,0_0_0_14px_#404040] flex flex-col justify-between transition-all duration-300">
          {/* External phone hardware details */}
          {/* Volume rocker notch */}
          <div className="absolute -left-[14px] top-24 w-[3px] h-12 bg-stone-600 rounded-l-sm" />
          <div className="absolute -left-[14px] top-40 w-[3px] h-12 bg-stone-600 rounded-l-sm" />
          {/* Power button notch */}
          <div className="absolute -right-[14px] top-32 w-[3px] h-16 bg-stone-600 rounded-r-sm" />

          {/* Inner Phone Screen */}
          <div className="relative w-full h-full bg-[#faf8f5] rounded-[42px] overflow-hidden flex flex-col shadow-inner transform-gpu">
            {/* Native Mobile Status Bar */}
            <MobileStatusBar className="bg-[#faf8f5] shrink-0" />

            {/* App Screen Content with native scroll */}
            <div className="flex-1 overflow-y-auto no-scrollbar mobile-scroll relative">
              {children}

              {/* Mobile App Splash Screen Overlay */}
              {showSplash && (
                <div className="absolute inset-0 z-50 bg-stone-950 text-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-amber-600/40 mb-4 animate-bounce-soft">
                    LE
                  </div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-white">
                    Lovely Eatery
                  </h1>
                  <p className="text-xs text-stone-400 mt-1">San Jose de Buenavista, Antique</p>
                  <div className="mt-8 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Launching mobile app...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Native Mobile Home Indicator Bar */}
            <div className="w-full pt-1 pb-2 bg-[#faf8f5] shrink-0 flex items-center justify-center z-40 border-t border-stone-200/40">
              <div className="w-32 h-1 bg-stone-400/80 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* Full Viewport Mobile Experience (for actual mobile devices or expanded desktop mode) */
        <div className="w-full min-h-screen bg-[#faf8f5] flex flex-col relative">
          {/* Mobile Status Bar for small screens */}
          {isSmallScreen && <MobileStatusBar className="bg-white/95 backdrop-blur-md sticky top-0" />}

          <div className="flex-1 w-full relative">
            {children}

            {/* Mobile App Splash Screen Overlay */}
            {showSplash && (
              <div className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-amber-600/40 mb-4 animate-bounce-soft">
                  LE
                </div>
                <h1 className="text-xl font-black uppercase tracking-tight text-white">
                  Lovely Eatery
                </h1>
                <p className="text-xs text-stone-400 mt-1">San Jose de Buenavista, Antique</p>
                <div className="mt-8 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Launching mobile app...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator Bar on small screens */}
          {isSmallScreen && (
            <div className="fixed bottom-0 left-0 right-0 py-1 bg-white/90 backdrop-blur-md flex items-center justify-center z-40 pointer-events-none">
              <div className="w-32 h-1 bg-stone-400/80 rounded-full" />
            </div>
          )}
        </div>
      )}

      {/* Mobile Install & QR Code Modal */}
      <MobileInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </div>
  );
};
