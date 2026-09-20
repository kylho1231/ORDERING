import React, { useState } from 'react';
import {
  X,
  QrCode,
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  Check,
  Copy,
  ExternalLink,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { notify } from '../../utils/alert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'QR' | 'IOS' | 'ANDROID'>('QR');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://lovely-eatery.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    currentUrl
  )}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    notify.toast('App link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        notify.toast('Lovely Eatery installed successfully!');
        onClose();
      }
    } else {
      notify.toast('Use your browser menu (⋮ or Share) to Add to Home Screen', 'info');
    }
  };

  return (
    <div
      id="mobile-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="mobile-install-modal-content"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200/90 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/30">
              LE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Lovely Eatery Mobile</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  PWA Ready
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Install as a standalone smartphone application
              </p>
            </div>
          </div>

          {/* Quick Segment Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-4 bg-white/10 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('QR')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'QR' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>
            <button
              onClick={() => setActiveTab('IOS')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'IOS' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>🍎 iPhone</span>
            </button>
            <button
              onClick={() => setActiveTab('ANDROID')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'ANDROID' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>🤖 Android</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-5 space-y-4">
          {activeTab === 'QR' && (
            <div className="text-center space-y-3">
              <p className="text-xs text-stone-600 font-medium">
                Scan with your phone's camera to launch directly on your mobile device:
              </p>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 inline-block shadow-inner mx-auto">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for Lovely Eatery Mobile App"
                  className="w-48 h-48 rounded-xl object-contain mx-auto"
                />
              </div>

              <div className="flex items-center gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-600 font-mono truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'IOS' && (
            <div className="space-y-3 text-stone-700 text-xs">
              <h4 className="font-black text-stone-900 text-sm">How to install on iPhone & iPad:</h4>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 block">Open in Safari</span>
                    Open this URL in Safari on your iPhone or iPad.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 block flex items-center gap-1">
                      Tap Share <Share2 className="w-3.5 h-3.5 text-sky-600 inline" />
                    </span>
                    Tap the Share icon at the bottom of your Safari browser bar.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 block flex items-center gap-1">
                      Add to Home Screen <PlusSquare className="w-3.5 h-3.5 text-stone-800 inline" />
                    </span>
                    Scroll down and tap <strong>"Add to Home Screen"</strong>. Lovely Eatery will appear as a native app icon!
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'ANDROID' && (
            <div className="space-y-3 text-stone-700 text-xs">
              <h4 className="font-black text-stone-900 text-sm">How to install on Android (Chrome):</h4>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 block">Tap 1-Click Install Button</span>
                    Click the "Install Lovely Eatery App" button below to launch the native prompt.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 block">Or via Chrome Menu (⋮)</span>
                    Tap the three dots (⋮) in the top-right corner of Chrome, then tap <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
                  </div>
                </li>
              </ol>

              {isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App to Android Home Screen</span>
                </button>
              )}
            </div>
          )}

          {/* Capabilities Card */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-[11px] text-amber-900 font-medium">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span>Offline caching &amp; Instant Launch enabled</span>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              PWA 100%
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">San Jose de Buenavista, Antique</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
