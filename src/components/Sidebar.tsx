import React from 'react';
import {
  LayoutGrid,
  Package,
  Bookmark,
  BarChart2,
  Megaphone,
  FolderTree,
  Image as ImageIcon,
  Sparkles,
  TrendingUp,
  Smartphone,
  Cloud,
  LogIn,
  ShieldCheck,
  Building2,
  Lock,
  Tv
} from 'lucide-react';
import { AuthUser } from '../services/authService';

interface SidebarProps {
  currentTab: 'dashboard' | 'catalog' | 'kanban' | 'campaigns' | 'suppliers' | 'categories' | 'gallery' | 'ads-gallery' | 'reports';
  onTabChange: (tab: 'dashboard' | 'catalog' | 'kanban' | 'campaigns' | 'suppliers' | 'categories' | 'gallery' | 'ads-gallery' | 'reports') => void;
  productsCount: number;
  suppliersCount?: number;
  winnersCount: number;
  testingCount: number;
  userName?: string;
  userEmail?: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenDeviceSync?: () => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
  onLockAccess?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  productsCount,
  suppliersCount = 0,
  winnersCount,
  testingCount,
  userName = 'ionutvlss',
  userEmail = 'ionutvlss • E-commerce Workspace',
  isOpenMobile,
  onCloseMobile,
  onOpenDeviceSync,
  currentUser = null,
  onOpenAuth,
  onLockAccess,
}) => {
  const handleNav = (tab: typeof currentTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-neutral-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Brand Lockup */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#0f4a3c] flex items-center justify-center text-emerald-300 shadow-sm">
              <Sparkles className="w-5 h-5 fill-emerald-300/30" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-neutral-900 leading-tight">
                Collective
              </div>
              <div className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                PRODUCT & ADS JOURNAL
              </div>
            </div>
          </div>

          {/* Section: WORKSPACE */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase px-3 py-1.5">
              WORKSPACE
            </div>

            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => handleNav('catalog')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'catalog'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-4 h-4 ${currentTab === 'catalog' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
                <span>Produsele mele</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                {productsCount}
              </span>
            </button>

            <button
              onClick={() => handleNav('campaigns')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'campaigns'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Megaphone className={`w-4 h-4 ${currentTab === 'campaigns' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Campanii Ads</span>
            </button>

            <button
              onClick={() => handleNav('suppliers')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'suppliers'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className={`w-4 h-4 ${currentTab === 'suppliers' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
                <span>Contacte Furnizori</span>
              </div>
              {suppliersCount > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  {suppliersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('categories')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'categories'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <FolderTree className={`w-4 h-4 ${currentTab === 'categories' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Categorii</span>
            </button>

            <button
              onClick={() => handleNav('kanban')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'kanban'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${currentTab === 'kanban' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Workflow Campanii</span>
            </button>

            <button
              onClick={() => handleNav('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'reports'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <BarChart2 className={`w-4 h-4 ${currentTab === 'reports' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Rapoarte & ROAS</span>
            </button>
          </div>

          {/* Section: MEDIA */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase px-3 py-1.5">
              MEDIA & CREATIVURI
            </div>

            <button
              onClick={() => handleNav('ads-gallery')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'ads-gallery'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tv className={`w-4 h-4 ${currentTab === 'ads-gallery' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
                <span>Reclame & Preview</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-[#0f4a3c]">
                NOU
              </span>
            </button>

            <button
              onClick={() => handleNav('gallery')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                currentTab === 'gallery'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <ImageIcon className={`w-4 h-4 ${currentTab === 'gallery' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Galerie Foto</span>
            </button>
          </div>

          {/* Mini Widget Funnel */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Campanii Winner</span>
              </span>
              <span className="font-mono font-bold text-emerald-700">
                {winnersCount} / {productsCount}
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{
                  width: `${productsCount > 0 ? (winnersCount / productsCount) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-neutral-400 block">
              {testingCount} campanii active în testare
            </span>
          </div>

          {onOpenDeviceSync && (
            <button
              onClick={() => {
                onOpenDeviceSync();
                onCloseMobile();
              }}
              className="w-full p-2.5 bg-[#eaf3ee] hover:bg-[#d8ece1] border border-[#cfe5d9] rounded-xl text-xs font-semibold text-[#0f4a3c] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#0f4a3c]" />
              <span>Sincronizare Telefon (QR)</span>
            </button>
          )}
        </div>

        {/* User Profile Card & PIN 6122 Info */}
        <div className="p-4 border-t border-neutral-150 space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0f4a3c] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                IV
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-neutral-900 truncate">
                  Ionuț Vlăsceanu
                </div>
                <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold truncate">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>PIN 6122 Activ</span>
                </div>
              </div>
            </div>
            {onLockAccess && (
              <button
                onClick={() => {
                  onLockAccess();
                  onCloseMobile();
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                title="Blochează accesul pe acest dispozitiv (PIN 6122)"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
