import React from 'react';
import { Menu, Database, Smartphone, Cloud, UserCheck, LogIn } from 'lucide-react';
import { AuthUser } from '../services/authService';

interface HeaderBarProps {
  currentTab: string;
  onOpenMobileSidebar: () => void;
  onOpenExportImport: () => void;
  onOpenDeviceSync: () => void;
  onOpenAuth: () => void;
  currentUser: AuthUser | null;
  userName?: string;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Overview',
  catalog: 'Produsele mele',
  kanban: 'Workflow Campanii',
  campaigns: 'Campanii Ads (Facebook & TikTok)',
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
  currentUser,
  userName = 'ionutvlss',
}) => {
  return (
    <header className="h-14 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 md:hidden transition-colors cursor-pointer"
          title="Meniu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <span>Workspace</span>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900 font-semibold">
            {TAB_TITLES[currentTab] || 'Overview'}
          </span>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Auth / Cloud Sync Status Button */}
        {currentUser ? (
          <button
            onClick={onOpenAuth}
            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
            title="Cont conectat și sincronizat în Cloud"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">Cloud Activ</span>
            <span className="sm:hidden font-bold">Cloud</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-2.5 py-1.5 text-xs font-bold text-white bg-[#0f4a3c] hover:bg-[#0c3b30] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Autentificare cont pentru sincronizare automată pe telefon"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Intră în Cont</span>
          </button>
        )}

        <button
          onClick={onOpenDeviceSync}
          className="px-2.5 py-1.5 text-xs font-semibold text-[#0f4a3c] bg-[#eaf3ee] hover:bg-[#d9ece1] rounded-lg flex items-center gap-1.5 border border-[#cfe5d9] transition-colors cursor-pointer shadow-2xs"
          title="Sincronizare între telefon și calculator"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#0f4a3c]" />
          <span className="hidden md:inline">Transfer QR</span>
        </button>

        <button
          onClick={onOpenExportImport}
          className="px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg flex items-center gap-1.5 border border-neutral-200 transition-colors cursor-pointer"
          title="Backup & Export date"
        >
          <Database className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden lg:inline">Backup</span>
        </button>

        <div className="w-px h-4 bg-neutral-200 mx-0.5 sm:mx-1" />

        {/* User Profile avatar */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer text-left"
          title="Gestionează contul"
        >
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              className="w-7 h-7 rounded-full object-cover border border-[#0f4a3c]/30 shadow-xs"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#0f4a3c] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentUser ? currentUser.displayName.slice(0, 2).toUpperCase() : 'IV'}
            </div>
          )}
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-neutral-800 leading-tight">
              {currentUser ? currentUser.username : userName}
            </span>
            <span className="text-[10px] text-neutral-400 leading-tight">
              {currentUser ? 'Cont conectat' : 'Guest'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
