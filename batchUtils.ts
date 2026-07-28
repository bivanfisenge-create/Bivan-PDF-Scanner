import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Lock, Fingerprint, Delete, ShieldCheck } from 'lucide-react';

interface SecurityLockModalProps {
  settings: AppSettings;
  onUnlockSuccess: () => void;
}

export const SecurityLockModal: React.FC<SecurityLockModalProps> = ({
  settings,
  onUnlockSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        if (nextPin === settings.appPinCode) {
          onUnlockSuccess();
        } else {
          setErrorMsg('Incorrect PIN. Try again.');
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometricUnlock = () => {
    // Simulate instant successful fingerprint / Face ID scan
    onUnlockSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-xs space-y-6 text-center">
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-lg font-bold">PDF Scanner Locked</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your 4-digit passcode to unlock</p>
        </div>

        {/* PIN Dots */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-400/50'
                  : 'border-slate-700 bg-slate-900'
              }`}
            />
          ))}
        </div>

        {errorMsg && <p className="text-xs font-bold text-rose-400 animate-bounce">{errorMsg}</p>}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-amber-500 active:text-slate-900 text-lg font-bold transition-all flex items-center justify-center mx-auto"
            >
              {num}
            </button>
          ))}

          {/* Biometrics */}
          {settings.useBiometrics ? (
            <button
              onClick={handleBiometricUnlock}
              className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-800 hover:bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto"
              title="Biometric Fingerprint Unlock"
            >
              <Fingerprint className="w-6 h-6" />
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-amber-500 active:text-slate-900 text-lg font-bold transition-all flex items-center justify-center mx-auto"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center mx-auto"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
