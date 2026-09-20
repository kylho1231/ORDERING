import React, { useState } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  variant?: 'header' | 'banner' | 'button';
  label?: string;
  className?: string;
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'button', label, className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone PWA, hide install prompt
  if (isInstalled) {
    return null;
  }

  // Handle standard install prompt (Chrome, Edge, Android)
  if (isInstallable) {
    if (variant === 'header') {
      return (
        <button
          id="pwa-install-header-btn"
          onClick={install}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition active:scale-95 ${className}`}
          title="Install Lovely Eatery app on your home screen"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{label || 'Install App'}</span>
        </button>
      );
    }

    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-amber-700 transition active:scale-98 ${className}`}
      >
        <Smartphone className="w-4 h-4" />
        <span>{label || 'Install Lovely Eatery App'}</span>
      </button>
    );
  }

  // Handle iOS Safari guidance
  if (isIOS) {
    return (
      <>
        {variant === 'header' ? (
          <button
            id="pwa-install-ios-header-btn"
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium transition ${className}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install on iOS</span>
          </button>
        ) : (
          <button
            id="pwa-install-ios-btn"
            onClick={() => setShowIOSGuide(true)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/80 px-4 py-2.5 text-sm font-semibold text-amber-900 shadow-sm hover:bg-amber-100 transition ${className}`}
          >
            <Download className="w-4 h-4 text-amber-700" />
            <span>Install on iPhone / iPad</span>
          </button>
        )}

        {showIOSGuide && (
          <div
            id="ios-pwa-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              id="ios-pwa-modal-content"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    LE
                  </div>
                  <h3 className="text-base font-bold text-stone-900">Install Lovely Eatery</h3>
                </div>
                <button
                  id="close-ios-modal-btn"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-sm text-stone-700">
                <p className="text-xs text-stone-500">
                  Follow these simple steps in Safari to add Lovely Eatery to your home screen:
                </p>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                  <div className="p-2 rounded-lg bg-white shadow-xs text-amber-600 shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900">1. Tap Share button</span>
                    <p className="text-xs text-stone-600 mt-0.5">
                      At the bottom bar of Safari (or top right on iPad).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                  <div className="p-2 rounded-lg bg-white shadow-xs text-amber-600 shrink-0">
                    <PlusSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900">2. Select Add to Home Screen</span>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Scroll down and tap &quot;Add to Home Screen&quot;.
                    </p>
                  </div>
                </div>
              </div>

              <button
                id="dismiss-ios-guide-btn"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
