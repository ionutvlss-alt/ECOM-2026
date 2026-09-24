import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Cloud,
  Settings,
  Sparkles,
  Smartphone,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { authService, AuthUser, DEFAULT_CREDENTIALS } from '../services/authService';
import {
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  FirebaseCustomConfig,
  initFirebase,
} from '../services/firebaseConfig';
import { Product } from '../types/product';

interface AuthModalProps {
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser, products: Product[]) => void;
  onLogout: () => void;
  onClose: () => void;
  productsCount: number;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onClose,
  productsCount,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'firebase_config'>('login');
  const [username, setUsername] = useState(DEFAULT_CREDENTIALS.username);
  const [password, setPassword] = useState(DEFAULT_CREDENTIALS.password);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Firebase manual config
  const [fbConfig, setFbConfig] = useState<FirebaseCustomConfig>(getStoredFirebaseConfig());
  const [fbSavedMsg, setFbSavedMsg] = useState<string | null>(null);

  // Handle Credentials Login (ionutvlss / ecom2026)
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { user, products } = await authService.loginWithCredentials(username, password);
      setSuccessMsg(`Autentificat cu succes ca ${user.displayName}! Produsele (${products.length}) au fost sincronizate.`);
      setTimeout(() => {
        onLoginSuccess(user, products);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Eroare la autentificare');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Auth Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { user, products } = await authService.loginWithGoogle();
      setSuccessMsg(`Autentificat cu Google: ${user.displayName}! Produsele (${products.length}) sunt sincronizate.`);
      setTimeout(() => {
        onLoginSuccess(user, products);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Eroare la conectarea cu Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Firebase Config Save
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredFirebaseConfig(fbConfig);
    const { isConfigured } = initFirebase();
    if (isConfigured) {
      setFbSavedMsg('Configurația Firebase a fost salvată și inițializată cu succes!');
    } else {
      setFbSavedMsg('Configurația a fost salvată. Asigură-te că ai introdus API Key și Project ID valide.');
    }
    setTimeout(() => setFbSavedMsg(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-5 text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-150">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0f4a3c] text-white flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {currentUser ? 'Contul Tău Sincronizat' : 'Autentificare & Sincronizare'}
              </h3>
              <p className="text-xs text-neutral-500">
                {currentUser
                  ? 'Produsele tale sunt salvate și accesibile de pe orice telefon sau PC.'
                  : 'Intră în cont pentru a accesa produsele de pe orice dispozitiv.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cazul când este deja autentificat */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#f5f9f6] border border-[#cfe5d9] rounded-xl flex items-center gap-3.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-12 h-12 rounded-full object-cover border border-[#0f4a3c]/20 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#0f4a3c] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-neutral-900 block truncate">
                  {currentUser.displayName}
                </span>
                <span className="text-xs text-neutral-500 block truncate">
                  @{currentUser.username} • {currentUser.email}
                </span>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-700">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Sincronizat în Cloud ({productsCount} produse)</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 space-y-1">
              <span className="font-bold text-neutral-800 block flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#0f4a3c]" />
                Cum intri de pe telefon:
              </span>
              <p>
                Deschide site-ul pe telefon, apasă pe <strong>„Intră în Cont”</strong> și folosește
                utilizatorul <strong>{currentUser.username}</strong>. Toate cele {productsCount}{' '}
                produse vor apărea instantaneu!
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Deconectare</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#0f4a3c] hover:bg-[#0c3b30] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Gata / Închide
              </button>
            </div>
          </div>
        ) : (
          /* Cazul când NU este autentificat */
          <div className="space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('login')}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-[#0f4a3c]" />
                <span>Conectare Cont</span>
              </button>
              <button
                onClick={() => setActiveTab('firebase_config')}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'firebase_config'
                    ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-[#0f4a3c]" />
                <span>Setări Firebase</span>
              </button>
            </div>

            {activeTab === 'login' && (
              <div className="space-y-4">
                {/* Formular Conectare ionutvlss */}
                <form onSubmit={handleCredentialsLogin} className="space-y-3">
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Cont prestabilit disponibil:</span>
                      <span className="text-[11px] opacity-90">
                        user: <strong>ionutvlss</strong> • parola: <strong>ecom2026</strong>
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-900 text-[10px] font-bold rounded">
                      Recomandat
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Nume Utilizator / User:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ionutvlss"
                        className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Parolă:
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#0f4a3c] hover:bg-[#0c3b30] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span>Conectează Contul & Sincronizează Produsele</span>
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-neutral-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-semibold text-neutral-400 uppercase">
                    sau
                  </span>
                  <div className="flex-grow border-t border-neutral-200"></div>
                </div>

                {/* Google Sign-in */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs hover:border-neutral-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Conectează-te cu Google (Firebase Auth)</span>
                </button>
              </div>
            )}

            {activeTab === 'firebase_config' && (
              <form onSubmit={handleSaveFirebaseConfig} className="space-y-3">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600">
                  Poți conecta direct proiectul tău de pe <strong>console.firebase.google.com</strong>{' '}
                  pentru a folosi autentificarea nativă Google Auth și baza de date Cloud Firestore.
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Firebase API Key:
                  </label>
                  <input
                    type="text"
                    value={fbConfig.apiKey}
                    onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Firebase Project ID:
                  </label>
                  <input
                    type="text"
                    value={fbConfig.projectId}
                    onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                    placeholder="my-ecom-project"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Auth Domain:
                  </label>
                  <input
                    type="text"
                    value={fbConfig.authDomain}
                    onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                    placeholder="my-ecom-project.firebaseapp.com"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  />
                </div>

                {fbSavedMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{fbSavedMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0f4a3c] hover:bg-[#0c3b30] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Salvează Configurația Firebase</span>
                </button>
              </form>
            )}

            {/* Error / Success Feedback */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
