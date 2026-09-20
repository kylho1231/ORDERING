import React, { useState } from 'react';
import { Download, Smartphone, QrCode } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { MobileInstallModal } from '../mobile/MobileInstallModal';

interface Props {
  variant?: 'header' | 'banner' | 'button';
  label?: string;
  className?: string;
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'button', label, className = '' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  // If already running in standalone PWA, hide install prompt
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      {variant === 'header' ? (
        <button
          id="pwa-install-header-btn"
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition active:scale-95 ${className}`}
          title="Install Lovely Eatery app on your smartphone or desktop"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{label || 'Install'}</span>
        </button>
      ) : (
        <button
          id="pwa-install-btn"
          onClick={handleClick}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 text-xs sm:text-sm font-black text-white shadow-md hover:bg-amber-700 transition active:scale-98 ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{label || 'Install Lovely Eatery Mobile App'}</span>
        </button>
      )}

      <MobileInstallModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

