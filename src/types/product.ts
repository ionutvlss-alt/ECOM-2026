export type AdPlatform = 'facebook' | 'tiktok' | 'google' | 'instagram' | 'altele' | string;

export type CampaignStatus = 'untested' | 'testing' | 'winner' | 'promising' | 'stopped';

export interface CampaignResults {
  platform: AdPlatform; // ex: "Facebook Ads", "TikTok Ads", "Google Ads"
  status: CampaignStatus; // 'winner' (Winner/Scalat) | 'testing' (În testare) | 'promising' (Promițător/Break-even) | 'stopped' (Oprit)
  adSpend: number; // Buget cheltuit pe reclamă (ex: 350 RON)
  revenue: number; // Venit generat / Vânzări (ex: 1200 RON)
  roas?: number; // Return on Ad Spend (ex: 3.43)
  ordersCount: number; // Număr comenzi înregistrate
  cpa?: number; // Cost per achiziție (Cost per Order)
  cpc?: number; // Cost per click (opțional)
  ctr?: number; // Click-through rate % (opțional)
  campaignUrl?: string; // Link campanie / Link TikTok / Facebook Ad Library
  notes?: string; // Note campanie, hook video, unghi de vânzare, audiență țintă
  testedAt?: string; // Data rulării testului
}

export interface CategoryItem {
  id: string;
  name: string;
  color?: string;
  description?: string;
  createdAt: string;
}

export interface ProductChecklist {
  supplierFound: boolean; // Furnizor găsit & confirmat
  pageCreated: boolean; // Pagină produs / Landing page creată
  adsPrepared: boolean; // Reclame & Creativuri pregătite (video/foto/texte)
  priceCalculated: boolean; // Preț de vânzare & marjă de profit calculate
  trackingReady: boolean; // Pixel & Tracking configurate
  liveOnSite: boolean; // Produs publicat & activ pe site
}

export type ListingStatus = 'planned' | 'in_progress' | 'live';

export interface AdLink {
  id: string;
  url: string;
  platform?: string; // ex: 'TikTok', 'Facebook Ads', 'Instagram', 'YouTube', 'Altele'
  label?: string; // ex: 'Video Viral 1', 'Creativ UGC', 'Reclamă Câștigătoare'
  notes?: string;
  addedAt?: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string; // Categorie adăugată manual sau aleasă din lista de categorii
  price: number; // Preț vânzare / produs
  currency: 'RON' | 'EUR' | 'USD';
  storeName: string;
  storeUrl: string;
  exampleSiteUrl?: string; // Exemplu site furnizor / concurent / landing page
  images: string[];
  createdAt: string;

  // Site destinație (Pe ce site urmează să fie adăugat)
  targetSite?: string; // Nume magazin / domeniu destinație (ex: MagazinulMeu.ro, Shopify Store)
  targetSiteUrl?: string; // Link direct sau URL magazin destinație
  listingStatus?: ListingStatus; // 'planned' (În planificare) | 'in_progress' (În lucru) | 'live' (Publicat / Live)

  // Checklist de pregătire & lansare produs
  checklist?: ProductChecklist;
  
  // Platformă & Rezultate Campanie Ads (Facebook, TikTok, etc.)
  campaign: CampaignResults;

  // Secțiune link-uri cu reclame (3 sloturi stas + opțiune de adăugare nelimitată)
  adLinks?: AdLink[];

  // Detalii suplimentare & Notițe
  detailedNotes?: string;
  pros: string[];
  cons: string[];
  isFavorite?: boolean;

  // Simulator de profitabilitate & Unit Economics orientativ
  profitSimulation?: ProfitSimulation;
}

export interface ProfitSimulation {
  purchaseCost: number; // Cost achiziție produs (furnizor) în RON
  shippingChina: number; // Taxă de livrare din China per produs (orientativ 12-25 lei)
  customsDuty: number; // Taxe vamale per produs (orientativ 3-7 lei)
  importVat: number; // TVA de import per produs (19% sau orientativ 8-15 lei)
  adCpa: number; // CPA reclame (cost achiziție reclamă, orientativ 20-35 lei)
  returnReserve: number; // Rezervă / provizion taxa de retur per produs (orientativ 4-8 lei)
  packagingCost: number; // Ambalaje, pungă curier, etichete AWB, bandă (orientativ 2-5 lei)
  courierDeliveryCost: number; // Taxă curier livrare client final (ex: 15-18 lei sau inclusă)
  otherExpenses: number; // Alte cheltuieli (procesare card, software etc., orientativ 2-4 lei)
  salePrice: number; // Preț de vânzare estimat către client (în RON)
  targetOrdersPerDay?: number; // Obiectiv comenzi/zi pentru simulare lunară
}

export interface FilterOptions {
  search: string;
  campaignStatus: CampaignStatus | 'all';
  platform: string | 'all';
  category: string | 'all';
  minRoas?: number;
  sortBy: 'date_desc' | 'date_asc' | 'roas_desc' | 'revenue_desc' | 'spend_desc' | 'price_desc' | 'name_asc';
}
