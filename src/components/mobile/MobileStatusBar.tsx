import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles } from 'lucide-react';

interface Props {
  className?: string;
  theme?: 'light' | 'dark';
}

export const MobileStatusBar: React.FC<Props> = ({ className = '', theme = 'light' }) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${hours}:${formattedMinutes}`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const isDark = theme === 'dark';

  return (
    <div
      id="mobile-status-bar"
      className={`w-full px-6 py-2 select-none flex items-center justify-between text-xs font-semibold tracking-tight transition-colors z-30 ${
        isDark ? 'text-white' : 'text-stone-800'
      } ${className}`}
    >
      {/* Time */}
      <div className="w-16 flex items-center font-bold text-[13px] tracking-tight">
        {currentTime || '9:41'}
      </div>

      {/* Dynamic Island / Pill camera cutout */}
      <div className="flex-1 flex justify-center">
        <div className="h-5 px-3 rounded-full bg-black text-white flex items-center gap-2 shadow-xs transition-all hover:scale-105">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
            Lovely Eatery
          </span>
          <div className="w-2.5 h-2.5 rounded-full bg-stone-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-stone-900" />
          </div>
        </div>
      </div>

      {/* Connectivity Icons */}
      <div className="w-16 flex items-center justify-end gap-1.5 text-[11px]">
        <span className="font-extrabold text-[10px] tracking-tighter mr-0.5">5G</span>
        <div className="flex items-end gap-0.5 h-3">
          <span className="w-0.5 h-1.5 bg-current rounded-full" />
          <span className="w-0.5 h-2 bg-current rounded-full" />
          <span className="w-0.5 h-2.5 bg-current rounded-full" />
          <span className="w-0.5 h-3 bg-current rounded-full" />
        </div>
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
        <div className="flex items-center gap-0.5">
          <div className="w-5 h-2.5 rounded-[3px] border border-current p-0.5 flex items-center">
            <div className="h-full w-3.5 bg-current rounded-[1px]" />
          </div>
          <div className="w-0.5 h-1 bg-current rounded-r-xs" />
        </div>
      </div>
    </div>
  );
};
