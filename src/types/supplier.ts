export interface Supplier {
  id: string;
  name: string; // Nume furnizor / Nume fabrică / contact
  platform: string; // AliExpress, 1688, Alibaba, CJ Dropshipping, Taobao, Temu, Furnizor Local, Fabrică, etc.
  link?: string; // Link magazin / profil / catalog furnizor
  contactPerson?: string; // Nume persoană contact / agent
  phone?: string; // Telefon / WhatsApp
  email?: string; // Email
  wechat?: string; // WeChat ID
  purchasedProducts: string[]; // Listă cu numele sau ID-urile produselor cumpărate de la el
  rating?: number; // 1 - 5 stele
  notes?: string; // Note speciale, timp livrare, MOQ, discounturi negociate
  createdAt: string;
  updatedAt?: string;
}
