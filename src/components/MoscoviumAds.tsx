import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, ExternalLink, Sparkles, Check, Copy, ArrowRight, Tag, Code, 
  PlusCircle, X, ChevronRight, ChevronLeft, Volume2, ShieldCheck, Cpu, 
  ZoomIn, CreditCard, Wallet, Loader2, CheckCircle2, Receipt, AlertCircle, Calendar, Save
} from 'lucide-react';
import { SellerStats } from '../types';
import { playCashRegisterSound, playNotificationSound } from '../lib/audio';

export interface MoscoviumAd {
  isActive?: boolean;
  id: string;
  title: string;
  tagline: string;
  description: string;
  ctaText: string;
  image: string;
  bgColor: string;
  tag: string;
  badgeColor: string;
  actionType: 'category' | 'code' | 'external' | 'view';
  actionValue: string;
  clicks: number;
  durationDays?: number;
  dailyRate?: number;
}

export interface MoscoviumAdsProps {
  onSelectCategory: (category: string | null) => void;
  onSwitchView: (view: 'marketplace' | 'dashboard' | 'git-assistant') => void;
  setSearchQuery: (query: string) => void;
  lang?: string;
  ads: MoscoviumAd[];
  setAds: React.Dispatch<React.SetStateAction<MoscoviumAd[]>>;
  sellerStats?: SellerStats;
  onUpdateStats?: React.Dispatch<React.SetStateAction<SellerStats>>;
}

export const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1615111784767-4d9a405efef7?auto=format&fit=crop&w=500&q=80', // Ruby gemstone
  'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&w=500&q=80', // Hardware Node / GPU
  'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=500&q=80', // Tech node / Git code
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80', // Satellite/Globe network
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=500&q=80', // Sculptures/Art
];

export const INITIAL_ADS: MoscoviumAd[] = [
  {
    id: 'ad-bestgem',
    title: 'Bestgemdiamond Fine Crafts',
    tagline: 'Authenticity & Elegance Assured',
    description: 'Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.',
    ctaText: 'Shop Fine Collectibles',
    image: 'https://images.unsplash.com/photo-1615111784767-4d9a405efef7?auto=format&fit=crop&w=500&q=80',
    bgColor: 'from-slate-900 via-rose-950 to-amber-950',
    tag: 'Premium Merchant',
    badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    actionType: 'category',
    actionValue: 'art-collectibles',
    clicks: 1420
  },
  {
    id: 'ad-gpu',
    title: 'Moscovium Node-V5 Silicon Compute',
    tagline: 'High-Processing Node Lease',
    description: 'Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.',
    ctaText: 'Claim 15% Rent Promo',
    image: 'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&w=500&q=80',
    bgColor: 'from-slate-950 via-indigo-950 to-cyan-950',
    tag: 'Moscovium Host',
    badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    actionType: 'code',
    actionValue: 'MOSCOVIUM115_GPU',
    clicks: 849
  },
  {
    id: 'ad-git',
    title: 'Moscovium115 Git Integration Service',
    tagline: 'Publish Directly via Git Commits',
    description: 'Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.',
    ctaText: 'Launch Code Assistant',
    image: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=500&q=80',
    bgColor: 'from-slate-900 via-emerald-950 to-slate-950',
    tag: 'Developer Node',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    actionType: 'view',
    actionValue: 'git-assistant',
    clicks: 2150
  },
  {
    id: 'ad-orion',
    title: 'Orion Lunar Propulsion Systems',
    tagline: 'Vacuum-Tested High-Bypass Turbine Vanes',
    description: 'Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.',
    ctaText: 'Acquire Avionics Parts',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=500&q=80',
    bgColor: 'from-slate-950 via-slate-900 to-sky-950',
    tag: 'Aerospace Node',
    badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    actionType: 'category',
    actionValue: 'all-vehicles-parts',
    clicks: 981
  },
  {
    id: 'ad-licensing',
    title: 'Aetheric Enterprise License Keys',
    tagline: 'Secure Crypto Software Transfer',
    description: 'Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.',
    ctaText: 'Unlock Premium Keys',
    image: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=500&q=80',
    bgColor: 'from-blue-950 via-violet-950 to-slate-950',
    tag: 'Digital Keys',
    badgeColor: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    actionType: 'category',
    actionValue: 'digital-downloads',
    clicks: 1374
  },
  {
    id: 'ad-yeti',
    title: 'Yeti Jade-Molded Natural Specimen',
    tagline: 'Premium Nepalese Geodes & Jade',
    description: 'Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.',
    ctaText: 'Explore Sacred Minerals',
    image: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=500&q=80',
    bgColor: 'from-slate-950 via-teal-950 to-zinc-900',
    tag: 'Certified Mineral',
    badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    actionType: 'category',
    actionValue: 'art-collectibles',
    clicks: 651
  },
  {
    id: 'ad-cyberapparel',
    title: 'Neo-Tokyo Heavy Tactical Wear',
    tagline: 'Reflective Intelligent Outerwear',
    description: 'Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.',
    ctaText: 'View Techwear Apparel',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=500&q=80',
    bgColor: 'from-slate-950 via-rose-950 to-slate-900',
    tag: 'Aesthetic Wear',
    badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    actionType: 'category',
    actionValue: 'fashion-beauty',
    clicks: 1102
  },
  {
    id: 'ad-miner',
    title: 'Moscovium Centrifugal Ore Concentrators',
    tagline: 'High-Throughput Magnetic Separation',
    description: 'Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.',
    ctaText: 'Deploy Heavy Tools',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&q=80',
    bgColor: 'from-amber-950 via-zinc-900 to-amber-950',
    tag: 'Heavy Industry',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    actionType: 'category',
    actionValue: 'industrial-equipment-tools',
    clicks: 742
  },
  {
    id: 'ad-sec-logistics',
    title: 'Secured Trans-Ocean Logistics Advices',
    tagline: 'Automated Escrow Clearances',
    description: 'Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.',
    ctaText: 'Connect Specialist',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=80',
    bgColor: 'from-slate-900 via-emerald-950 to-indigo-950',
    tag: 'Advisory Node',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    actionType: 'category',
    actionValue: 'services',
    clicks: 433
  },
  {
    id: 'ad-vault5',
    title: 'Moscovium Automated Ledger Vault',
    tagline: 'Verified Multi-Currency Escrow Sync',
    description: 'Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.',
    ctaText: 'Open Merchant Payouts',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=500&q=80',
    bgColor: 'from-indigo-950 via-slate-900 to-indigo-950',
    tag: 'Finance Gateway',
    badgeColor: 'bg-indigo-500/10 text-indigo-350 border-indigo-500/20',
    actionType: 'view',
    actionValue: 'dashboard',
    clicks: 1845
  }
];

// Multi-language Translation Packs for Sponsor banners
const AD_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    verifiedSponsors: "Moscovium Verified Sponsors",
    runningCount: "Running",
    deployBanner: "Deploy Sponsor Banner",
    interactions: "Interactions",
    copied: "Promo Copied!",
    deployCustomAd: "Deploy Custom Sponsor Node",
    adFocus: "Ad Image Focus",
    sponsorWord: "Sponsor",
    originTab: "Open Original Tab",
    closeViewer: "Close Image Viewer",
    dismiss: "Close Modal",
    confirmLiveAd: "Confirm Live Advertisement Dispatch",
    criteriaError: "Please fill out all descriptive criteria fields.",
    brandName: "Brand Name (e.g. Soko Co)",
    taglineLabel: "Tagline Highlight (e.g. Best price)",
    descriptionLabel: "Promotion/Product Description",
    ctaLabel: "Custom CTA Action Label",
    targetAction: "Direct Target Action Type",
    actionValue: "Action Value Parameter / Promo Code",
    bannerGraphics: "Select Banner Graphics Representation",
    deployBtn: "Deploy Ad Space Node",
    customSponsor: "Community Sponsor",
    "Bestgemdiamond Fine Crafts": "Bestgemdiamond Fine Crafts",
    "Authenticity & Elegance Assured": "Authenticity & Elegance Assured",
    "Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.": "Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.",
    "Shop Fine Collectibles": "Shop Fine Collectibles",
    "Moscovium Node-V5 Silicon Compute": "Moscovium Node-V5 Silicon Compute",
    "High-Processing Node Lease": "High-Processing Node Lease",
    "Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.": "Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.",
    "Claim 15% Rent Promo": "Claim 15% Rent Promo",
    "Moscovium115 Git Integration Service": "Moscovium115 Git Integration Service",
    "Publish Directly via Git Commits": "Publish Directly via Git Commits",
    "Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.": "Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.",
    "Launch Code Assistant": "Launch Code Assistant",
    "Orion Lunar Propulsion Systems": "Orion Lunar Propulsion Systems",
    "Vacuum-Tested High-Bypass Turbine Vanes": "Vacuum-Tested High-Bypass Turbine Vanes",
    "Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.": "Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.",
    "Acquire Avionics Parts": "Acquire Avionics Parts",
    "Aetheric Enterprise License Keys": "Aetheric Enterprise License Keys",
    "Secure Crypto Software Transfer": "Secure Crypto Software Transfer",
    "Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.": "Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.",
    "Unlock Premium Keys": "Unlock Premium Keys",
    "Yeti Jade-Molded Natural Specimen": "Yeti Jade-Molded Natural Specimen",
    "Premium Nepalese Geodes & Jade": "Premium Nepalese Geodes & Jade",
    "Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.": "Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.",
    "Explore Sacred Minerals": "Explore Sacred Minerals",
    "Neo-Tokyo Heavy Tactical Wear": "Neo-Tokyo Heavy Tactical Wear",
    "Reflective Intelligent Outerwear": "Reflective Intelligent Outerwear",
    "Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.": "Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.",
    "View Techwear Apparel": "View Techwear Apparel",
    "Moscovium Centrifugal Ore Concentrators": "Moscovium Centrifugal Ore Concentrators",
    "High-Throughput Magnetic Separation": "High-Throughput Magnetic Separation",
    "Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.": "Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.",
    "Deploy Heavy Tools": "Deploy Heavy Tools",
    "Secured Trans-Ocean Logistics Advices": "Secured Trans-Ocean Logistics Advices",
    "Automated Escrow Clearances": "Automated Escrow Clearances",
    "Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.": "Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.",
    "Connect Specialist": "Connect Specialist",
    "Moscovium Automated Ledger Vault": "Moscovium Automated Ledger Vault",
    "Verified Multi-Currency Escrow Sync": "Verified Multi-Currency Escrow Sync",
    "Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.": "Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.",
    "Open Merchant Payouts": "Open Merchant Payouts"
  },
  sw: {
    verifiedSponsors: "Wadhamini Waliothibitishwa",
    runningCount: "Inayofanya kazi",
    deployBanner: "Weka Bango la Mdhamini",
    interactions: "Mwingiliano",
    copied: "Kuponi Imenakiliwa!",
    deployCustomAd: "Weka Kituo cha Matangazo ya Jamii",
    adFocus: "Picha ya Tangazo",
    sponsorWord: "Sponsor",
    originTab: "Fungua Ukurasa wa Asili",
    closeViewer: "Funga Mtazamaji",
    dismiss: "Funga",
    confirmLiveAd: "Thibitisha Utumaji wa Matangazo ya Moja kwa Moja",
    criteriaError: "Tafadhali jaza sifa zote za maelezo.",
    brandName: "Jina la Chapa (mfano Soko Co)",
    taglineLabel: "Kivutio cha Chapa (mfano Bei Bora)",
    descriptionLabel: "Maelezo ya Kukuza/Bidhaa",
    ctaLabel: "Kitendo Maalum cha CTA",
    targetAction: "Aina ya Njia ya Kitendo",
    actionValue: "Thamani ya Kitendo / Promo Code",
    bannerGraphics: "Chagua Picha ya Bango",
    deployBtn: "Maji ya Tangazo Sasa",
    customSponsor: "Msaada wa Jamii",
    "Bestgemdiamond Fine Crafts": "Kazi Nzuri za Bestgemdiamond",
    "Authenticity & Elegance Assured": "Uhakika wa Uhalisi na Kifahari bora",
    "Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.": "Pata yakuti halisi ya Kiafrika, zumaridi za kiwango cha juu, na sanamu za mahogany zilizochongwa kwa mikono zikiwasilishwa salama na bima kamili ya dhamana.",
    "Shop Fine Collectibles": "Nunua Vitu vya Thamani",
    "Moscovium Node-V5 Silicon Compute": "Moscovium Node-V5 Silicon Kompyuta",
    "High-Processing Node Lease": "Pangisha Nodi ya Nguvu ya Juu",
    "Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.": "Weka nodi za mbali za picha zenye VRAM ya 24GB inayofanya kazi. Pata punguzo la 15% la ukurasa wako wa kwanza wa vifaa.",
    "Claim 15% Rent Promo": "Chukua Punguzo la 15%",
    "Moscovium115 Git Integration Service": "Huduma ya Kuunganisha Git ya Moscovium115",
    "Publish Directly via Git Commits": "Chapisha Moja kwa Moja kupitia Git Commits",
    "Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.": "Jiunge na orodha ya masoko salama. Tengeneza amri maalum za git-push kwa sekunde 60 kwa kutumia hati zetu za msaidizi wa usajili.",
    "Launch Code Assistant": "Anzisha Msaidizi wa Kanuni",
    "Orion Lunar Propulsion Systems": "Mifumo ya Urushaji wa Orion ya mwezini",
    "Vacuum-Tested High-Bypass Turbine Vanes": "Vipepeo vya Turbini Vilivyojaribiwa kwenye Ombwe",
    "Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.": "Pata vyumba vya kuchoma titani vya kiwango cha angani, bodi za kisasa za saketi, na vipepeo vya turbini vyenye cheti rasmi vya anga za juu.",
    "Acquire Avionics Parts": "Pata Sehemu za Ndege",
    "Aetheric Enterprise License Keys": "Funguo za Leseni za Aetheric",
    "Secure Crypto Software Transfer": "Uhamisho Salama wa Programu za Crypto",
    "Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.": "Pakua papo hapo misimbo ya programu iliyothibitishwa, funguo za kontena, na leseni za maisha.",
    "Unlock Premium Keys": "Fungua Funguo Maalum",
    "Yeti Jade-Molded Natural Specimen": "Sampuli Halisi ya Yeti Jade ya Kichina",
    "Premium Nepalese Geodes & Jade": "Geodi Bora za Nepal na Jade ya Kijani",
    "Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.": "Sampuli za kipekee za nephrite mbichi zilizotolewa katikati mwa milima ya Himalaya. Kila shehena imefungwa kwa sanduku maalum.",
    "Explore Sacred Minerals": "Gundua Madini ya Thamani",
    "Neo-Tokyo Heavy Tactical Wear": "Mavazi Mazito ya Kisasa ya Neo-Tokyo",
    "Reflective Intelligent Outerwear": "Mavazi Yenye Maono ya Usiku yenye Akili",
    "Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.": "Jacketi zisizoingiza maji za kipekee, mifuko ya techwear, na vifaa vya carbon-fiber vilivyotengenezwa kwa hali mbaya ya hewa.",
    "View Techwear Apparel": "Angalia Mavazi ya Kipekee",
    "Moscovium Centrifugal Ore Concentrators": "Vichujio vya Centrifugal vya Moscovium",
    "High-Throughput Magnetic Separation": "Utengaji wa Sumaku wa Kiwango cha Juu",
    "Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.": "Vichujio maalum vyenye milango miwili na udhibiti wa kidijitali. Inasaidia kuchuja dhababu nzito, shaba, na lithiamu kwa ufanisi.",
    "Deploy Heavy Tools": "Weka Zana Nzito",
    "Secured Trans-Ocean Logistics Advices": "Ushauri Salama wa Usafirishaji Baharini",
    "Automated Escrow Clearances": "Uidhinishaji Maalum wa Escrow",
    "Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.": "Ushauri wa wataalamu kwa usafirishaji wa mizigo ya angani, dhamana za sanaa za thamani, na ulinzi wa miamala ya kidijitali.",
    "Connect Specialist": "Wasiliana na Mtaalamu",
    "Moscovium Automated Ledger Vault": "Kipochi cha Ledger cha Moscovium",
    "Verified Multi-Currency Escrow Sync": "Usawazishaji wa Fedha Nyingi za Escrow",
    "Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.": "Linda miamala yako kikamilifu. Jukwaa letu linakagua salio na kuratibu malipo ya haraka kote duniani.",
    "Open Merchant Payouts": "Fungua Malipo ya Wauzaji"
  },
  es: {
    verifiedSponsors: "Patrocinadores Verificados de Moscovium",
    runningCount: "Ejecutándose",
    deployBanner: "Anunciar de Sponsor",
    interactions: "Interacciones",
    copied: "¡Copiapó de Código!",
    deployCustomAd: "Publicar Anuncio de Comunidad",
    adFocus: "Foco de la Imagen",
    sponsorWord: "Patrocinador",
    originTab: "Abrir Pestaña Original",
    closeViewer: "Cerrar Visualizador",
    dismiss: "Cerrar",
    confirmLiveAd: "Confirmar Envío de Publicidad",
    criteriaError: "Por favor, complete todos los campos de criterios descriptivos.",
    brandName: "Nombre de la Marca (ej. Soko Co)",
    taglineLabel: "Eslogan Deslumbrante (ej. Mejor Precio)",
    descriptionLabel: "Descripción de Campaña o Producto",
    ctaLabel: "Acción de Llamado al Botón CTA",
    targetAction: "Tipo de Acción Directa",
    actionValue: "Parámetro de Acción / Código de Descuento",
    bannerGraphics: "Elegir Ilustración del Anuncio",
    deployBtn: "Desplegar Nodo Publicitario",
    customSponsor: "Patrocinio Comunitario",
    "Bestgemdiamond Fine Crafts": "Artesanías de Bestgemdiamond",
    "Authenticity & Elegance Assured": "Autenticidad y Elegancia Asegurada",
    "Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.": "Adquiera rubíes africanos crudos auténticos, esmeraldas sueltas de alto quilate y esculturas de caoba moldeadas a mano con seguro de depósito en garantía total.",
    "Shop Fine Collectibles": "Comprar Coleccionables Finos",
    "Moscovium Node-V5 Silicon Compute": "Cómputo de Silicio Moscovium Node-V5",
    "High-Processing Node Lease": "Alquiler de Nodo de Rendimiento",
    "Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.": "Despliegue nodos de entrenamiento gráfico remoto a tiempo real con 24GB VRAM. Telemetría garantizada. Obtenga un 15% de reducción.",
    "Claim 15% Rent Promo": "Reclamar 15% de Descuento",
    "Moscovium115 Git Integration Service": "Servicio de Integración de Git Moscovium115",
    "Publish Directly via Git Commits": "Publicar Directamente vía Commits de Git",
    "Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.": "Automatice sus listados con seguridad. Genere comandos de subida personalizados en 60 segundos con nuestro asistente.",
    "Launch Code Assistant": "Iniciar Asistente de Código",
    "Orion Lunar Propulsion Systems": "Sistemas de Propulsión Lunar Orion",
    "Vacuum-Tested High-Bypass Turbine Vanes": "Álabes de Turbina de Alto Bypass Probados al Vacío",
    "Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.": "Obtenga cámaras de combustión de titanio, placas de circuitos avanzados con certificación aeroespacial.",
    "Acquire Avionics Parts": "Adquirir Piezas de Aviónica",
    "Aetheric Enterprise License Keys": "Llaves de Licencia de Aetheric",
    "Secure Crypto Software Transfer": "Transferencia de Software Seguro",
    "Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.": "Descargue al instante llaves de software premium con licencias ilimitadas.",
    "Unlock Premium Keys": "Desbloquear Llaves",
    "Yeti Jade-Molded Natural Specimen": "Especímen Natural de Jade del Himalaya",
    "Premium Nepalese Geodes & Jade": "Geodas Finas de Nepal y Jade Genuino",
    "Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.": "Muestras de jadeíta auténtica directas del Himalaya con seguridad total.",
    "Explore Sacred Minerals": "Explorar Minerales Sagrados",
    "Neo-Tokyo Heavy Tactical Wear": "Ropa Modular Táctica de Neo-Tokyo",
    "Reflective Intelligent Outerwear": "Ropa Exterior Inteligente Reflectante",
    "Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.": "Cascos y chaquetas tácticas con acabados reflectantes de alta resistencia.",
    "View Techwear Apparel": "Ver Indumentaria de Techwear",
    "Moscovium Centrifugal Ore Concentrators": "Concentradores de Minerales de Moscovium",
    "High-Throughput Magnetic Separation": "Separación Magnética Avanzada",
    "Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.": "Rotores concentradores industriales para minería con modulación digital.",
    "Deploy Heavy Tools": "Desplegar Equipos Pesados",
    "Secured Trans-Ocean Logistics Advices": "Consultas Logísticas Transoceánicas",
    "Automated Escrow Clearances": "Aprobaciones de Depósito Automáticas",
    "Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.": "Consultas oficiales para transporte de carga internacional con fianzas legales.",
    "Connect Specialist": "Conectar con Especialista",
    "Moscovium Automated Ledger Vault": "Bóveda Automatizada de Ledger Moscovium",
    "Verified Multi-Currency Escrow Sync": "Sincronización Multidivisa Protegida",
    "Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.": "Coordina pagos seguros a nivel mundial con confirmación de depósitos instantánea.",
    "Open Merchant Payouts": "Abrir Pagos de Comercio"
  },
  fr: {
    verifiedSponsors: "Partenaires Officiels de Moscovium",
    runningCount: "Actifs",
    deployBanner: "Publier une Annonce de Sponsor",
    interactions: "Interactions",
    copied: "Code Copié!",
    deployCustomAd: "Créer un Bloc Publicitaire",
    adFocus: "Zoom sur l'Image",
    sponsorWord: "Sponsor",
    originTab: "Ouvrir l'Onglet Original",
    closeViewer: "Fermer la Visionneuse",
    dismiss: "Fermer",
    confirmLiveAd: "Confirmer le Lancement de la Campagne",
    criteriaError: "Veuillez remplir toutes les informations clés.",
    brandName: "Nom de la Marque (ex. Soko Co)",
    taglineLabel: "Slogan Accrocheur (ex. Excellent prix)",
    descriptionLabel: "Description du Produit ou de l'Offre",
    ctaLabel: "Texte CTA Personnalisé",
    targetAction: "Type d'Action de Redirection",
    actionValue: "Paramètre / Code Promotionnel",
    bannerGraphics: "Sélectionner le Visuel de l'Annonce",
    deployBtn: "Lancer le Module de Sponsor",
    customSponsor: "Sponsor Communautaire",
    "Bestgemdiamond Fine Crafts": "Artisans de Bestgemdiamond",
    "Authenticity & Elegance Assured": "Authenticité & Élégance Assurées",
    "Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.": "Procurez-vous des rubis d'Afrique bruts authentiques, des émeraudes pures, et de splendides œuvres d'art en acajou livrés en toute confiance.",
    "Shop Fine Collectibles": "Acheter des Collections",
    "Moscovium Node-V5 Silicon Compute": "Puissance Silicium Moscovium Node-V5",
    "High-Processing Node Lease": "Location de Serveur de Calcul Dédié",
    "Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.": "Déployez instantanément des machines de rendu avec 24 Go de mémoire dédiée. Obtenez 15% de réduction immédiate.",
    "Claim 15% Rent Promo": "Obtenir les 15% Offerts",
    "Moscovium115 Git Integration Service": "Intégration Directe Git Moscovium115",
    "Publish Directly via Git Commits": "Publier Directement par vos Commits",
    "Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.": "Automatisez vos fiches produits grâce à nos scripts de synchronisation rapide.",
    "Launch Code Assistant": "Ouvrir l'Assistant",
    "Orion Lunar Propulsion Systems": "Propulsion Terrestre & Spatiale Orion",
    "Vacuum-Tested High-Bypass Turbine Vanes": "Turbines Certifiées pour les Conditions de Vide",
    "Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.": "Commandez des injecteurs de titane et des panneaux de contrôle aéronautiques haut de gamme.",
    "Acquire Avionics Parts": "Acheter des Pièces",
    "Aetheric Enterprise License Keys": "Clés de Licences Aetheric",
    "Secure Crypto Software Transfer": "Transfert Sécurisé de Logiciels de Chiffrement",
    "Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.": "Téléchargez vos licences à vie pour serveurs et modules IDE.",
    "Unlock Premium Keys": "Déverrouiller nos Clés",
    "Yeti Jade-Molded Natural Specimen": "Spécimens Naturels de Jade de l'Himalaya",
    "Premium Nepalese Geodes & Jade": "Géodes Précieuses du Népal et Jade",
    "Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.": "Commandez des tranches brutes de jade néphrite importées par conteneurs sécurisés.",
    "Explore Sacred Minerals": "Découvrir les Minéraux",
    "Neo-Tokyo Heavy Tactical Wear": "Vêtements Techniques de Neo-Tokyo",
    "Reflective Intelligent Outerwear": "Manteaux Techniques Réfléchissants",
    "Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.": "Conçus pour résister au vent et aux conditions extrêmes.",
    "View Techwear Apparel": "Voir les Produits",
    "Moscovium Centrifugal Ore Concentrators": "Séparateurs Centrifuges Industriels",
    "High-Throughput Magnetic Separation": "Séparation Électromagnétique",
    "Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.": "Ravageurs et broyeurs pour l'extraction de métaux précieux.",
    "Deploy Heavy Tools": "Déployer nos Outils",
    "Secured Trans-Ocean Logistics Advices": "Conseillers Logistiques Transatlantiques",
    "Automated Escrow Clearances": "Validations Automatiques d'Escrow",
    "Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.": "Consultations spécialisées pour les flux réglementaires internationaux.",
    "Connect Specialist": "Prendre RDV",
    "Moscovium Automated Ledger Vault": "Bande-Séquestre Automatique Moscovium",
    "Verified Multi-Currency Escrow Sync": "Synchronisation Sécurisée Multi-Devises",
    "Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.": "Une plateforme de confiance veillant instantanément à la sécurité des transactions.",
    "Open Merchant Payouts": "Ouvrir l'Espace Commerce"
  },
  de: {
    verifiedSponsors: "Verifizierte Moscovium Sponsoren",
    runningCount: "Häufiger",
    deployBanner: "Werbebanner schalten",
    interactions: "Klicks",
    copied: "Promo-Code kopiert!",
    deployCustomAd: "Eigene Anzeige schalten",
    adFocus: "Anzeigenbild-Ausschnitt",
    sponsorWord: "Sponsor",
    originTab: "Im neuen Tab öffnen",
    closeViewer: "Bildschrim schließen",
    dismiss: "Schließen",
    confirmLiveAd: "Veröffentlichung bestätigen",
    criteriaError: "Bitte füllen Sie alle erforderlichen Textfelder aus.",
    brandName: "Markenname (z.B. Soko Co)",
    taglineLabel: "Slogan (z.B. Bester Preis)",
    descriptionLabel: "Werbebeschreibung",
    ctaLabel: "Benutzerdefiniertes CTA-Label",
    targetAction: "Ziel-Aktionstyp",
    actionValue: "Aktionsparameter / Code",
    bannerGraphics: "Sponsorenbild wählen",
    deployBtn: "Kampagne starten",
    customSponsor: "Gemeinschaft-Sponsor",
    "Bestgemdiamond Fine Crafts": "Bestgemdiamond Kunstwerke",
    "Authenticity & Elegance Assured": "Garantiert authentisch und elegant",
    "Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.": "Kaufen Sie echte afrikanische Rubine, lose Smaragde und Skulpturen aus Mahagoni mit Treuhandabsicherung.",
    "Shop Fine Collectibles": "Sammlerstücke shoppen",
    "Moscovium Node-V5 Silicon Compute": "Moscovium Node-V5 Rechenleistung",
    "High-Processing Node Lease": "Grafikprozessor-Mietangebote",
    "Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.": "Holen Sie sich 24 GB Hochleistungs-VRAM für maschinelles Lernen mit 15% Ersparnis.",
    "Claim 15% Rent Promo": "15% Rabatt sichern",
    "Moscovium115 Git Integration Service": "Moscovium115 Git-Schnittstelle",
    "Publish Directly via Git Commits": "Automatisch über Git pushen",
    "Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.": "Synchronisieren Sie Ihre Händler-Artikel bequem über Git.",
    "Launch Code Assistant": "Assistent starten",
    "Orion Lunar Propulsion Systems": "Orion Triebwerks-Zulieferer",
    "Vacuum-Tested High-Bypass Turbine Vanes": "Vakuumgetestete Turbinenschaufeln",
    "Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.": "Hochwertiges Titan und Triebwerksteile mit Luftfahrtzertifikaten.",
    "Acquire Avionics Parts": "Luftfahrtteile beziehen",
    "Aetheric Enterprise License Keys": "Aetheric Lizenzschlüssel",
    "Secure Crypto Software Transfer": "Sicherer Crypto-Softwaretransfer",
    "Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.": "Offizielle Registrierungsschlüssel und lebenslange Lizenzen.",
    "Unlock Premium Keys": "Schlüssel freischalten",
    "Yeti Jade-Molded Natural Specimen": "Urweltliche Jade aus dem Himalayagebiet",
    "Premium Nepalese Geodes & Jade": "Echte Himalaya-Geoden und Jade",
    "Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.": "Erstklassige Nephritstücke sicher verpackt in massiver Holzkiste.",
    "Explore Sacred Minerals": "Edelsteine erkunden",
    "Neo-Tokyo Heavy Tactical Wear": "Neo-Tokyo taktische Mode",
    "Reflective Intelligent Outerwear": "Reflektierende Funktionskleidung",
    "Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.": "Robuste Jacken und Zubehör für nasses Wetter.",
    "View Techwear Apparel": "Modekollektion ansehen",
    "Moscovium Centrifugal Ore Concentrators": "Zentrifugale Erztrennung Moscovium",
    "High-Throughput Magnetic Separation": "Elektromagnetische Abscheidung",
    "Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.": "Professionelle Zerkleinerer für den Abbau wertvoller Erze.",
    "Deploy Heavy Tools": "Zana abrufen",
    "Secured Trans-Ocean Logistics Advices": "Konzept für Seefracht & Logistik",
    "Automated Escrow Clearances": "Automatisierte Treuhandfreigaben",
    "Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.": "Exquisite Beratung für internationale Schiffsfianzen.",
    "Connect Specialist": "Experten kontaktieren",
    "Moscovium Automated Ledger Vault": "Moscovium Transaktions-Speicher",
    "Verified Multi-Currency Escrow Sync": "Treuhandkonten für diverse Währungen",
    "Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.": "Sicherheit für Ihren Zahlungsverkehr mit modernster Ledger-Technologie.",
    "Open Merchant Payouts": "Auszahlung starten"
  },
  zh: {
    verifiedSponsors: "莫斯科元素 115 认证广告伙伴",
    runningCount: "在线展示中",
    deployBanner: "上架产品赞助广告",
    interactions: "次买家互动",
    copied: "优惠兑换码已复制!",
    deployCustomAd: "创建并配置广告内容",
    adFocus: "广告画面聚焦",
    sponsorWord: "赞助商",
    originTab: "在新窗口打开源网站",
    closeViewer: "关闭照片查阅器",
    dismiss: "关闭窗口",
    confirmLiveAd: "确认并进入实时广告排期审核",
    criteriaError: "请务必完成所有必填的说明字段。",
    brandName: "品牌名称 (例如 Soko Co)",
    taglineLabel: "亮点标语 (例如 独家优惠 / 特惠直达)",
    descriptionLabel: "产品及促销详细说明",
    ctaLabel: "行动自定义按钮文字",
    targetAction: "定向触发动作选项",
    actionValue: "动作参数或独家折扣代码",
    bannerGraphics: "选择对应的宣传场景代表图",
    deployBtn: "部署上架此平面广告",
    customSponsor: "社区自上架广告",
    "Bestgemdiamond Fine Crafts": "Bestgemdiamond 精美手工制品",
    "Authenticity & Elegance Assured": "官方品质与精湛工艺承诺",
    "Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.": "订购纯正非洲红宝石、高克拉祖母绿矿石和手工雕刻桃花心木艺术摆件，为您提供全额托管保险服务。",
    "Shop Fine Collectibles": "采购顶级艺术珍藏",
    "Moscovium Node-V5 Silicon Compute": "莫斯科元素 Node-V5 图形超级算力",
    "High-Processing Node Lease": "云端算力及图像服务器租赁",
    "Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.": "即时租用物理 24GB 显存算力节点。首次租用享受专属 15% 折扣，快速调度算力资源。",
    "Claim 15% Rent Promo": "立即提取15%优惠卷",
    "Moscovium115 Git Integration Service": "Moscovium115 Git 仓储一键同步工具",
    "Publish Directly via Git Commits": "由 Git Commit 构建一键同步列表",
    "Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.": "为您一键同步商品库存，编写符合您的命令，仅需60秒自动对接仓储代码。",
    "Launch Code Assistant": "调出配置助理",
    "Orion Lunar Propulsion Systems": "猎户座航天级轨道航空推动系统",
    "Vacuum-Tested High-Bypass Turbine Vanes": "通过严苛真空密封检测的高容量涡轮叶片",
    "Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.": "拥有航空局多国资质的高精密钛合金燃烧器及引导电路网板。",
    "Acquire Avionics Parts": "订购精密航空配件",
    "Aetheric Enterprise License Keys": "以太云网络企业级授权秘钥",
    "Secure Crypto Software Transfer": "高强度加密数字产品安全交付密钥",
    "Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.": "快速下发软件升级激活钥匙、永久 IDE 证书及服务器密匙。",
    "Unlock Premium Keys": "解密激活这些密钥",
    "Yeti Jade-Molded Natural Specimen": "雪山喜马拉雅天然翡翠和玉石毛料",
    "Premium Nepalese Geodes & Jade": "精美尼泊尔透辉晶石与缅甸玉石毛坯",
    "Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.": "喜马拉雅山切片玉石，安全木盒专递，全额保价运输。",
    "Explore Sacred Minerals": "挑选稀有矿产标本",
    "Neo-Tokyo Heavy Tactical Wear": "新东京多功能重装战术服饰",
    "Reflective Intelligent Outerwear": "高对比夜间反光智能防风外套",
    "Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.": "专门应对恶劣多雨气象和极客日常出行的碳纤维定制配饰。",
    "View Techwear Apparel": "浏览战术潮流商品",
    "Moscovium Centrifugal Ore Concentrators": "莫斯科双转子高速精细选矿离心机",
    "High-Throughput Magnetic Separation": "高通过率数字控制电磁选矿分离",
    "Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.": "极速提取贵重金属、稀有锂矿与铜金沙的高产出矿业设备。",
    "Deploy Heavy Tools": "配置这些大型机具",
    "Secured Trans-Ocean Logistics Advices": "远洋高净值担保与安全物流咨询服务",
    "Automated Escrow Clearances": "海运法规及智能资金安全放算方案",
    "Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.": "为您出具大宗外贸、特殊艺术品的信托托管与通关解决方案。",
    "Connect Specialist": "联络在案顾问专家",
    "Moscovium Automated Ledger Vault": "莫斯科高等级底层账簿安全库",
    "Verified Multi-Currency Escrow Sync": "合规多币种账户流动担保确认",
    "Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.": "采用内建高安全性，自动审查买卖账目，实现全球跨网极速确领结算。",
    "Open Merchant Payouts": "结算我的卖家钱包"
  },
  ar: {
    verifiedSponsors: "رعاة Moscovium المعتمدون بنجاح",
    runningCount: "يعمل حالياً",
    deployBanner: "انشر بانا إعلاني جديد",
    interactions: "من تفاعلات العملاء",
    copied: "تم نسخ الكود الترويجي!",
    deployCustomAd: "ادرج بوابتك لترويج الإعلانات",
    adFocus: "شكل الإعلان المقرب",
    sponsorWord: "الراعي الرسمي",
    originTab: "فتح الرابط الأساسي للإعلان",
    closeViewer: "اغلق نافذة الفحص",
    dismiss: "اغلاق",
    confirmLiveAd: "تأكيد إطلاق الإعلان على الشبكة",
    criteriaError: "يرجى تعبئة كافة الحقول التوضيحية المطلوبة.",
    brandName: "اسم العلامة التجارية (مثال: Soko)",
    taglineLabel: "العنوان الترويجي المميز (مثال: أفضل الأسعار)",
    descriptionLabel: "تفاصيل العرض الترويجي للمنتج",
    ctaLabel: "اسم نص زر الإعلان المفضل لك",
    targetAction: "إجراء التوجيه التلقائي للإعلان",
    actionValue: "الرمز الترويجي / كود الفرز الافتراضي",
    bannerGraphics: "تفضيل شكل ورسمة البانر المحددة",
    deployBtn: "ادرج المربع الإعلاني على الفور",
    customSponsor: "راعي مجمع من المجتمع",
    "Bestgemdiamond Fine Crafts": "الحرف اليدوية الثمينة من Bestgemdiamond",
    "Authenticity & Elegance Assured": "ضمان الأصالة الفائقة والجمال الطبيعي",
    "Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.": "اشترِ الياقوت الإفريقي الخام الحقيقي، وأحجار الزمرد غير المصقولة عالية الجودة مع تغطية تأمينية مالية معلقة.",
    "Shop Fine Collectibles": "تسوق المقتنيات الرائعة",
    "Moscovium Node-V5 Silicon Compute": "عقد معالجة سيليكون Moscovium Node-V5",
    "High-Processing Node Lease": "استئجار مصفوفة حوسبة مخصصة",
    "Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.": "وظف معالجات VRAM بسعة 24 جيجا مخصصة للذكاء الاصطناعي مع خصم فوري قيمته 15%.",
    "Claim 15% Rent Promo": "احصل على كارت الخصم",
    "Moscovium115 Git Integration Service": "بوابة ربط مشاريع ومستودعات جيت",
    "Publish Directly via Git Commits": "النشر المباشر عبر عمليات فحص جيت",
    "Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.": "نظم أعمال متجرك والرفع المؤتمت لملفاتك في 60 ثانية باستخدام معالج جيت السريع.",
    "Launch Code Assistant": "أطلق المعالج المساعد",
    "Orion Lunar Propulsion Systems": "أنظمة الدفع القمري الفضائي من Orion",
    "Vacuum-Tested High-Bypass Turbine Vanes": "شفرات توربينات معتمدة ومقواة في غرف مفرغة",
    "Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.": "احصل على محركات حرق من التيتانيوم ومعدات ملاحة دقيقة مرخصة بالكامل.",
    "Acquire Avionics Parts": "اقتنِ قطع الغيار الدقيقة",
    "Aetheric Enterprise License Keys": "مفاتيح تراخيص شبكات Aetheric للمؤسسات",
    "Secure Crypto Software Transfer": "مفاتيح التسليم البرمجي المؤمن بالكامل",
    "Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.": "حمل برامج الحوسبة ورخص المطورين لبيئات البرمجة السريعة.",
    "Unlock Premium Keys": "افتح قفل التراخيص",
    "Yeti Jade-Molded Natural Specimen": "أحجار الجاد والزمرد النيبالي الثمين",
    "Premium Nepalese Geodes & Jade": "الجيود وأحجار جاد النفرت الخام من هيمالايا",
    "Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.": "عينات حجر جاد الجبلية الأصلية مغلفة ومحمية بعناية فائقة.",
    "Explore Sacred Minerals": "استعرض الأحجار الكريمة",
    "Neo-Tokyo Heavy Tactical Wear": "الملابس التكتيكية المقاومة من Neo-Tokyo",
    "Reflective Intelligent Outerwear": "معاطف المطر الذكية اللامعة وسترات ثقيلة",
    "Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.": "حقائب و ملابس مصممة لمقاومة شتاء الملاحة والحياة العصرية القاسية.",
    "View Techwear Apparel": "تفقد رداء وتجهيزات الموضة",
    "Moscovium Centrifugal Ore Concentrators": "أجهزة فصل المعادن بالطرد المركزي Moscovium",
    "High-Throughput Magnetic Separation": "أنظمة الفرز الكهرومغناطيسي للمعادن",
    "Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.": "آلات دوارة لتعدين وتنقية الذهب والفضة والليثيوم عالي الكثافة.",
    "Deploy Heavy Tools": "ادرج المعدات الثقيلة",
    "Secured Trans-Ocean Logistics Advices": "الاستشارات اللوجستية البحرية الكبرى والائتمان",
    "Automated Escrow Clearances": "أدلة المياومة البحرية وتخليص الأموال",
    "Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.": "حلول استشارات نقل البضائع الحيوية والقطع الأثرية الثمينة.",
    "Connect Specialist": "اتصل بالخبير المعين",
    "Moscovium Automated Ledger Vault": "بوابات الدفتر المالي المؤتمتة من Moscovium",
    "Verified Multi-Currency Escrow Sync": "مزامنة أموال معلقة متعددة العملات مشفرة",
    "Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.": "بوابة برمجية عالية الأمان تراقب حركة الودائع والمدفوعات فورياً.",
    "Open Merchant Payouts": "تسييل أرباح متجري الإلكتروني"
  },
  ru: {
    verifiedSponsors: "Сертифицированные спонсоры Moscovium",
    runningCount: "- активные",
    deployBanner: "Разместить спонсорский баннер",
    interactions: "активностей",
    copied: "Промокод скопирован!",
    deployCustomAd: "Разместить рекламный модуль спонсора",
    adFocus: "Фокус изображения",
    sponsorWord: "Спонсор",
    originTab: "Открыть исходную вкладку",
    closeViewer: "Закрыть просмотр",
    dismiss: "Закрыть окно",
    confirmLiveAd: "Подтвердить публикацию рекламы",
    criteriaError: "Пожалуйста, заполните все поля описания.",
    brandName: "Название бренда (например, Soko Co)",
    taglineLabel: "Привлекательный слоган (например, Лучшая цена)",
    descriptionLabel: "Описание продукта или рекламной кампании",
    ctaLabel: "Текст кнопки призыва к действию (CTA)",
    targetAction: "Тип перенаправления действия",
    actionValue: "Параметр действия / Промокод",
    bannerGraphics: "Выберите визуальный стиль баннера",
    deployBtn: "Запустить рекламный блок",
    customSponsor: "Спонсор сообщества",
    "Bestgemdiamond Fine Crafts": "Изумительные шедевры Bestgemdiamond",
    "Authenticity & Elegance Assured": "Гарантия подлинности и элегантности",
    "Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.": "Приобретайте необработанные африканские рубины, чистые изумруды высокого качества и скульптуры ручной работы из красного дерева с полной гарантией безопасности сделки эскроу.",
    "Shop Fine Collectibles": "Купить коллекционные ценности",
    "Moscovium Node-V5 Silicon Compute": "Вычислительные силиконовые узлы Moscovium Node-V5",
    "High-Processing Node Lease": "Аренда высокопроизводительных узлов вычислений",
    "Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.": "Развертывайте графические узлы рендеринга удаленно с 24 ГБ активной памяти видеокарты. Получите скидку 15% на первую покупку.",
    "Claim 15% Rent Promo": "Забрать скидку 15% на аренду",
    "Moscovium115 Git Integration Service": "Служба интеграции Git Moscovium115",
    "Publish Directly via Git Commits": "Публикация напрямую через коммиты Git",
    "Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.": "Автоматизируйте листинги на торговой площадке безопасно. Сгенерируйте команды git-push за 60 секунд с помощью вспомогательных скриптов.",
    "Launch Code Assistant": "Запустить ассистента кода",
    "Orion Lunar Propulsion Systems": "Лунная двигательная система Orion",
    "Vacuum-Tested High-Bypass Turbine Vanes": "Испытанные в вакууме лопатки турбины высокого давления",
    "Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.": "Покупайте титановые камеры сгорания аэрокосмического класса, усовершенствованные печатные платы телеметрии и высококлассные комплектующие.",
    "Acquire Avionics Parts": "Приобрести авиационные детали",
    "Aetheric Enterprise License Keys": "Корпоративные лицензионные ключи Aetheric",
    "Secure Crypto Software Transfer": "Безопасная передача ключей шифрования ПО",
    "Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.": "Мгновенно скачивайте верифицированные лицензии ПО и ключи управления серверами высокой скорости.",
    "Unlock Premium Keys": "Разблокировать премиум ключи",
    "Yeti Jade-Molded Natural Specimen": "Экземпляр природного нефрита Yeti",
    "Premium Nepalese Geodes & Jade": "Первоклассные непальские геоды и нефрит",
    "Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.": "Природный полудрагоценный нефрит напрямую из гималайских разломов. Поставляется в защищенных кейсах с гарантией.",
    "Explore Sacred Minerals": "Исследовать священные минералы",
    "Neo-Tokyo Heavy Tactical Wear": "Тяжелая тактическая одежда Neo-Tokyo",
    "Reflective Intelligent Outerwear": "Светоотражающая умная верхняя одежда",
    "Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.": "Водонепроницаемые модульные куртки, технологичные разгрузки и карбоновые аксессуары для сложных погодных условий.",
    "View Techwear Apparel": "Посмотреть тактическую одежду",
    "Moscovium Centrifugal Ore Concentrators": "Центробежные рудные концентраторы Moscovium",
    "High-Throughput Magnetic Separation": "Высокоэффективная электромагнитная очистка",
    "Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.": "Промышленные центробежные сепараторы с постоянной обратной связью для очистки металлов высокого качества.",
    "Deploy Heavy Tools": "Задействовать тяжелое оборудование",
    "Secured Trans-Ocean Logistics Advices": "Безопасный трансокеанский логистический консалтинг",
    "Automated Escrow Clearances": "Автоматизированное совершение безопасных сделок эскроу",
    "Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.": "Экспертные консультации по международным морским грузоперевозкам, оформлению ценного искусства и финансовой защите цифровых активов.",
    "Connect Specialist": "Связаться со специалистом",
    "Moscovium Automated Ledger Vault": "Автоматизированное распределенное хранилище Moscovium",
    "Verified Multi-Currency Escrow Sync": "Синхронизация многовалютных безопасных счетов",
    "Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.": "Встроенная защита сделок: автоматическая проверка балансов и координирование мгновенных выплат в различных сетях.",
    "Open Merchant Payouts": "Открыть выплаты для продавцов"
  },
  it: {
    verifiedSponsors: "Sponsor Certificati di Moscovium",
    runningCount: "In esecuzione",
    deployBanner: "Pubblica un Banner Sponsor",
    interactions: "Interazioni",
    copied: "Codice Copiato!",
    deployCustomAd: "Pubblica Nodo di Sponsor Personalizzato",
    adFocus: "Focus Immagine",
    sponsorWord: "Sponsor",
    originTab: "Apri Scheda Originale",
    closeViewer: "Chiudi Visualizzatore",
    dismiss: "Chiudi Finestra",
    confirmLiveAd: "Conferma Lancio Campagna Pubblicitaria",
    criteriaError: "Si prega di completare tutti i campi descrittivi.",
    brandName: "Nome del Marchio (es. Soko Co)",
    taglineLabel: "Slogan di Rilievo (es. Miglior Prezzo)",
    descriptionLabel: "Descrizione del Prodotto o della Promozione",
    ctaLabel: "Testo di Chiamata all'Azione (CTA)",
    targetAction: "Tipo di Azione Diretta",
    actionValue: "Parametro di Azione / Codice Promo",
    bannerGraphics: "Seleziona la Grafica del Banner",
    deployBtn: "Distribuisci Spazio Ad",
    customSponsor: "Sponsor della Comunità",
    "Bestgemdiamond Fine Crafts": "Artigianato d'Eccellenza Bestgemdiamond",
    "Authenticity & Elegance Assured": "Autenticità & Eleganza Garantite",
    "Procure authentic raw African rubies, high-carat loose emerald specimens, and hand-molded mahogany sculptures delivered directly to your logistics point with full escrow insurance.": "Acquista rubini africani grezzi certificati, smeraldi purissimi ad alto carato e sculture in mogano rifinite a mano con assicurazione di deposito a garanzia.",
    "Shop Fine Collectibles": "Acquista Oggetti da Collezione",
    "Moscovium Node-V5 Silicon Compute": "Potenza di Calcolo al Silicio Moscovium Node-V5",
    "High-Processing Node Lease": "Noleggio Node GPU di Elaborazione",
    "Deploy real-time remote graphic training nodes with 24GB VRAM active. Low latency orbital telemetry guaranteed. Get 15% off your first hardware partition.": "Distribuisci nodi remoti di elaborazione grafica con 24 GB di VRAM attiva. Ottieni il 15% di sconto sul primo noleggio.",
    "Claim 15% Rent Promo": "Riscatta lo Sconto del 15%",
    "Moscovium115 Git Integration Service": "Servizio di Integrazione Git Moscovium115",
    "Publish Directly via Git Commits": "Pubblica Direttamente tramite Commit Git",
    "Automate your marketplace listings securely. Generate custom git-push commands in 60 seconds using our pre-formatted repository sync wizard scripts.": "Automatizza gli inserimenti nel mercato. Genera comandi git-push personalizzati in 60 secondi con i nostri script.",
    "Launch Code Assistant": "Avvia Assistente di Codice",
    "Orion Lunar Propulsion Systems": "Sistemi di Propulsione Lunare Orion",
    "Vacuum-Tested High-Bypass Turbine Vanes": "Palette di Turbina Certificate per Flussi nel Vuoto",
    "Procure space-grade titanium combustors, advanced guidance telemetry circuit boards, and custom turbine vanes with international aerospace clearance certificates.": "Fornitura di combustori in titanio di livello aerospaziale e schede di controllo ad alta precisione.",
    "Acquire Avionics Parts": "Acquista Parti Telefoniche Aeree",
    "Aetheric Enterprise License Keys": "Chiavi di Licenza Aziendali Aetheric",
    "Secure Crypto Software Transfer": "Trasferimento Sicuro di Licenze Software Criptate",
    "Instantly download premium verified software codes, container keys, and lifetime licenses for high-speed IDE architectures and server partition management tools.": "Scarica all'istante chiavi software certificate, licenze permanenti e pacchetti di installazione.",
    "Unlock Premium Keys": "Sblocca le Chiavi Premium",
    "Yeti Jade-Molded Natural Specimen": "Campione d'Arte in Giada del Nepal",
    "Premium Nepalese Geodes & Jade": "Geodi dell'Himalaya e Giada Naturale",
    "Directly sourced premium nephrite raw-cut specimens from the central Himalayan faults. Each shipment comes wrapped in insulated mahogany canisters with physical escrows.": "Giada nefrite grezza proveniente direttamente dalle faglie dell'Himalaya in casse di mogano.",
    "Explore Sacred Minerals": "Esplora i Minerali Sacri",
    "Neo-Tokyo Heavy Tactical Wear": "Abbigliamento Tecnico Tattico Neo-Tokyo",
    "Reflective Intelligent Outerwear": "Giacche di Protezione Catarifrangenti",
    "Waterproof high-grade modular jackets, techwear pocket rigs, and carbon-fiber aesthetic accessories designed for rough climates and heavy daily commutes.": "Impermeabili all'avanguardia con finiture robuste in fibra di carbonio.",
    "View Techwear Apparel": "Visualizza Collezione Techwear",
    "Moscovium Centrifugal Ore Concentrators": "Concentratori Centrifughi per Minerali Moscovium",
    "High-Throughput Magnetic Separation": "Separazione Magnetica a Grande Volume",
    "Modular dual-rotor fine centrifugal separators with active digital frequency feedback. Handles heavy gold, copper, and rare lithium refining with high yield extraction.": "Solfatrici e macchinari industriali modulari a risposta digitale attiva per metalli nobili.",
    "Deploy Heavy Tools": "Distribuisci Attrezzi Pesanti",
    "Secured Trans-Ocean Logistics Advices": "Consulenza di Logistica Marittima Protetta",
    "Automated Escrow Clearances": "Approvazioni di Deposito a Garanzia Automatiche",
    "Expert consultation for orbital cargo transfers, high-value art escrows, maritime legal clearances, and global digital asset transaction protection schemes.": "Consulenze di alto profilo per scambi regolamentati internazionali e tutele finanziarie.",
    "Connect Specialist": "Contatta lo Specialista",
    "Moscovium Automated Ledger Vault": "Cassaforte dei Registri Automatici Moscovium",
    "Verified Multi-Currency Escrow Sync": "Sincronizzazione Multivaluta Protetta di Depositi",
    "Protect your transactions natively. Our platform checks incoming merchant balances and coordinates smart payout timelines across multiple networks live.": "Piattaforma nativa per tutele immediate con validazione in tempo reale.",
    "Open Merchant Payouts": "Apri i Pagamenti Merchant"
  }
};

export default function MoscoviumAds({ 
  onSelectCategory, 
  onSwitchView, 
  setSearchQuery, 
  lang = 'en', 
  ads, 
  setAds,
  sellerStats,
  onUpdateStats
}: MoscoviumAdsProps) {
  const adT = (key: string) => {
    return AD_TRANSLATIONS[lang]?.[key] || AD_TRANSLATIONS['en']?.[key] || key;
  };
  const [currentAdIdx, setCurrentAdIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);
  
  // Custom Ad Draft State
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCta, setNewCta] = useState('View Special Hub');
  const [newActionType, setNewActionType] = useState<'category' | 'code' | 'view'>('category');
  const [newActionValue, setNewActionValue] = useState('digital-downloads');
  const [selectedImg, setSelectedImg] = useState(STOCK_IMAGES[0]);
  const [adFormError, setAdFormError] = useState('');

  // Active Ad Payment State Managers
  const [promoTier, setPromoTier] = useState<'economy' | 'supreme'>('economy');
  const [promoDurationDays, setPromoDurationDays] = useState<number>(7);
  const [customDaysValue, setCustomDaysValue] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'paypal'>('wallet');
  const [promoDailyRate, setPromoDailyRate] = useState<number>(0.5);
  useEffect(() => {
    setPromoDailyRate(promoTier === 'economy' ? 0.5 : 1.0);
  }, [promoTier]);
  
  // Simulated Card Fields
  const [cardNumber, setCardNumber] = useState('4115 8823 9940 7116');
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('115');
  
  // Payment Status Flow
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [recordedTxId, setRecordedTxId] = useState('');
  const [lastReceipt, setLastReceipt] = useState<{
    title: string;
    duration: number;
    totalCost: number;
    method: string;
    txId: string;
    tier: string;
  } | null>(null);

  const activeAds = ads.filter(a => a.isActive !== false);
  const currentAd = activeAds[currentAdIdx] || activeAds[0] || ads[0];

  const handleNext = () => {
    if (activeAds.length === 0) return;
    setCurrentAdIdx((prev) => (prev + 1) % activeAds.length);
    setCopiedCode(null);
  };

  const handlePrev = () => {
    if (activeAds.length === 0) return;
    setCurrentAdIdx((prev) => (prev - 1 + activeAds.length) % activeAds.length);
    setCopiedCode(null);
  };

  const handleAction = (ad: MoscoviumAd) => {
    // Record click count
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, clicks: a.clicks + 1 } : a));

    if (ad.actionType === 'category') {
      onSelectCategory(ad.actionValue);
      // Auto scroll to products/categories header
      const element = document.getElementById('marketplace-anchor');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (ad.actionType === 'view') {
      onSwitchView(ad.actionValue as 'marketplace' | 'dashboard' | 'git-assistant');
    } else if (ad.actionType === 'code') {
      navigator.clipboard.writeText(ad.actionValue);
      setCopiedCode(ad.actionValue);
      setTimeout(() => {
        setCopiedCode(null);
      }, 3000);
    }
  };

  const handlePublishAdWithChoice = (isPaid: boolean) => {
    if (!newTitle.trim() || !newTagline.trim() || !newDesc.trim()) {
      setAdFormError('Please fill out all descriptive criteria fields.');
      return;
    }

    const days = promoDurationDays;
    const minRate = promoTier === 'economy' ? 0.5 : 1.0;
    let dailyRate = Number(promoDailyRate) || minRate;
    if (dailyRate < minRate) dailyRate = minRate;
    if (dailyRate > 100) dailyRate = 100;
    const totalCost = dailyRate * days;

    if (isPaid && paymentMethod === 'wallet') {
      const currentWallet = sellerStats ? sellerStats.wallet : 25.50;
      if (currentWallet < totalCost) {
        setAdFormError(`Your merchant wallet balance ($${currentWallet.toFixed(2)}) is insufficient to deploy this ad campaign ($${totalCost.toFixed(2)}). Please list more products, wait for order deliveries, or use the Immediate Credit Card selection to complete checkouts.`);
        playNotificationSound();
        return;
      }
    }

    setIsProcessingPayment(true);
    setAdFormError('');

    // Simulate merchant bank gateway request and escrow layout confirmation
    setTimeout(() => {
      // Deduct balance from wallet if selected and paid
      if (isPaid && paymentMethod === 'wallet' && sellerStats && onUpdateStats) {
        onUpdateStats(prev => ({
          ...prev,
          wallet: prev.wallet - totalCost
        }));
      }

      // Generate randomized hex transaction token representation
      const txnID = `TXN-MOS-${Math.floor(100000 + Math.random() * 900000)}`;
      setRecordedTxId(txnID);

      const createdAd: MoscoviumAd = {
        id: `ad-custom-${Date.now()}`,
        title: newTitle.trim(),
        tagline: newTagline.trim(),
        description: newDesc.trim(),
        ctaText: newCta.trim(),
        image: selectedImg,
        bgColor: promoTier === 'supreme' 
          ? 'from-slate-950 via-amber-950 to-rose-955' 
          : 'from-slate-900 via-rose-950 to-indigo-950',
        tag: promoTier === 'supreme' ? 'Sponsor Grand Master' : 'Community Sponsor',
        badgeColor: promoTier === 'supreme' 
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 font-mono font-black' 
          : 'bg-rose-500/10 text-rose-300 border-rose-500/20 font-mono font-medium',
        actionType: newActionType,
        actionValue: newActionValue.trim(),
        clicks: 0,
        durationDays: days,
        dailyRate: dailyRate,
        isActive: isPaid
      };

      setAds((prev) => [createdAd, ...prev]);
      setCurrentAdIdx(0); // Present fresh deployment right away

      setLastReceipt({
        title: newTitle.trim(),
        duration: days,
        totalCost: isPaid ? totalCost : 0,
        method: !isPaid 
          ? 'Draft - Unpaid' 
          : paymentMethod === 'wallet' 
            ? 'Moscovium Secure Wallet Balance' 
            : paymentMethod === 'paypal' 
              ? 'PayPal Fast Checkout Express' 
              : `Visa Card (Ending ...${cardNumber.slice(-4)})`,
        txId: txnID,
        tier: promoTier === 'supreme' ? 'Supreme Featured Partner (rotated high)' : 'Economy Rotation Module'
      });

      setIsProcessingPayment(false);
      setIsPaymentSuccess(true);
      
      // Ka-Cheng money bell chings perfectly!
      playCashRegisterSound();
    }, 1200);
  };

  const handlePublishAd = (e: React.FormEvent) => {
    e.preventDefault();
    handlePublishAdWithChoice(true);
  };

  const handleCloseReceipt = () => {
    setIsPaymentSuccess(false);
    setIsSubmitOpen(false);
    
    // Reset Draft values
    setNewTitle('');
    setNewTagline('');
    setNewDesc('');
    setNewCta('View Special Hub');
    setAdFormError('');
  };

  return (
    <div id="moscovium-ads-section" className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      
      {/* Container header for the ads portal row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-red-600/15 text-red-650 flex items-center justify-center rounded-sm">
            <Megaphone className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
            {adT('verifiedSponsors')}
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block ml-0.5" />
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded ml-1">
            {activeAds.length} {adT('runningCount')}
          </span>
        </div>
        
        <button
          onClick={() => setIsSubmitOpen(true)}
          className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <PlusCircle className="h-3.5 w-3.5 text-red-600" />
          <span>{adT('deployBanner')}</span>
        </button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-250 bg-white shadow-md">
        
        {/* Ad block grid */}
        <div className={`p-5 sm:p-8 bg-gradient-to-br ${currentAd.bgColor} text-white flex flex-col md:flex-row items-center gap-6 min-h-[190px] relative`}>
          
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm border ${currentAd.badgeColor}`}>
              {adT(currentAd.tag)}
            </span>
            <span className="text-[9px] text-slate-400 font-mono bg-black/15 px-2 py-1 rounded">
              🖲️ {currentAd.clicks} {adT('interactions')}
            </span>
          </div>

          {/* Ad graphics preview thumbnail element */}
          <div className="w-24 h-16 md:w-32 md:h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-md">
            <img 
              src={currentAd.image} 
              alt={adT(currentAd.title)} 
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
              }}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 select-none"
            />
          </div>

          {/* Ad texts content row */}
          <div className="flex-1 text-left space-y-1.5 z-10 pr-6 animate-fade-in animate-duration-150">
            <span className="text-rose-450 font-bold uppercase tracking-wider text-[10px] font-mono leading-none block">
              {adT(currentAd.tagline)}
            </span>
            <h2 className="text-xl md:text-2xl font-black font-display text-white uppercase tracking-tight leading-none">
              {adT(currentAd.title)}
            </h2>
            <p className="text-xs text-slate-300 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl font-sans">
              {adT(currentAd.description)}
            </p>
          </div>

          {/* Ad CTA action button */}
          <div className="z-10 shrink-0 mt-2 md:mt-0 w-full md:w-auto">
            <button
              onClick={() => handleAction(currentAd)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 font-bold px-5 py-2.5 rounded-2xl text-xs tracking-wide transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-97 select-none font-sans"
            >
              <span>{adT(currentAd.ctaText)}</span>
              <ArrowRight className="h-4 w-4 text-red-655" />
            </button>
          </div>

          {/* Navigation layout controls arrows */}
          <div className="absolute bottom-4 right-4 z-10 flex gap-1.5">
            <button
              onClick={handlePrev}
              type="button"
              className="p-1 px-2.5 rounded-lg border border-white/10 bg-black/15 text-white/50 hover:text-white hover:bg-black/35 transition-colors cursor-pointer text-[10px] uppercase font-bold font-mono"
              title="Prev Campaign"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="p-1 px-2.5 rounded-lg border border-white/10 bg-black/15 text-white/50 hover:text-white hover:bg-black/35 transition-colors cursor-pointer text-[10px] uppercase font-bold font-mono"
              title="Next Campaign"
            >
              →
            </button>
          </div>

        </div>
      </div>

      {/* Upload Sponsorship node modal */}
      <AnimatePresence>
        {isSubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop slide */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessingPayment && setIsSubmitOpen(false)}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            />

            {/* Modal content frame card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header block */}
              <div className="flex items-center justify-between p-4 border-b border-slate-150">
                <div className="flex items-center gap-2">
                  <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                    <Sparkles className="h-4 w-4 text-red-650 shrink-0" />
                  </div>
                  <div className="text-left font-sans text-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider leading-none">
                      {adT('adCenter')}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono leading-none mt-1">Configure Ad Placement Nodes</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => !isProcessingPayment && setIsSubmitOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-150 transition-colors cursor-pointer"
                  title="Close Modal"
                  disabled={isProcessingPayment}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body container with scroll capabilities */}
              <div className="p-4 overflow-y-auto">
                {isProcessingPayment ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5 animate-pulse">
                    <h3 className="text-sm font-black font-display text-slate-900 uppercase tracking-widest">
                      Securing Escrow Channel
                    </h3>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-xs mx-auto">
                      Routing cryptographic deposit confirmation ledger through local node. This will secure active sponsor position in rotated main ticker...
                    </p>
                  </div>
                  <div className="w-full max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-red-650 h-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </div>
                  <span className="text-[9px] text-red-600 font-mono font-black animate-pulse">
                    SETTLING DIGITAL TRANSACTION ASSETS LIVE
                  </span>
                </div>
              ) : isPaymentSuccess && lastReceipt ? (
                <div className="space-y-5 p-2 text-slate-800">
                  <div className="flex flex-col items-center text-center space-y-2 mb-2">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="h-6 w-6 animate-bounce-subtle" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 font-mono bg-emerald-50 px-2.5 py-0.5 rounded">
                        Payment Successfully Authorized
                      </span>
                      <h3 className="text-sm font-black text-slate-950 font-display uppercase tracking-tight mt-1">
                        Escrow Receipt Invoice
                      </h3>
                    </div>
                  </div>

                  {/* Receipt Card Container */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-3 text-xs font-sans font-medium">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2.5">
                      <span className="text-slate-400">Invoice Ledger ID</span>
                      <span className="font-mono font-bold text-slate-900">{lastReceipt.txId}</span>
                    </div>

                    <div className="space-y-2 border-b border-slate-200/60 pb-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sponsor Brand</span>
                        <span className="font-bold text-slate-800">{lastReceipt.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Placement Tier</span>
                        <span className="font-semibold text-slate-800 font-mono text-[10px]">{lastReceipt.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sponsor Duration</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-red-650" />
                          {lastReceipt.duration} Days Active Run
                        </span>
                      </div>
                    </div>

                    {/* Daily rate custom input */}
                    <div className="space-y-2 mt-3">
                      <label className="block text-[11px] font-bold text-slate-655">Set Daily Rate (USD)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={promoTier === 'economy' ? 0.5 : 1.0}
                          max={100}
                          step={0.25}
                          value={promoDailyRate}
                          onChange={(e) => setPromoDailyRate(Number(e.target.value))}
                          className="w-36 rounded-xl border border-slate-300 p-2 text-sm font-mono"
                        />
                        <div className="text-xs text-slate-500">Min ${promoTier === 'economy' ? '0.50' : '1.00'} — Max $100.00</div>
                      </div>
                    </div>

                    <div className="space-y-2 border-b border-slate-200/60 pb-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Settlement Method</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          {lastReceipt.method.includes('Wallet') ? (
                            <Wallet className="h-3.5 w-3.5 text-red-650" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5 text-red-650" />
                          )}
                          {lastReceipt.method}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Agreement Term</span>
                        <span className="text-emerald-700 font-bold text-[9px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono">
                          Escrow Secured Lock
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-1 text-sm font-black text-slate-900 uppercase">
                      <span className="font-display">Total Paid</span>
                      <span className="text-red-650 font-mono font-extrabold text-sm">${lastReceipt.totalCost.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-2xl border border-amber-100 p-3.5 text-[11px] leading-relaxed text-amber-800 flex gap-2.5">
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>Your sponsor banner is running now!</strong> We queued it as the absolute first node on the verified home sponsor array. Tap the button below to review your live placement.
                    </p>
                  </div>

                  <button
                    onClick={handleCloseReceipt}
                    type="button"
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                  >
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Close & View Live Carousel</span>
                  </button>
                </div>
              ) : (
                <>
                  {adFormError && (
                    <div className="p-3 mb-3 bg-red-50 text-red-650 border border-red-100 rounded-xl text-xs font-semibold font-sans flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{adT(adFormError) || adFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePublishAd} className="space-y-4 text-xs font-medium text-slate-700 max-h-[70vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-650 text-left">{adT('brandName')}</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Ruby Craft Co."
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full rounded-xl border border-slate-350 p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 font-sans"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-650 text-left">{adT('taglineLabel')}</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Authentic Mineral Source"
                          value={newTagline}
                          onChange={(e) => setNewTagline(e.target.value)}
                          className="w-full rounded-xl border border-slate-350 p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 font-sans"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-[11px] font-bold text-slate-650 font-sans">{adT('descriptionLabel') || 'Ad Campaign Body Description'}</label>
                      <textarea 
                        required
                        placeholder="Provide detailed aspects of your offering..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none font-sans bg-white text-left"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label className="block text-[11px] font-bold text-slate-650 font-sans">{adT('ctaLabel') || 'CTA Button Text'}</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Grab 10% Off"
                          value={newCta}
                          onChange={(e) => setNewCta(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white font-sans"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="block text-[11px] font-bold text-slate-650 font-sans">{adT('targetAction') || 'Target Redirect Action'}</label>
                        <select
                          value={newActionType}
                          onChange={(e) => setNewActionType(e.target.value as any)}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white font-sans"
                        >
                          <option value="category">Go to Category Listing</option>
                          <option value="view">Navigate View Dashboard</option>
                          <option value="code">Re-copy Special Code Promotion</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-[11px] font-bold text-slate-655 font-sans">{adT('actionValue') || 'Redirect Target Parameter'}</label>
                      {newActionType === 'category' ? (
                        <select
                          value={newActionValue}
                          onChange={(e) => setNewActionValue(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white font-sans"
                        >
                          <option value="all-vehicles-parts">All Vehicles/Parts</option>
                          <option value="art-collectibles">Art & Collectibles</option>
                          <option value="digital-downloads">Digital Downloads</option>
                          <option value="fashion-beauty">Fashion/Beauty</option>
                          <option value="home-office-lifestyle">Home/Office/Lifestyle</option>
                          <option value="industrial-equipment-tools">Industrial Equipment/Tools</option>
                          <option value="services">Services</option>
                        </select>
                      ) : newActionType === 'view' ? (
                        <select
                          value={newActionValue}
                          onChange={(e) => setNewActionValue(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white font-sans"
                        >
                          <option value="marketplace">Marketplace Feed</option>
                          <option value="dashboard">Merchant Payout Center</option>
                          <option value="git-assistant">Git Upload Assistant</option>
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. SPECIAL_GOLD_50"
                          value={newActionValue}
                          onChange={(e) => setNewActionValue(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none bg-white font-sans"
                        />
                      )}
                    </div>

                    {/* Cover presentation presets */}
                    <div className="space-y-2 text-left">
                      <label className="block text-[11px] font-bold text-slate-650 font-sans">{adT('bannerGraphics') || 'Banner Cover Image Style'}</label>
                      <div className="flex gap-2.5 overflow-x-auto pb-1">
                        {STOCK_IMAGES.map((img, index) => (
                          <button
                            type="button"
                            key={index}
                            onClick={() => setSelectedImg(img)}
                            className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                              selectedImg === img ? 'border-red-650 scale-105' : 'border-slate-200 opacity-60'
                            }`}
                          >
                            <img src={img} alt={`Img Option ${index}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                                  {/* ACTIVE PLACEMENT PLANS & PRICING */}
                    <div className="border-t border-slate-150 pt-3.5 space-y-2.5 font-sans">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-650 block shrink-0" />
                        <span>Sponsorship Placement Tier</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <label className={`relative border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all select-none text-left ${
                          promoTier === 'economy' 
                            ? 'border-red-650 bg-red-50/40 text-red-955 font-bold' 
                            : 'border-slate-200 bg-white hover:border-slate-350 text-slate-755'
                        }`}>
                          <input 
                            type="radio" 
                            name="promoTier" 
                            checked={promoTier === 'economy'}
                            onChange={() => setPromoTier('economy')}
                            className="sr-only" 
                          />
                          <div className="space-y-1">
                            <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 block font-mono">Rotation Node</span>
                            <span className="font-display font-black text-xs block leading-none">Economy Placement</span>
                            <span className="text-[10px] text-slate-550 block leading-relaxed mt-1">Standard listing rotated symmetrically within community rows</span>
                          </div>
                          <div className="border-t border-slate-150 mt-2.5 pt-1.5 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">Daily Rate</span>
                            <span className="font-mono font-black text-red-655">${promoTier === 'economy' ? promoDailyRate.toFixed(2) : '0.50'}</span>
                          </div>
                        </label>

                        <label className={`relative border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all select-none text-left ${
                          promoTier === 'supreme' 
                            ? 'border-amber-500 bg-amber-50/20 text-amber-950 font-bold' 
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-755'
                        }`}>
                          <input 
                            type="radio" 
                            name="promoTier" 
                            checked={promoTier === 'supreme'}
                            onChange={() => setPromoTier('supreme')}
                            className="sr-only" 
                          />
                          <div className="space-y-1">
                            <span className="text-[9px] font-black tracking-wider uppercase text-amber-500 block font-mono">★★★★★ Priority</span>
                            <span className="font-display font-black text-xs block leading-none">Supreme Featured Slot</span>
                            <span className="text-[10px] text-slate-550 block leading-relaxed mt-1">High visibility, golden borders, first position in rotation</span>
                          </div>
                          <div className="border-t border-slate-150 mt-2.5 pt-1.5 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-bold">Daily Rate</span>
                            <span className="font-mono font-black text-amber-600">${promoTier === 'supreme' ? promoDailyRate.toFixed(2) : '1.00'}</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Runtime days option */}
                    <div className="space-y-2 font-sans">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-655">
                        <span>Sponsorship Lifespan Duration</span>
                        <span className="font-mono text-xs text-red-650 bg-red-50/50 px-2 py-0.5 rounded border border-red-100/30">
                          {promoDurationDays} Active Days
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[3, 7, 14, 30].map((d) => (
                          <button
                            type="button"
                            key={d}
                            onClick={() => {
                              setPromoDurationDays(d);
                              setCustomDaysValue('');
                            }}
                            className={`p-2 rounded-xl text-center font-bold font-mono transition-all border cursor-pointer text-xs ${
                              promoDurationDays === d && customDaysValue === ''
                                ? 'border-red-655 bg-red-50 text-red-655'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {d}d
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-2.5 pt-1 border-t border-slate-150 font-sans">
                      <label className="block text-[11px] font-bold text-slate-655 text-left">Select Settlement Channel</label>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wallet')}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer select-none ${
                            paymentMethod === 'wallet'
                              ? 'border-red-650 bg-red-50/50 text-red-655 font-bold'
                              : 'border-slate-200 bg-white text-slate-550 hover:border-slate-350'
                          }`}
                        >
                          <Wallet className="h-4 w-4 mb-1 text-slate-600" />
                          <span className="text-[9px]">Merchant Wallet</span>
                          <span className="text-[8px] opacity-75 font-mono mt-0.5">${sellerStats?.wallet.toFixed(2) || '25.50'} Balance</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer select-none ${
                            paymentMethod === 'card'
                              ? 'border-red-650 bg-red-50/50 text-red-655 font-bold'
                              : 'border-slate-200 bg-white text-slate-550 hover:border-slate-355'
                          }`}
                        >
                          <CreditCard className="h-4 w-4 mb-1 text-slate-600" />
                          <span className="text-[9px]">Crypto Bank Card</span>
                          <span className="text-[8px] opacity-75 font-mono mt-0.5">Instant Visa/MC</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('paypal')}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer select-none ${
                            paymentMethod === 'paypal'
                              ? 'border-red-650 bg-red-50/50 text-red-655 font-bold'
                              : 'border-slate-200 bg-white text-slate-550 hover:border-slate-355'
                          }`}
                        >
                          <ShieldCheck className="h-4 w-4 mb-1 text-slate-600" />
                          <span className="text-[9px]">PayPal Express</span>
                          <span className="text-[8px] opacity-75 font-mono mt-0.5">Secure Fast Sync</span>
                        </button>
                      </div>
                    </div>

                    {/* Card fields rendering */}
                    {paymentMethod === 'card' && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-205 space-y-2 animate-fade-in text-[11px] font-sans text-left">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 font-sans">Card Number Block</label>
                          <input 
                            type="text" 
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
                            placeholder="4115 8823 9940 7116"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 font-sans">Expiry (MM/YY)</label>
                            <input 
                              type="text" 
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
                              placeholder="11/29"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 font-sans">CVV Secure Key</label>
                            <input 
                              type="password" 
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 bg-white"
                              placeholder="115"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Paypal disclaimer */}
                    {paymentMethod === 'paypal' && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[10px] text-slate-500 font-sans leading-relaxed text-left">
                        ⚡ <strong>PayPal Express Integration Sync is Active.</strong> Authorizing below will redirect your sandbox gateway immediately to finalize checkout invoice records safely.
                      </div>
                    )}

                    {/* Summary fee block and Submit button */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-150 flex items-center justify-between text-xs font-sans">
                      <div className="space-y-0.5 text-left animate-fade-in animate-duration-150">
                        <span className="text-slate-400 font-bold">Payment Due Info</span>
                        <p className="font-mono text-slate-900 font-black">
                          {promoDurationDays} days x ${promoDailyRate.toFixed(2)}/day
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Total Settlement Cost</span>
                        <span className="font-mono text-[13px] font-black text-red-655">
                          ${(promoDurationDays * promoDailyRate).toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3 animate-fade-in animate-duration-300">
                      <button
                        type="button"
                        onClick={() => handlePublishAdWithChoice(false)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs active:scale-98 border border-slate-250 flex items-center justify-center gap-1.5 font-sans"
                      >
                        <Save className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>Save as Unpaid Draft</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePublishAdWithChoice(true)}
                        className="w-full bg-red-650 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs active:scale-98 shadow-sm flex items-center justify-center gap-1.5 font-sans"
                      >
                        <CreditCard className="h-3.5 w-3.5 shrink-0" />
                        <span>Pay & Launch Now</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
              </div>
            </motion.div>
          </div>
        )}

        {selectedLightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLightboxImage(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Medium size centered Image Frame */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-850 shadow-2xl z-10 p-2"
            >
              {/* Header inside Modal */}
              <div className="flex items-center justify-between p-3.5 border-b border-slate-800 text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-800 p-1.5 rounded-lg">
                    <Megaphone className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">{adT('adFocus')}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{adT('sponsorWord')}: {adT(currentAd.title)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLightboxImage(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Image Viewer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Image box */}
              <div className="relative aspect-video max-h-[70vh] w-full bg-black/40 flex items-center justify-center overflow-hidden rounded-2xl my-2">
                <img 
                  src={selectedLightboxImage} 
                  alt={adT(currentAd.title)} 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="max-w-full max-h-full object-contain rounded-xl select-none"
                />
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-950/50 rounded-b-2xl gap-3">
                <div className="text-[10px] text-slate-400 font-medium max-w-[60%]">
                  <span className="font-bold text-red-400 block mb-0.5">{adT(currentAd.tagline)}</span>
                  <p className="line-clamp-1">{adT(currentAd.description)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedLightboxImage}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-705 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    <span>{adT('originTab')}</span>
                  </a>
                  <button
                    onClick={() => {
                      setSelectedLightboxImage(null);
                      handleAction(currentAd);
                    }}
                    className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>{adT(currentAd.ctaText)}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
