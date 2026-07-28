import React, { useState } from 'react';
import { AppSettings, PageSize, PDFQuality } from '../types';
import { clearAllAppData } from '../utils/storageUtils';
import { 
  Settings as SettingsIcon, 
  Camera, 
  FileText, 
  Moon, 
  Lock, 
  Languages, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Grid, 
  Zap, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface SettingsScreenProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  setSettings,
  onResetData,
}) => {
  const [pinInput, setPinInput] = useState<string>(settings.appPinCode || '');
  const [showPinModal, setShowPinModal] = useState<boolean>(false);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'theme') {
        if (value === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return updated;
    });
  };

  const handleSavePin = () => {
    if (pinInput.length === 4) {
      setSettings((prev) => ({
        ...prev,
        appPinEnabled: true,
        appPinCode: pinInput,
      }));
      setShowPinModal(false);
    } else {
      alert('PIN code must be exactly 4 digits.');
    }
  };

  const handleDisablePin = () => {
    setSettings((prev) => ({
      ...prev,
      appPinEnabled: false,
      appPinCode: '',
    }));
    setPinInput('');
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear local storage cache? This will reset documents and settings.')) {
      clearAllAppData();
      onResetData();
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Application Settings</h3>
            <p className="text-xs text-slate-500">Camera defaults, PDF quality, security & theme</p>
          </div>
        </div>
      </div>

      {/* 1. Camera Settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Camera className="w-4 h-4" />
          <span>Camera & Edge Scanner</span>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Auto Capture</p>
              <p className="text-slate-400 text-[11px]">Automatically snap picture when document is stable</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoCapture}
              onChange={(e) => updateSetting('autoCapture', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Flash Default On</p>
              <p className="text-slate-400 text-[11px]">Enable flashlight automatically when opening scanner</p>
            </div>
            <input
              type="checkbox"
              checked={settings.flashDefault}
              onChange={(e) => updateSetting('flashDefault', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Grid Lines Overlay</p>
              <p className="text-slate-400 text-[11px]">Show alignment rule of thirds grid on camera view</p>
            </div>
            <input
              type="checkbox"
              checked={settings.gridLines}
              onChange={(e) => updateSetting('gridLines', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Save Original Raw Images</p>
              <p className="text-slate-400 text-[11px]">Keep raw uncropped camera photos for re-editing</p>
            </div>
            <input
              type="checkbox"
              checked={settings.saveOriginalImages}
              onChange={(e) => updateSetting('saveOriginalImages', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* 2. PDF Defaults */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>PDF Creation Defaults</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Default Page Size</label>
            <select
              value={settings.defaultPageSize}
              onChange={(e) => updateSetting('defaultPageSize', e.target.value as PageSize)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
            >
              <option value="A4">A4 Standard</option>
              <option value="Letter">US Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Default Quality</label>
            <select
              value={settings.defaultQuality}
              onChange={(e) => updateSetting('defaultQuality', e.target.value as PDFQuality)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
            >
              <option value="high">High Quality (100% DPI)</option>
              <option value="medium">Medium Quality (75% DPI)</option>
              <option value="small">Small File Size (Compressed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Security & App Lock */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Security & App Lock</span>
          </div>
          {settings.appPinEnabled && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
              PIN Protected
            </span>
          )}
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Passcode PIN Protection</p>
              <p className="text-slate-400 text-[11px]">Require 4-digit PIN to open application</p>
            </div>
            {settings.appPinEnabled ? (
              <button
                onClick={handleDisablePin}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 font-bold hover:bg-rose-500/20"
              >
                Disable PIN
              </button>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-900 font-bold shadow-xs hover:bg-amber-400"
              >
                Set PIN Code
              </button>
            )}
          </div>

          <label className="flex items-center justify-between cursor-pointer border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Biometric Unlock Simulation</p>
              <p className="text-slate-400 text-[11px]">Enable Fingerprint & Face ID unlock prompt</p>
            </div>
            <input
              type="checkbox"
              checked={settings.useBiometrics}
              onChange={(e) => updateSetting('useBiometrics', e.target.checked)}
              className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
            />
          </label>
        </div>
      </div>

      {/* 4. Theme & Language */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          <Moon className="w-4 h-4" />
          <span>Appearance & Language</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Theme Mode</label>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Interface Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Clear Storage Data */}
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between text-rose-700 dark:text-rose-400">
        <div>
          <p className="text-xs font-bold">Reset Application Cache</p>
          <p className="text-[11px] opacity-80">Clears all saved documents, folders, and preferences</p>
        </div>
        <button
          onClick={handleClearCache}
          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset All</span>
        </button>
      </div>

      {/* PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Set 4-Digit Security PIN</h3>
            <p className="text-xs text-slate-500">Enter a 4-digit passcode to lock the application:</p>

            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              autoFocus
              className="w-full text-center text-2xl font-mono tracking-widest p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-amber-500"
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>

              <button
                onClick={handleSavePin}
                className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-900 text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Save Passcode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
