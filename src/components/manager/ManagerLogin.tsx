import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, ArrowLeft, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { notify } from '../../utils/alert';

interface Props {
  onBackToCustomer: () => void;
  onLoginSuccess: () => void;
}

export const ManagerLogin: React.FC<Props> = ({ onBackToCustomer, onLoginSuccess }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [pin, setPin] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager'>('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    const ok = await login(pin, selectedRole);
    if (ok) {
      notify.toast(`Welcome, ${selectedRole === 'admin' ? 'Administrator' : 'Manager'}!`);
      onLoginSuccess();
    } else {
      notify.error('Access Denied', `Incorrect PIN for ${selectedRole === 'admin' ? 'Admin' : 'Manager'}. Try lovely123`);
    }
  };

  const handleQuickDemoLogin = async (role: 'admin' | 'manager') => {
    const demoPin = role === 'manager' ? '1234' : 'lovely123';
    const ok = await login(demoPin, role);
    if (ok) {
      notify.toast(`Logged in as ${role === 'admin' ? 'Administrator' : 'Manager'}`);
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1917] text-stone-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCustomer}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-white transition py-2 px-3 rounded-xl bg-stone-900 border border-stone-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Customer View</span>
        </button>
        <span className="text-[11px] font-bold tracking-widest text-amber-500 uppercase">
          Management &amp; POS
        </span>
      </div>

      {/* Main card */}
      <div className="w-full max-w-sm mx-auto my-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Lovely Eatery
          </h1>
          <p className="text-xs text-stone-400">
            Select your role to access restaurant controls
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-900/90 rounded-2xl border border-stone-800">
          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition text-center flex flex-col items-center gap-0.5 ${
              selectedRole === 'admin'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>👑 Admin</span>
            <span className="text-[9px] font-normal opacity-90">Add menus &amp; photos</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('manager')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition text-center flex flex-col items-center gap-0.5 ${
              selectedRole === 'manager'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>💼 Manager</span>
            <span className="text-[9px] font-normal opacity-90">Set selling prices</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="manager-pin" className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              Enter {selectedRole === 'admin' ? 'Admin' : 'Manager'} PIN / Password
            </label>
            <div className="relative">
              <input
                id="manager-pin"
                type="password"
                value={pin}
                onChange={(e) => {
                  clearError();
                  setPin(e.target.value);
                }}
                placeholder={selectedRole === 'admin' ? 'Default Admin PIN: lovely123' : 'Default Manager PIN: 1234'}
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl bg-stone-900 border border-stone-800 text-white placeholder-stone-600 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
              />
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-600" />
            </div>
          </div>

          <button
            id="manager-login-submit-btn"
            type="submit"
            disabled={isLoading || !pin}
            className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-sm shadow-lg shadow-amber-900/30 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 min-h-[48px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying PIN...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Log In as {selectedRole === 'admin' ? 'Administrator' : 'Manager'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Helpers for both roles */}
        <div className="pt-4 border-t border-stone-800/80 space-y-2">
          <p className="text-[11px] text-stone-400 text-center font-bold">
            Quick One-Tap Demo Access:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="quick-demo-admin-btn"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-900/60 text-amber-400 font-bold text-xs transition text-center"
            >
              👑 Admin (lovely123)
            </button>
            <button
              type="button"
              id="quick-demo-manager-btn"
              onClick={() => handleQuickDemoLogin('manager')}
              className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-sky-900/60 text-sky-400 font-bold text-xs transition text-center"
            >
              💼 Manager (1234)
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-stone-600 pb-2">
        Lovely Eatery Android POS • San Jose de Buenavista, Antique
      </div>
    </div>
  );
};
