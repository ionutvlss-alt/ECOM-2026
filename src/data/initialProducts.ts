import { Product, AdPlatform, CampaignStatus } from '../types/product';

export const INITIAL_PRODUCTS: Product[] = [];

export const DEFAULT_CATEGORIES: string[] = [
  'Gadgets & Tech',
  'Cosmetice & Beauty',
  'Casă & Curățenie',
  'Bucătărie & Electro',
  'Fitness & Sport',
  'Auto & Accesorii',
  'Îmbrăcăminte & Modă',
  'Jucării & Copii',
  'Animale de companie',
  'Altele'
];

export const AD_PLATFORMS: { id: string; label: string; badgeClass: string; borderClass: string }[] = [
  { id: 'Facebook Ads', label: 'Facebook Ads (Meta)', badgeClass: 'bg-blue-50 text-blue-700', borderClass: 'border-blue-200' },
  { id: 'TikTok Ads', label: 'TikTok Ads', badgeClass: 'bg-neutral-900 text-white', borderClass: 'border-neutral-800' },
  { id: 'Instagram Ads', label: 'Instagram Ads', badgeClass: 'bg-pink-50 text-pink-700', borderClass: 'border-pink-200' },
  { id: 'Google Ads', label: 'Google Ads', badgeClass: 'bg-red-50 text-red-700', borderClass: 'border-red-200' },
  { id: 'Pinterest Ads', label: 'Pinterest Ads', badgeClass: 'bg-rose-50 text-rose-700', borderClass: 'border-rose-200' },
  { id: 'Altele', label: 'Altă platformă', badgeClass: 'bg-purple-50 text-purple-700', borderClass: 'border-purple-200' },
];

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, { label: string; color: string; bg: string; border: string }> = {
  untested: {
    label: 'Netestat',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
  },
  winner: {
    label: 'Winner (Scalat)',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  testing: {
    label: 'În testare',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  promising: {
    label: 'Promițător (Break-even)',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  stopped: {
    label: 'Oprit (Necâștigător)',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
};
