import React, { useState, useEffect } from 'react';
import { BusinessSettings } from '../../types';
import { api } from '../../services/api';
import { Store, Save, CheckCircle2, Phone, MapPin, Clock, FileText, Sparkles } from 'lucide-react';
import { notify } from '../../utils/alert';

export const ManagerSettings: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await api.getSettings();
        setSettings(s);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSavedSuccess(true);
      notify.toast('Restaurant settings saved successfully!');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      notify.error('Save Failed', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight uppercase">
          Restaurant Settings
        </h1>
        <p className="text-xs text-stone-500">Business details printed on official receipts &amp; web</p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-stone-600 mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-600" /> Restaurant Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-600 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Tagline / Slogan
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-600 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> Business Location (Antique, Philippines)
            </label>
            <textarea
              rows={2}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-600 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-600" /> Phone Number
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-600 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Operating Hours
              </label>
              <input
                type="text"
                value={settings.hours}
                onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-600 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" /> Thermal Receipt Footer Message
            </label>
            <input
              type="text"
              value={settings.receipt_footer}
              onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
            <div>
              <span className="font-bold text-stone-700 block">Currency Display</span>
              <span className="text-[11px] text-stone-400">Philippine Peso ({settings.currency_symbol} {settings.currency_code})</span>
            </div>
            <span className="font-black text-amber-800 bg-amber-50 px-3 py-1 rounded-xl text-sm border border-amber-200">
              ₱ PHP
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-98 min-h-[48px]"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
};
