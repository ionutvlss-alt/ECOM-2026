import { Product } from '../types/product';

export const INITIAL_PRODUCTS: Product[] = [];

export const CATEGORIES_LIST = [
  'Tech & Gadgets',
  'Audio & Video',
  'Smart Home & Electro',
  'Cosmetice & Beauty',
  'Bucătărie & Cafea',
  'Fitness & Sport',
  'Auto & Accesorii',
  'Altele'
] as const;

export const STATUS_LABELS: Record<string, { label: string; desc: string }> = {
  to_test: { label: 'De testat', desc: 'În lista de dorințe / În așteptare' },
  testing: { label: 'În testare', desc: 'Test activ în desfășurare' },
  tested: { label: 'Testat & Evaluat', desc: 'Recenzie finalizată' },
  rejected: { label: 'Respins / Renunțat', desc: 'Testare oprită sau produs returnat' },
};

export const SPONSORSHIP_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  personal: { label: 'Achiziție personală', color: 'text-neutral-600', bg: 'bg-neutral-100 border-neutral-200' },
  sponsored: { label: 'Parteneriat plătit (Reclamă)', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  pr_gift: { label: 'PR Sample / Primit în teste', color: 'text-teal-800', bg: 'bg-teal-50 border-teal-200' },
  affiliate: { label: 'Campanie afiliată', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
};

export const VERDICT_LABELS: Record<string, { label: string; color: string; border: string }> = {
  highly_recommended: {
    label: 'Recomand cu căldură',
    color: 'text-emerald-700',
    border: 'border-emerald-200 bg-emerald-50'
  },
  recommended: {
    label: 'Recomandat',
    color: 'text-teal-700',
    border: 'border-teal-200 bg-teal-50'
  },
  wait_for_sale: {
    label: 'Merită doar la reducere',
    color: 'text-amber-700',
    border: 'border-amber-200 bg-amber-50'
  },
  neutral: {
    label: 'Neutru / Cu rezerve',
    color: 'text-neutral-700',
    border: 'border-neutral-200 bg-neutral-50'
  },
  not_recommended: {
    label: 'Nu recomand',
    color: 'text-rose-700',
    border: 'border-rose-200 bg-rose-50'
  }
};
