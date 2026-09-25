import { Product, CampaignStatus, ProductChecklist, ListingStatus } from '../types/product';

export function normalizeProduct(raw: any): Product {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'Produs fără titlu',
      brand: 'General',
      category: 'Altele',
      price: 0,
      currency: 'RON',
      storeName: '',
      storeUrl: '',
      images: [],
      createdAt: new Date().toISOString().split('T')[0],
      targetSite: '',
      targetSiteUrl: '',
      listingStatus: 'planned',
      checklist: {
        supplierFound: false,
        pageCreated: false,
        adsPrepared: false,
        priceCalculated: false,
        trackingReady: false,
        liveOnSite: false,
      },
      campaign: {
        platform: 'Facebook Ads',
        status: 'untested',
        adSpend: 0,
        revenue: 0,
        roas: 0,
        ordersCount: 0,
      },
      pros: [],
      cons: [],
      isFavorite: false,
    };
  }

  const rawCampaign = raw.campaign || {};
  const spend = Number(rawCampaign.adSpend) || 0;
  const rev = Number(rawCampaign.revenue) || 0;
  let roas = Number(rawCampaign.roas);
  if (!Number.isFinite(roas) || roas <= 0) {
    roas = spend > 0 ? Number((rev / spend).toFixed(2)) : 0;
  }

  const validStatus: CampaignStatus = ['untested', 'winner', 'testing', 'promising', 'stopped'].includes(rawCampaign.status)
    ? rawCampaign.status
    : 'untested';

  const rawChecklist = raw.checklist || {};
  const validListingStatus: ListingStatus = ['planned', 'in_progress', 'live'].includes(raw.listingStatus)
    ? raw.listingStatus
    : 'planned';

  return {
    id: String(raw.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
    title: String(raw.title || 'Produs fără titlu'),
    brand: String(raw.brand || ''),
    category: String(raw.category || 'Altele'),
    price: Number(raw.price) || 0,
    currency: (raw.currency === 'EUR' || raw.currency === 'USD') ? raw.currency : 'RON',
    storeName: String(raw.storeName || ''),
    storeUrl: String(raw.storeUrl || ''),
    exampleSiteUrl: raw.exampleSiteUrl ? String(raw.exampleSiteUrl) : undefined,
    images: Array.isArray(raw.images) ? raw.images.filter((img: any) => typeof img === 'string' && img.trim()) : [],
    createdAt: String(raw.createdAt || new Date().toISOString().split('T')[0]),
    
    // Site destinație & status listare
    targetSite: raw.targetSite ? String(raw.targetSite) : '',
    targetSiteUrl: raw.targetSiteUrl ? String(raw.targetSiteUrl) : '',
    listingStatus: validListingStatus,

    // Checklist de pregătire & lansare
    checklist: {
      supplierFound: Boolean(rawChecklist.supplierFound),
      pageCreated: Boolean(rawChecklist.pageCreated),
      adsPrepared: Boolean(rawChecklist.adsPrepared),
      priceCalculated: Boolean(rawChecklist.priceCalculated),
      trackingReady: Boolean(rawChecklist.trackingReady),
      liveOnSite: Boolean(rawChecklist.liveOnSite),
    },

    campaign: {
      platform: String(rawCampaign.platform || 'Facebook Ads'),
      status: validStatus,
      adSpend: spend,
      revenue: rev,
      roas: roas,
      ordersCount: Number(rawCampaign.ordersCount) || 0,
      cpa: Number(rawCampaign.cpa) || 0,
      cpc: Number(rawCampaign.cpc) || 0,
      ctr: Number(rawCampaign.ctr) || 0,
      campaignUrl: rawCampaign.campaignUrl ? String(rawCampaign.campaignUrl) : undefined,
      notes: rawCampaign.notes ? String(rawCampaign.notes) : undefined,
      testedAt: rawCampaign.testedAt ? String(rawCampaign.testedAt) : undefined,
    },
    detailedNotes: raw.detailedNotes ? String(raw.detailedNotes) : undefined,
    pros: Array.isArray(raw.pros) ? raw.pros.map(String) : [],
    cons: Array.isArray(raw.cons) ? raw.cons.map(String) : [],
    isFavorite: Boolean(raw.isFavorite),
  };
}

export function calculateChecklistStats(checklist?: ProductChecklist): {
  completed: number;
  total: number;
  percentage: number;
  isReady: boolean;
} {
  const items = [
    checklist?.supplierFound,
    checklist?.pageCreated,
    checklist?.adsPrepared,
    checklist?.priceCalculated,
    checklist?.trackingReady,
    checklist?.liveOnSite,
  ];
  const completed = items.filter(Boolean).length;
  const total = items.length;
  const percentage = Math.round((completed / total) * 100);
  const isReady = completed === total;

  return { completed, total, percentage, isReady };
}

export const CHECKLIST_ITEMS_CONFIG: {
  key: keyof ProductChecklist;
  label: string;
  description: string;
  essential?: boolean;
}[] = [
  {
    key: 'supplierFound',
    label: 'Furnizor găsit & confirmat',
    description: 'Preț agreat, stoc disponibil și timpi de livrare stabiliți',
    essential: true,
  },
  {
    key: 'pageCreated',
    label: 'Pagină produs / Landing page creată',
    description: 'Text persuasiv, poze clare, recenzii și ofertă/bundle configurat',
    essential: true,
  },
  {
    key: 'adsPrepared',
    label: 'Reclame & Creativuri pregătite',
    description: 'Clipuri video TikTok, poze Facebook, hook-uri și texte de reclamă gata',
    essential: true,
  },
  {
    key: 'priceCalculated',
    label: 'Preț vânzare & Marjă profit calculate',
    description: 'Calculat cost achiziție + transport + marjă minimă de profit dorită',
    essential: false,
  },
  {
    key: 'trackingReady',
    label: 'Pixel & Evenimente tracking testate',
    description: 'Evenimentele ViewContent, AddToCart și Purchase funcționează corect',
    essential: false,
  },
  {
    key: 'liveOnSite',
    label: 'Produs publicat & Activ pe site',
    description: 'Produsul este vizibil în magazinul destinație și poate fi comandat',
    essential: false,
  },
];

export function safeFormatNumber(val: any): string {
  const num = Number(val);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('ro-RO');
}

export function safeFormatRoas(val: any): string {
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return '—';
  return `${num.toFixed(2)}x`;
}
