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

  // Detalii suplimentare & Notițe
  detailedNotes?: string;
  pros: string[];
  cons: string[];
  isFavorite?: boolean;
}

export interface FilterOptions {
  search: string;
  campaignStatus: CampaignStatus | 'all';
  platform: string | 'all';
  category: string | 'all';
  minRoas?: number;
  sortBy: 'date_desc' | 'date_asc' | 'roas_desc' | 'revenue_desc' | 'spend_desc' | 'price_desc' | 'name_asc';
}
