import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, ShieldCheck, Smartphone, Laptop, Monitor, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { REQUIRED_ACCESS_PIN } from '../services/serverSyncService';

interface AccessPinModalProps {
  onSuccess: () => void;
}

export const AccessPinModal: React.FC<AccessPinModalProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus la încărcare
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleDigit = (digit: string) => {
    if (isVerifying || isSuccess) return;
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (isVerifying || isSuccess) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    if (isVerifying || isSuccess) return;
    setPin('');
    setError(null);
  };

  const verify = async (pinToTest: string) => {
    setIsVerifying(true);
    setError(null);

    // Mic delay pentru UX fluent
    await new Promise((r) => setTimeout(r, 200));

    if (pinToTest === REQUIRED_ACCESS_PIN) {
      setIsSuccess(true);
      if (rememberDevice) {
        try {
          localStorage.setItem('ecom_pin_authenticated_v1', 'true');
        } catch {}
      } else {
        try {
          sessionStorage.setItem('ecom_pin_authenticated_v1', 'true');
        } catch {}
      }

      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      setIsVerifying(false);
      setError('Cod incorect! Te rugăm să introduci codul unic configurat: 6122');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
    } else if (e.key === 'Enter' && pin.length === 4) {
      e.preventDefault();
      verify(pin);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col items-center text-center p-6 sm:p-8"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Header Icon */}
        <div className="relative mb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isSuccess 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' 
              : error 
              ? 'bg-rose-50 text-rose-600 border border-rose-200' 
              : 'bg-[#0f4a3c] text-white shadow-lg shadow-[#0f4a3c]/20'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8 animate-in zoom-in-75" />
            ) : isVerifying ? (
              <Unlock className="w-8 h-8 animate-pulse" />
            ) : (
              <Lock className="w-8 h-8 stroke-[2.2]" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-neutral-950 rounded-full p-1 border-2 border-white shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Acces Securizat Platformă
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-xs leading-relaxed">
          Introdu codul tău unic de acces pentru a sincroniza și vedea toate produsele tale pe orice dispozitiv.
        </p>

        {/* Device Badges */}
        <div className="mt-3.5 flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-full border border-neutral-200 text-[11px] font-semibold text-neutral-600">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
            Telefon
          </span>
          <span className="text-neutral-300">•</span>
          <span className="flex items-center gap-1">
            <Laptop className="w-3.5 h-3.5 text-neutral-500" />
            Laptop
          </span>
          <span className="text-neutral-300">•</span>
          <span className="flex items-center gap-1">
            <Monitor className="w-3.5 h-3.5 text-neutral-500" />
            PC
          </span>
        </div>

        {/* Hidden native input for keyboard capture */}
        <input
          ref={inputRef}
          type="tel"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
            setPin(val);
            if (val.length === 4) verify(val);
          }}
          className="opacity-0 absolute -z-10 w-0 h-0"
          autoFocus
        />

        {/* PIN Display Digits */}
        <div 
          onClick={() => inputRef.current?.focus()}
          className="mt-6 flex items-center justify-center gap-3 cursor-pointer py-2"
        >
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = pin.length > index;
            const isCurrent = pin.length === index;
            return (
              <div
                key={index}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-black transition-all duration-200 ${
                  isSuccess
                    ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                    : error
                    ? 'border-2 border-rose-400 bg-rose-50 text-rose-600 animate-shake'
                    : hasDigit
                    ? 'border-2 border-[#0f4a3c] bg-[#eaf3ee] text-[#0f4a3c] shadow-sm scale-102'
                    : isCurrent
                    ? 'border-2 border-[#0f4a3c] bg-white ring-4 ring-[#0f4a3c]/10'
                    : 'border-2 border-neutral-200 bg-neutral-50 text-neutral-300'
                }`}
              >
                {hasDigit ? (
                  <span className="animate-in zoom-in-50">{pin[index]}</span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                )}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {error ? (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-600 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : isSuccess ? (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Acces autorizat! Se încarcă produsele...</span>
          </div>
        ) : (
          <p className="mt-3 text-[11px] text-neutral-400">
            Cod prestabilit: <strong className="text-neutral-700 font-mono">6122</strong>
          </p>
        )}

        {/* Virtual Keypad for Phone/Touch devices */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-xl bg-neutral-100/80 hover:bg-neutral-200/80 active:bg-neutral-300 text-lg font-bold text-neutral-800 transition-colors cursor-pointer select-none flex items-center justify-center active:scale-95 shadow-2xs"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-500 transition-colors cursor-pointer select-none flex items-center justify-center active:scale-95"
            title="Șterge tot"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-neutral-100/80 hover:bg-neutral-200/80 active:bg-neutral-300 text-lg font-bold text-neutral-800 transition-colors cursor-pointer select-none flex items-center justify-center active:scale-95 shadow-2xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-base font-bold text-neutral-700 transition-colors cursor-pointer select-none flex items-center justify-center active:scale-95"
            title="Șterge ultima cifră"
          >
            ⌫
          </button>
        </div>

        {/* Remember on this device */}
        <label className="mt-5 flex items-center gap-2 text-xs text-neutral-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-[#0f4a3c] focus:ring-[#0f4a3c]"
          />
          <span>Rămâi conectat pe acest dispozitiv</span>
        </label>

        {/* Quick action button */}
        <button
          type="button"
          onClick={() => {
            if (pin.length === 4) {
              verify(pin);
            } else {
              setPin('6122');
              verify('6122');
            }
          }}
          disabled={isVerifying || isSuccess}
          className="mt-4 w-full py-3 px-4 rounded-xl bg-[#0f4a3c] hover:bg-[#0c3c31] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{pin.length === 4 ? 'Deblochează evidența' : 'Autentificare cu codul 6122'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
