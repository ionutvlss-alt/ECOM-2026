import { Product } from '../types/product';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-anc-headphones-01',
    title: 'Sony WH-1000XM5 Căști Wireless ANC',
    brand: 'Sony',
    category: 'Audio & Video',
    status: 'tested',
    price: 1399,
    currency: 'RON',
    originalPrice: 1799,
    storeName: 'eMAG',
    storeUrl: 'https://www.emag.ro',
    exampleSiteUrl: 'https://www.sony.ro/headphones/products/wh-1000xm5',
    images: ['/src/assets/images/product_anc_headphones_1790178731762.jpg'],
    sponsorship: 'personal',
    targetTestingDays: 14,
    startedTestingAt: '2026-08-10',
    completedTestingAt: '2026-08-25',
    createdAt: '2026-08-10T10:00:00.000Z',
    ratingCriteria: {
      quality: 4.8,
      valueForMoney: 4.5,
      usability: 4.9,
      performance: 5.0,
      durability: 4.6,
    },
    overallRating: 4.8,
    pros: [
      'Anularea activă a zgomotului de fond (ANC) este la cel mai înalt nivel de pe piață',
      'Microfoanele pentru apeluri filtrează vântul și zgomotul de stradă remarcabil',
      'Extrem de comode la sesiuni lungi de 6-8 ore de birou',
      'Autonomie reală de 30+ ore cu ANC pornit'
    ],
    cons: [
      'Balamalele nu se mai pliază compact în carcasă la fel ca XM4',
      'Materialul finisajului negru atrage ușor amprentele'
    ],
    verdict: 'highly_recommended',
    reviewSummary: 'Standardul de aur pentru căști over-ear de birou și călătorii. Sunet cald, ANC impecabil și comenzi tactile precise.',
    detailedNotes: 'Testate în scenarii diverse: zbor cu avionul, metrou aglomerat, spațiu open-office și apeluri Teams. Izolarea pasivă și activă creează o bulă de liniște instantanee.',
    logs: [
      {
        id: 'log-1',
        date: '2026-08-10',
        dayNumber: 1,
        note: 'Despachetare. Carcasa e mai lată decât generația anterioară, însă greutatea este redusă sesizabil. Pernuțele sunt foarte moi.',
        sentiment: 'positive'
      },
      {
        id: 'log-2',
        date: '2026-08-16',
        dayNumber: 7,
        note: 'Test de anduranță în zbor Cluj-Londra. Motoarele avionului au fost anulate în proporție de peste 90%. Bateria a scăzut doar cu 15%.',
        sentiment: 'positive'
      },
      {
        id: 'log-3',
        date: '2026-08-25',
        dayNumber: 15,
        note: 'Concluzie după două săptămâni: sunetul cu EQ personalizat în aplicația Sony Headphones Connect este fenomenal.',
        sentiment: 'positive'
      }
    ],
    isFavorite: true
  },
  {
    id: 'prod-smartwatch-titanium-02',
    title: 'Garmin Fēnix 8 AMOLED Sapphire 47mm',
    brand: 'Garmin',
    category: 'Fitness & Sport',
    status: 'testing',
    price: 4699,
    currency: 'RON',
    originalPrice: 4999,
    storeName: 'Garmin România',
    storeUrl: 'https://www.garmin.com/ro-RO/',
    exampleSiteUrl: 'https://www.garmin.com/ro-RO/p/1228419',
    images: ['/src/assets/images/product_smartwatch_ultra_1790178742766.jpg'],
    sponsorship: 'pr_gift',
    adDetails: {
      campaignName: 'Testare Garmin Fenix 8 Trail Running',
      sponsorName: 'Garmin CEE PR Team',
      discountCode: 'TESTER_FENIX10',
      discountPercentage: '10% reducere',
      deadline: '2026-10-15',
      deliverableRequirement: '1x Review detaliat pe blog + 3 story-uri pe Instagram cu datele din curse montane',
      adUrl: 'https://garmin.ro/campanie-trail'
    },
    targetTestingDays: 30,
    startedTestingAt: '2026-09-10',
    createdAt: '2026-09-10T14:30:00.000Z',
    ratingCriteria: {
      quality: 5.0,
      valueForMoney: 4.0,
      usability: 4.6,
      performance: 4.9,
      durability: 5.0,
    },
    overallRating: 4.7,
    pros: [
      'Ecran AMOLED luminos de 1.4 inch perfect lizibil în bătaia directă a soarelui',
      'Hărți topografice TopoActive preîncărcate cu navigare turn-by-turn excelentă',
      'Construcție rezistentă din titan și sticlă de safir rezistentă la zgârieturi',
      'Lanternă LED integrată pe ceas extrem de utilă noaptea'
    ],
    cons: [
      'Preț ridicat de achiziție',
      'Meniurile Garmin Connect sunt încă stufoase pentru începători'
    ],
    verdict: 'recommended',
    reviewSummary: 'Ceasul suprem pentru pasionații de anduranță și alergare montană. Trecerea la AMOLED fără a compromite autonomia este o reușită.',
    detailedNotes: 'Autonomia atinge aproximativ 14-16 zile în mod smartwatch standard sau 40 ore de monitorizare continuă GPS multi-bandă.',
    logs: [
      {
        id: 'log-fenix-1',
        date: '2026-09-10',
        dayNumber: 1,
        note: 'Configurare inițială și sincronizare senzori puls și centură HRM-Pro Plus. Ecranul este vibrant.',
        sentiment: 'positive'
      },
      {
        id: 'log-fenix-2',
        date: '2026-09-18',
        dayNumber: 8,
        note: 'Antrenament semi-maraton 21km pe traseu forestier. Precizia GPS pe frecvență dublă este uluitoare.',
        sentiment: 'positive'
      }
    ],
    isFavorite: true
  },
  {
    id: 'prod-espresso-sage-03',
    title: 'Sage The Barista Touch Impress Espresso',
    brand: 'Sage Appliances',
    category: 'Bucătărie & Cafea',
    status: 'testing',
    price: 4899,
    currency: 'RON',
    originalPrice: 5399,
    storeName: 'Altex',
    storeUrl: 'https://altex.ro',
    exampleSiteUrl: 'https://www.sageappliances.com/ro/ro/products/espresso/bes881.html',
    images: ['/src/assets/images/product_specialty_espresso_1790178753863.jpg'],
    sponsorship: 'sponsored',
    adDetails: {
      campaignName: 'Barista Acasă - Campanie Toamnă',
      sponsorName: 'Sage Appliances RO',
      discountCode: 'BARISTA_TEST20',
      discountPercentage: '15% reducere la cafea și accesorii',
      deadline: '2026-10-05',
      deliverableRequirement: '1x Video demostrativ TikTok latte art + ghid de măcinare cafea de specialitate',
      adUrl: 'https://altex.ro/brand/sage'
    },
    targetTestingDays: 21,
    startedTestingAt: '2026-09-15',
    createdAt: '2026-09-15T09:15:00.000Z',
    ratingCriteria: {
      quality: 4.8,
      valueForMoney: 4.2,
      usability: 4.8,
      performance: 4.7,
      durability: 4.5,
    },
    overallRating: 4.6,
    pros: [
      'Sistemul Impress Puck tamponează cafeaua cu precizie de 10kg cu finisaj curat',
      'Încălzire ThermoJet gata de extracție în doar 3 secunde',
      'Spumare automată a laptelui cu microspumă fină capabilă de latte art',
      'Ecran tactil intuitiv cu tutoriale pas cu pas pentru setarea măcinăturii'
    ],
    cons: [
      'Râșnița conică integrată necesită calibrare la fiecare schimbare de boabe',
      'Tava de picurare se umple rapid la clătirile automate'
    ],
    verdict: 'recommended',
    reviewSummary: 'Puntea perfectă între simplitatea unui automat și calitatea autentică a unui espressor manual.',
    detailedNotes: 'Am testat 3 origini diferite de cafea de specialitate prăjită proaspăt (Etiopia Guji, Columbia Supremo și un blend espresso). Rețetele memorate pe ecran salvează timp dimineața.',
    logs: [
      {
        id: 'log-sage-1',
        date: '2026-09-15',
        dayNumber: 1,
        note: 'Livrat și instalat. Finisajele din inox periat sunt impecabile. Sistemul asistat de tampare rezolvă principala problemă a cafelei manuale.',
        sentiment: 'positive'
      },
      {
        id: 'log-sage-2',
        date: '2026-09-20',
        dayNumber: 5,
        note: 'Ajustare granulație pentru cafea prăjită light. Sistemul pe ecran a indicat precis că e nevoie de 1 pas mai fin.',
        sentiment: 'positive'
      }
    ],
    isFavorite: false
  },
  {
    id: 'prod-robot-vacuum-04',
    title: 'Roborock S8 Pro Ultra Stație All-in-One',
    brand: 'Roborock',
    category: 'Smart Home & Electro',
    status: 'to_test',
    price: 5299,
    currency: 'RON',
    originalPrice: 5899,
    storeName: 'eMAG',
    storeUrl: 'https://www.emag.ro',
    exampleSiteUrl: 'https://ro.roborock.com/pages/roborock-s8-pro-ultra',
    images: ['/src/assets/images/product_robot_vacuum_1790178764363.jpg'],
    sponsorship: 'personal',
    targetTestingDays: 20,
    createdAt: '2026-09-22T08:00:00.000Z',
    ratingCriteria: {
      quality: 0,
      valueForMoney: 0,
      usability: 0,
      performance: 0,
      durability: 0,
    },
    overallRating: 0,
    pros: [
      'Dublă rolă de cauciuc DuoRoller Riser anti-încurcare păr animale',
      'Stație RockDock Ultra cu uscare automată cu aer cald a mopului',
      'Evitare obstacole 3D cu cameră cu lumină structurată'
    ],
    cons: [
      'Stația de andocare are dimensiuni mari',
      'Investiție inițială substanțială'
    ],
    verdict: 'wait_for_sale',
    reviewSummary: 'Pe lista scurtă de achiziție pentru campania de toamnă. Vreau să testez eficiența pe parchet laminat și covoare cu fir mediu.',
    detailedNotes: 'Comparat în prealabil cu Dreame L20 Ultra și Ecovacs X2 Omni. Roborock câștigă pe fiabilitatea algoritmului de cartografiere LiDAR.',
    logs: [
      {
        id: 'log-roborock-1',
        date: '2026-09-22',
        dayNumber: 0,
        note: 'Produs adăugat în lista de dorințe. Urmăresc evoluția prețului pe comparator înainte de plasarea comenzii.',
        sentiment: 'neutral'
      }
    ],
    isFavorite: true
  },
  {
    id: 'prod-skincare-serum-05',
    title: 'Medik8 Crystal Retinal 6 Tratament Noapte',
    brand: 'Medik8',
    category: 'Cosmetice & Beauty',
    status: 'tested',
    price: 345,
    currency: 'RON',
    originalPrice: 380,
    storeName: 'Notino',
    storeUrl: 'https://www.notino.ro',
    exampleSiteUrl: 'https://www.medik8.com/products/crystal-retinal',
    images: ['/src/assets/images/product_skincare_serum_1790178775466.jpg'],
    sponsorship: 'affiliate',
    adDetails: {
      campaignName: 'Ghid Îngrijire Ten cu Retinaldehidă',
      sponsorName: 'Program Afiliere Notino RO',
      discountCode: 'BEAUTY_SKIN10',
      discountPercentage: '10% la gama Medik8',
      adUrl: 'https://notino.ro/medik8'
    },
    targetTestingDays: 45,
    startedTestingAt: '2026-07-01',
    completedTestingAt: '2026-08-15',
    createdAt: '2026-07-01T12:00:00.000Z',
    ratingCriteria: {
      quality: 4.9,
      valueForMoney: 4.4,
      usability: 4.7,
      performance: 4.8,
      durability: 4.5,
    },
    overallRating: 4.7,
    pros: [
      'Retinaldehida acționează de până la 11 ori mai rapid decât retinolul clasic',
      'Textură catifelată, hidratează fără senzație uleioasă',
      'Toleranță excelentă a pielii, fără iritații sau descuamare la introducere treptată',
      'Îmbunătățire vizibilă a texturii pielii și a luminozității după 4 săptămâni'
    ],
    cons: [
      'Ambalajul cu pompă vacuum este opac, greu de estimat cât produs a rămas',
      'Preț premium pentru un flacon de 30ml'
    ],
    verdict: 'highly_recommended',
    reviewSummary: 'Unul dintre cele mai bune produse cu retinoizi testate vreodată. Formulă stabilizată excelent, rezultate clare fără efectele adverse clasice ale retinolului.',
    detailedNotes: 'Introdus în rutină treptat: săptămâna 1-2 de două ori pe săptămână, săptămâna 3-4 la două zile, ulterior în fiecare seară.',
    logs: [
      {
        id: 'log-serum-1',
        date: '2026-07-01',
        dayNumber: 1,
        note: 'Prima aplicare după curățare. Textură de cremă-serum ușor gălbuie, se absoarbe rapid.',
        sentiment: 'positive'
      },
      {
        id: 'log-serum-2',
        date: '2026-07-20',
        dayNumber: 20,
        note: 'Punctele negre de pe nas s-au diminuat, iar tenul are un aspect vizibil mai uniform și catifelat.',
        sentiment: 'positive'
      },
      {
        id: 'log-serum-3',
        date: '2026-08-15',
        dayNumber: 45,
        note: 'Final de testare. Trecerea la formula superioară Crystal Retinal 10 este următorul pas firesc.',
        sentiment: 'positive'
      }
    ],
    isFavorite: false
  }
];

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
