import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 flex items-center gap-3 rounded-2xl bg-amber-900/95 px-4 py-3 text-xs font-medium text-amber-100 shadow-xl backdrop-blur-md border border-amber-700/50"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 shrink-0">
        <WifiOff className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <span className="font-bold text-white block">Offline Mode</span>
        <span className="text-amber-200/90 text-[11px]">
          Viewing cached menu. Orders will sync when connection returns.
        </span>
      </div>
    </div>
  );
};
