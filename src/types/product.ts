export type ProductStatus = 'to_test' | 'testing' | 'tested' | 'rejected';

export type ProductCategory =
  | 'Tech & Gadgets'
  | 'Audio & Video'
  | 'Smart Home & Electro'
  | 'Cosmetice & Beauty'
  | 'Bucătărie & Cafea'
  | 'Fitness & Sport'
  | 'Auto & Accesorii'
  | 'Altele';

export type SponsorshipType = 'personal' | 'sponsored' | 'pr_gift' | 'affiliate';

export type VerdictType =
  | 'highly_recommended'
  | 'recommended'
  | 'wait_for_sale'
  | 'neutral'
  | 'not_recommended';

export interface RatingCriteria {
  quality: number; // Calitate materiale & construcție (1-5)
  valueForMoney: number; // Raport Calitate/Preț (1-5)
  usability: number; // Ușurință în utilizare & ergonomie (1-5)
  performance: number; // Performanță reală & rezultate (1-5)
  durability: number; // Durabilitate & autonomie (1-5)
}

export interface TestLogEntry {
  id: string;
  date: string;
  dayNumber: number;
  note: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface AdCampaignDetails {
  campaignName?: string;
  sponsorName?: string;
  discountCode?: string;
  discountPercentage?: string;
  deadline?: string;
  deliverableRequirement?: string; // ex: "1x Video TikTok + 1x Review scris"
  adUrl?: string; // link reclamă sau tracking link
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: ProductCategory;
  status: ProductStatus;
  price: number;
  currency: 'RON' | 'EUR' | 'USD';
  originalPrice?: number;
  storeName: string;
  storeUrl: string;
  exampleSiteUrl?: string; // Exemplu site de prezentare / Recenzie video / Link campanie
  images: string[];
  sponsorship: SponsorshipType;
  adDetails?: AdCampaignDetails;
  targetTestingDays: number;
  startedTestingAt?: string;
  completedTestingAt?: string;
  createdAt: string;
  ratingCriteria?: RatingCriteria;
  overallRating?: number; // Scor general 1-5 calculat sau setat
  pros: string[];
  cons: string[];
  verdict?: VerdictType;
  reviewSummary?: string;
  detailedNotes?: string;
  logs: TestLogEntry[];
  isFavorite?: boolean;
}

export interface FilterOptions {
  search: string;
  status: ProductStatus | 'all';
  category: ProductCategory | 'all';
  sponsorship: SponsorshipType | 'all';
  minRating: number;
  sortBy: 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc' | 'price_desc' | 'price_asc' | 'name_asc';
}
