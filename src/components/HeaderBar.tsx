import React from 'react';
import { Menu, Database, Smartphone, Cloud, RefreshCw, Lock, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../services/authService';
import { ServerSyncState } from '../services/serverSyncService';

interface HeaderBarProps {
  currentTab: string;
  onOpenMobileSidebar: () => void;
  onOpenExportImport: () => void;
  onOpenDeviceSync: () => void;
  onOpenAuth: () => void;
  onManualSync?: () => void;
  onLockAccess?: () => void;
  isSyncing?: boolean;
  syncState?: ServerSyncState;
  isFirestoreConnected?: boolean;
  currentUser: AuthUser | null;
  userName?: string;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Overview',
  catalog: 'Produsele mele',
  kanban: 'Workflow Campanii',
  campaigns: 'Campanii Ads (Facebook & TikTok)',
  suppliers: 'Contacte Furnizori',
  categories: 'Categorii Produse',
  gallery: 'Galerie Foto',
  reports: 'Rapoarte & ROAS',
};

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenExportImport,
  onOpenDeviceSync,
  onOpenAuth,
  onManualSync,
  onLockAccess,
  isSyncing = false,
  syncState,
  currentUser,
  userName = 'ionutvlss',
}) => {
  return (
    <header className="h-14 border-b border-neutral-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 md:hidden transition-colors cursor-pointer"
          title="Meniu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <span className="hidden sm:inline">Workspace</span>
          <span className="text-neutral-300 hidden sm:inline">/</span>
          <span className="text-neutral-900 font-bold text-xs sm:text-sm">
            {TAB_TITLES[currentTab] || 'Overview'}
          </span>
        </div>
      </div>

      {/* Right: Actions, Cloud Sync Status & Lock */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Real-time Firebase Cloud Sync button with animated pulse */}
        <button
          onClick={onManualSync}
          disabled={isSyncing}
          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100/90 active:scale-95 rounded-xl flex items-center gap-1.5 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
          title="Baza de date Google Cloud Firestore activă pe proiectul review-tracker-b3291. Sincronizare în timp real între Telefon, PC și Laptop."
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="hidden md:inline font-bold">
              {isSyncing ? 'Se sincronizează...' : 'Firebase Cloud Activ'}
            </span>
            <span className="md:hidden font-bold">{isSyncing ? '...' : 'Cloud'}</span>
          </div>
        </button>

        {/* PIN 6122 Lock Button */}
        {onLockAccess && (
          <button
            onClick={onLockAccess}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl flex items-center gap-1.5 border border-neutral-200 transition-colors cursor-pointer"
            title="Blochează accesul pe acest dispozitiv (necesită PIN 6122 pentru deblocare)"
          >
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden lg:inline">PIN 6122</span>
          </button>
        )}

        {/* Mobile Device QR */}
        <button
          onClick={onOpenDeviceSync}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-[#0f4a3c] bg-[#eaf3ee] hover:bg-[#d9ece1] rounded-xl flex items-center gap-1.5 border border-[#cfe5d9] transition-colors cursor-pointer shadow-2xs"
          title="Transfer instant prin cod QR pe telefon"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#0f4a3c]" />
          <span className="hidden sm:inline font-medium">QR Mobil</span>
        </button>

        {/* Backup button */}
        <button
          onClick={onOpenExportImport}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl flex items-center gap-1.5 border border-neutral-200 transition-colors cursor-pointer"
          title="Backup & Export date complete"
        >
          <Database className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden xl:inline">Backup</span>
        </button>

        <div className="w-px h-4 bg-neutral-200 mx-0.5" />

        {/* User Profile avatar */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer text-left"
          title="Profil & Administrare cont"
        >
          <div className="w-7 h-7 rounded-full bg-[#0f4a3c] text-white font-bold text-xs flex items-center justify-center shadow-2xs border border-[#0f4a3c]/30">
            IV
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-neutral-800 leading-tight">
              {currentUser?.displayName || 'Ionuț Vlăsceanu'}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold leading-tight flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>Acces Unic 6122</span>
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
