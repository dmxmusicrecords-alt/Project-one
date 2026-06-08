import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, ShoppingCart, Globe, Menu, X, Star, 
  Tag, TrendingUp, Wallet, PlusCircle, GitBranch, HelpCircle, Send, 
  ShieldCheck, Briefcase, Car, Paintbrush, Download, Shirt, Home, 
  Wrench, Building, Check, ExternalLink, MessageSquare, Plus, Minus, User, Sparkles, Grid
} from 'lucide-react';

import { Item, CartItem, Order, Seller, SellerStats } from './types';
import { CATEGORIES, INITIAL_ITEMS, INITIAL_SELLER_STATS } from './data';
import ItemCard from './components/ItemCard';
import ItemDetailsModal from './components/ItemDetailsModal';
import CartModal from './components/CartModal';
import Dashboard from './components/Dashboard';
import SellerAuth from './components/SellerAuth';
import GitAssistant from './components/GitAssistant';
import MoscoviumAds, { MoscoviumAd, INITIAL_ADS } from './components/MoscoviumAds';
import CurrencyConverter, { CURRENCIES } from './components/CurrencyConverter';
import { playCashRegisterSound, playNotificationSound } from './lib/audio';

// Multi-language Translation Packs
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    tagline: "Discover Products, Services & Digital Downloads worldwide",
    searchPlaceholder: "Search products, services, shops...",
    listings: "Listings",
    shops: "Shops",
    sell: "Seller Console",
    cart: "Cart",
    login: "Sign In",
    register: "Create Account",
    protection: "Buyer/Seller Protected Escrow Escort",
    globalShipping: "Global Logistics & Local Despatches",
    curatedPicks: "Curated Trending Picks Daily",
    whoTitle: "Who is Moscovium115?",
    whoDesc: "Named after the super-heavy element, Moscovium115 is a high-atomic-energy global marketplace where creators list physical crafts, tech assets, and consulting services instantly.",
    statsBuyers: "50k+ Active Buyers",
    statsSellers: "10k+ Merchants",
    statsCountries: "80+ Sovereign Regions",
    contactUs: "Git Publish Assistant",
    popularHeader: "Hot right now - Popular Items",
    recommendedHeader: "Just for You - Personalized Picks",
    trendingServices: "Most In-Demand Services Today",
    featuredShops: "Featured Top-Rated Merchant Boutiques",
    allCategories: "All Categories",
    shopByCategory: "Shop by department category",
    liveCatalogue: "LIVE CATALOGUE",
    matchingListings: "matching listing(s) found",
    searchNoResult: "We couldn't find items that match your search filters.",
    resetFilters: "Reset all filters and view full catalogue",
    customGitTitle: "Git upload wizard",
    merchantPortal: "Merchant Portal",
    homeTitle0: "Any Skill. Any Service. One Global Platform.",
    homeDesc0: "Legal consulting, software engineering, physical crafts, custom hardware – list your capability instantly, earn escrow rewards securely.",
    homeAction0: "List Your Service",
    homeTitle1: "List Unique Handmade Treasures",
    homeDesc1: "Explore bespoke mahogany sculptures, traditional handwoven sisal totes, and rare collectible loose gemstones from verified global artisans.",
    homeAction1: "Shop Handmade",
    homeTitle2: "Next-Gen Tech Graphic Nodes",
    homeDesc2: "Instant orders on premium consumer electronics, high-processing GPU silicon nodes, and re-mappable mechanical media controllers.",
    homeAction2: "Explore Electronics",
    checkGitWizard: "Check Git Upload Wizard",
    escrowShieldTitle: "Buyer/Seller Protected Escrow Escort",
    escrowShieldDesc: "Escrow security locks payouts until listing confirmation matches.",
    globalLogisticsTitle: "Global Logistics & Local Despatches",
    globalLogisticsDesc: "Sellers coordinate physical dropshipping or instant links securely.",
    curatedTrendingTitle: "Curated Trending Picks Daily",
    curatedTrendingDesc: "Review verified rating scores and purchase ledger counts.",
    "All Vehicles/Parts": "All Vehicles/Parts",
    "Art & Collectibles": "Art & Collectibles",
    "Digital Downloads": "Digital Downloads",
    "Fashion/Beauty": "Fashion/Beauty",
    "Home/Office/Lifestyle": "Home/Office/Lifestyle",
    "Industrial Equipment/Tools": "Industrial Equipment/Tools",
    "Real Estate/Property": "Real Estate/Property",
    "Services": "Services",
    "Electronics": "Electronics"
  },
  sw: {
    tagline: "Gundua Bidhaa, Huduma & Upakuaji wa Kidijitali mbali mbali",
    searchPlaceholder: "Tafuta bidhaa, huduma, maduka...",
    listings: "Orodha",
    shops: "Maduka",
    sell: "Ofisi ya Muuzaji",
    cart: "Kikapu",
    login: "Ingia",
    register: "Sajili Akaunti",
    protection: "Ulinzi wa Mnunuzi na Muuzaji na Dhamana",
    globalShipping: "Usafirishaji wa Kimataifa na Wauzaji wa Ndani",
    curatedPicks: "Chaguo Maalum Zinazovuma Kila Siku",
    whoTitle: "Moscovium115 ni Nini?",
    whoDesc: "Imepewa jina la elementi nzito ya kisayansi, Moscovium115 ni soko la kimataifa lenye nguvu ambapo wabunifu huorodhesha kazi za mikono, huduma za kiteknolojia na ushauri papo hapo.",
    statsBuyers: "Wanunuzi 50k+ Amilifu",
    statsSellers: "Wafanyabiashara 10k+",
    statsCountries: "Mikoa 80+ Kote Duniani",
    contactUs: "Msaidizi wa Git",
    popularHeader: "Zinazopendwa Sasa Hivi - Bidhaa Moto",
    recommendedHeader: "Kwa Ajili Yako Tu - Chaguo Zilizopendekezwa",
    trendingServices: "Huduma Zinazohitajika Zaidi Leo",
    featuredShops: "Maduka ya Juu ya Wafanyabiashara Waliomakinika",
    allCategories: "Kategoria Zote",
    shopByCategory: "Nunua kwa kategoria ya idara",
    liveCatalogue: "KATALOGI YA SASA",
    matchingListings: "orodha inayolingana imepatikana",
    searchNoResult: "Hatukuweza kupata bidhaa zinazolingana na vichujio vyako vya utafutaji.",
    resetFilters: "Weka upya vichujio vyote na uangalie katalogi kamili",
    customGitTitle: "Msaidizi wa kupakia Git",
    merchantPortal: "Portal ya Mfanyabiashara",
    homeTitle0: "Ustadi Wowote. Huduma Yoyote. Jukwaa Moja la Kimataifa.",
    homeDesc0: "Ushauri wa kisheria, uhandisi wa programu, ufundi wa kimwili, vifaa maalum - orodhesha uwezo wako papo hapo, pata tuzo za escrow salama.",
    homeAction0: "Orodhesha Huduma Yako",
    homeTitle1: "Orodhesha Hazina za Kipekee za Kazi ya Mikono",
    homeDesc1: "Gundua sanamu za mahogany zilizotengenezwa maalum, mifuko ya kitamaduni ya sisal, na vito adimu vya thamani kutoka kwa mafundi wa kimataifa.",
    homeAction1: "Nunua za Mikono",
    homeTitle2: "Nodi za Picha za Teknolojia ya Kizazi Kijacho",
    homeDesc2: "Agizo za haraka kwenye vifaa vya elektroniki vya kiwango cha juu, nodi za GPU za nguvu za usindikaji thabiti, na vidhibiti vya habari vya kiufundi.",
    homeAction2: "Gundua Vifaa vya Elektroniki",
    checkGitWizard: "Angalia Msaidizi wa Git",
    escrowShieldTitle: "Ulinzi wa Mnunuzi na Muuzaji na Dhamana",
    escrowShieldDesc: "Ulinzi wa Escrow hufunga malipo hadi uthibitisho wa bidhaa upatikane.",
    globalLogisticsTitle: "Usafirishaji wa Kimataifa na Wauzaji wa Ndani",
    globalLogisticsDesc: "Wauzaji huratibu usafirishaji wa kimwili au viungo vya papo hapo kwa usalama.",
    curatedTrendingTitle: "Chaguo Maalum Zinazovuma Kila Siku",
    curatedTrendingDesc: "Kagua alama za kukadiria zilizoidhinishwa na idadi ya mauzo.",
    "All Vehicles/Parts": "Magari na Vipuri Vyote",
    "Art & Collectibles": "Sanaa na Vitu vya Thamani",
    "Digital Downloads": "Upakuaji wa Kidijitali",
    "Fashion/Beauty": "Mitindo na Urembo",
    "Home/Office/Lifestyle": "Nyumbani/Ofisini/Maisha",
    "Industrial Equipment/Tools": "Vifaa vya Viwandani/Zana",
    "Real Estate/Property": "Majengo na Mali",
    "Services": "Huduma",
    "Electronics": "Vifaa vya Elektroniki"
  },
  es: {
    tagline: "Descubre productos, servicios y descargas digitales en todo el mundo",
    searchPlaceholder: "Buscar productos, servicios, tiendas...",
    listings: "Anuncios",
    shops: "Tiendas",
    sell: "Consola de Vendedor",
    cart: "Carrito",
    login: "Iniciar sesión",
    register: "Crear Cuenta",
    protection: "Garante de Depósito en Garantía Protegido",
    globalShipping: "Logística Global y Envíos Locales",
    curatedPicks: "Selecciones de Tendencia Diarias",
    whoTitle: "¿Qué es Moscovium115?",
    whoDesc: "Nombrado en honor al elemento superpesado, Moscovium115 es un mercado global de alta energía donde los creadores listan artesanías físicas, activos tecnológicos y servicios de consultoría al instante.",
    statsBuyers: "50k+ Compradores Activos",
    statsSellers: "10k+ Comerciantes",
    statsCountries: "80+ Regiones Soberanas",
    contactUs: "Asistente de Publicación Git",
    popularHeader: "Populares en este momento",
    recommendedHeader: "Solo para ti - Selecciones personalizadas",
    trendingServices: "Servicios más solicitados hoy",
    featuredShops: "Boutiques de comerciantes mejor valoradas",
    allCategories: "Todas las Categorías",
    shopByCategory: "Comprar por categoría de departamento",
    liveCatalogue: "CATÁLOGO EN VIVO",
    matchingListings: "anuncio(s) coincidente(s) encontrado(s)",
    searchNoResult: "No pudimos encontrar artículos que coincidan con sus filtros de búsqueda.",
    resetFilters: "Restablecer todos los filtros y ver catálogo completo",
    customGitTitle: "Asistente de carga Git",
    merchantPortal: "Portal del comerciante",
    homeTitle0: "Cualquier habilidad. Cualquier servicio. Una plataforma global.",
    homeDesc0: "Asesoría legal, ingeniería de software, artesanías físicas, hardware personalizado: enumere su capacidad al instante, gane de forma segura.",
    homeAction0: "Anuncie su Servicio",
    homeTitle1: "Encuentre un tesoro hecho a mano único",
    homeDesc1: "Explore esculturas de caoba personalizadas, bolsos tradicionales de sisal y gemas preciosas sueltas de artesanos globales verificados.",
    homeAction1: "Comprar Hecho a Mano",
    homeTitle2: "Nodos de procesamiento gráfico de última generación",
    homeDesc2: "Pedidos instantáneos de electrónica de consumo premium, nodos de GPU de alto procesamiento y controladores mecánicos configurables.",
    homeAction2: "Explorar Electrónica",
    checkGitWizard: "Ver Asistente Git",
    escrowShieldTitle: "Garante de Depósito en Garantía Protegido",
    escrowShieldDesc: "La seguridad del depósito en garantía retiene los pagos hasta que se aprueben los términos.",
    globalLogisticsTitle: "Logística Global y Envíos Locales",
    globalLogisticsDesc: "Los vendedores coordinan logística física o enlaces de descarga rápidos.",
    curatedTrendingTitle: "Selecciones de Tendencia Diarias",
    curatedTrendingDesc: "Revise las calificaciones de confianza y el historial de transacciones.",
    "All Vehicles/Parts": "Vehículos y Autopartes",
    "Art & Collectibles": "Arte y Coleccionables",
    "Digital Downloads": "Descargas Digitales",
    "Fashion/Beauty": "Moda y Belleza",
    "Home/Office/Lifestyle": "Hogar/Oficina/Estilo de vida",
    "Industrial Equipment/Tools": "Equipos Industriales y Zanas",
    "Real Estate/Property": "Bienes Raíces y Propiedades",
    "Services": "Servicios Profesionales",
    "Electronics": "Electrónica"
  },
  fr: {
    tagline: "Découvrez des produits, services et téléchargements numériques dans le monde entier",
    searchPlaceholder: "Rechercher des produits, services, boutiques...",
    listings: "Annonces",
    shops: "Boutiques",
    sell: "Console Vendeur",
    cart: "Panier",
    login: "Se connecter",
    register: "Créer un compte",
    protection: "Escorte d'Escrow Sécurisée Acheteur/Vendeur",
    globalShipping: "Logistique Globale & Envois Locaux",
    curatedPicks: "Sélections Tendances Quotidiennes",
    whoTitle: "Qu'est-ce que Moscovium115?",
    whoDesc: "Nommé d'après l'élément superlourd, Moscovium115 est un marché mondial à haute énergie où les créateurs répertorient instantanément des objets physiques, des actifs technologiques et des services.",
    statsBuyers: "50k+ Acheteurs Actifs",
    statsSellers: "10k+ Marchands",
    statsCountries: "80+ Régions Souveraines",
    contactUs: "Assistant de Publication Git",
    popularHeader: "Populaire en ce moment",
    recommendedHeader: "Juste pour vous - Sélections personnalisées",
    trendingServices: "Services les plus demandés aujourd'hui",
    featuredShops: "Boutiques de marchands les mieux notées",
    allCategories: "Toutes les Catégories",
    shopByCategory: "Acheter par catégorie de département",
    liveCatalogue: "CATALOGUE EN DIRECT",
    matchingListings: "annonce(s) correspondante(s) trouvée(s)",
    searchNoResult: "Nous n'avons trouvé aucun article correspondant à vos filtres de recherche.",
    resetFilters: "Réinitialiser tous les filtres et voir le catalogue complet",
    customGitTitle: "Assistant de téléchargement Git",
    merchantPortal: "Portail Marchand",
    homeTitle0: "Toute compétence. Tout service. Une plateforme mondiale.",
    homeDesc0: "Conseil juridique, génie logiciel, artisanat physique, matériel sur mesure – listez votre capacité instantanément.",
    homeAction0: "Inscrire votre Service",
    homeTitle1: "Découvrez des trésors uniques faits à la main",
    homeDesc1: "Explorez des sculptures en acajou, des sacs traditionnels en sisal et des pierres précieuses de créateurs mondiaux certifiés.",
    homeAction1: "Acheter du Fait Main",
    homeTitle2: "Noeuds Graphiques Technologiques de Nouvelle Génération",
    homeDesc2: "Commandes instantanées de produits électroniques haut de gamme et de processeurs graphiques à haut rendement silicium.",
    homeAction2: "Découvrir l'Électronique",
    checkGitWizard: "Vérifier l'Assistant Git",
    escrowShieldTitle: "Escorte d'Escrow Sécurisée Acheteur/Vendeur",
    escrowShieldDesc: "La sécurité du compte séquestre bloque les paiements jusqu'à confirmation de livraison.",
    globalLogisticsTitle: "Logistique Globale & Envois Locaux",
    globalLogisticsDesc: "Les vendeurs coordonnent les livraisons physiques ou les liens sécurisés.",
    curatedTrendingTitle: "Sélections Tendances Quotidiennes",
    curatedTrendingDesc: "Consultez les scores de notation vérifiés et le registre des transactions.",
    "All Vehicles/Parts": "Véhicules et Pièces",
    "Art & Collectibles": "Art et Collections",
    "Digital Downloads": "Téléchargements Numériques",
    "Fashion/Beauty": "Mode et Beauté",
    "Home/Office/Lifestyle": "Maison/Bureau/Style de vie",
    "Industrial Equipment/Tools": "Équipements et Outils Industriels",
    "Real Estate/Property": "Immobilier et Propriétés",
    "Services": "Services Professionnels",
    "Electronics": "Électronique"
  },
  de: {
    tagline: "Entdecken Sie Produkte, Dienstleistungen und digitale Downloads weltweit",
    searchPlaceholder: "Suche nach Produkten, Dienstleistungen, Geschäften...",
    listings: "Angebote",
    shops: "Shops",
    sell: "Verkäuferkonsole",
    cart: "Warenkorb",
    login: "Anmelden",
    register: "Konto erstellen",
    protection: "Geschützter Treuhand-Service für Käufer und Verkäufer",
    globalShipping: "Globale Logistik & Lokale Lieferungen",
    curatedPicks: "Täglich kuratierte Trends",
    whoTitle: "Wer ist Moscovium115?",
    whoDesc: "Benannt nach dem superschweren Element ist Moscovium115 ein globaler Marktplatz, auf dem Entwickler physisches Handwerk, Tech-Assets und Consulting anbieten.",
    statsBuyers: "50k+ Aktive Käufer",
    statsSellers: "10k+ Händler",
    statsCountries: "80+ Souveräne Regionen",
    contactUs: "Git-Veröffentlichungs-Assistent",
    popularHeader: "Aktuelle Bestseller - Beliebte Artikel",
    recommendedHeader: "Nur für Sie personalisiert",
    trendingServices: "Gefragteste Dienstleistungen heute",
    featuredShops: "Top bewertete Händler-Boutiquen",
    allCategories: "Alle Kategorien",
    shopByCategory: "Nach Abteilung stöbern",
    liveCatalogue: "LIVE-KATALOG",
    matchingListings: "passende(s) Angebot(e) gefunden",
    searchNoResult: "Wir konnten keine Artikel finden, die Ihren Filtern entsprechen.",
    resetFilters: "Alle Filter zurücksetzen und gesamten Katalog anzeigen",
    customGitTitle: "Git Upload-Assistent",
    merchantPortal: "Händlerportal",
    homeTitle0: "Jede Fähigkeit. Jeder Service. Eine globale Plattform.",
    homeDesc0: "Rechtsberatung, Softwareentwicklung, physisches Handwerk, maßgeschneiderte Hardware – bieten Sie Ihre Dienste sofort an.",
    homeAction0: "Dienstleistung listen",
    homeTitle1: "Einzigartige handgemachte Schätze finden",
    homeDesc1: "Entdecken Sie Skulpturen aus Mahagoni, traditionelle Sisal-Taschen und seltene Edelsteine von zertifizierten Kunsthandwerkern.",
    homeAction1: "Handgemachtes shoppen",
    homeTitle2: "Grafikprozessor-Rechenknoten der nächsten Generation",
    homeDesc2: "Sofortige Bestellungen für Premium-Unterhaltungselektronik, leistungsstarke GPU-Knoten und Medien-Controller.",
    homeAction2: "Elektronik erkunden",
    checkGitWizard: "Git-Assistent öffnen",
    escrowShieldTitle: "Geschützter Treuhand-Service für Käufer und Verkäufer",
    escrowShieldDesc: "Die Treuhand-Sicherheit sperrt Auszahlungen bis zur Bestätigung der Lieferung.",
    globalLogisticsTitle: "Globale Logistik & Lokale Lieferungen",
    globalLogisticsDesc: "Verkäufer koordinieren Dropshipping oder sichere digitale Links.",
    curatedTrendingTitle: "Täglich kuratierte Trends",
    curatedTrendingDesc: "Prüfen Sie verifizierte Bewertungen und erfolgreiche Transaktionen.",
    "All Vehicles/Parts": "Fahrzeuge & Teile",
    "Art & Collectibles": "Kunst & Sammlerstücke",
    "Digital Downloads": "Digitale Downloads",
    "Fashion/Beauty": "Mode & Kosmetik",
    "Home/Office/Lifestyle": "Haus/Büro/Lebensstil",
    "Industrial Equipment/Tools": "Industrieausrüstung & Werkzeuge",
    "Real Estate/Property": "Immobilien",
    "Services": "Dienstleistungen",
    "Electronics": "Elektronik"
  },
  zh: {
    tagline: "探索全球创意产品、优质服务与数字源产下载",
    searchPlaceholder: "搜索商品、专属服务、品牌店铺...",
    listings: "所有商品",
    shops: "店铺",
    sell: "卖家控制台",
    cart: "购物车",
    login: "登录账户",
    register: "创建新账户",
    protection: "买家与卖家托管安全盾保障",
    globalShipping: "全球物流协调及本地快速派送",
    curatedPicks: "每日甄选全球趋势推荐",
    whoTitle: "什么是莫斯科元素115?",
    whoDesc: "Moscovium115 以超重元素命名，是一个充满高能量的全球数字交易市场。手艺创客、软件开发者和资深顾问可在此安全上架、快速交付各项资产。",
    statsBuyers: "50k+ 活跃买家",
    statsSellers: "10k+ 全球卖家",
    statsCountries: "80+ 覆盖主权地区",
    contactUs: "Git一键发布辅助",
    popularHeader: "当前热门爆款商品",
    recommendedHeader: "为您量身定制的精选",
    trendingServices: "今日最受欢迎的专家服务",
    featuredShops: "精选高评分卖家精品店",
    allCategories: "所有商品分类",
    shopByCategory: "按部门分类浏览",
    liveCatalogue: "现货实时目录",
    matchingListings: "个匹配的商品已被找到",
    searchNoResult: "未找到符合您搜索过滤条件的商品。",
    resetFilters: "重置所有过滤条件并查看完整目录",
    customGitTitle: "Git 提交向导",
    merchantPortal: "卖家中心门禁",
    homeTitle0: "专属技能，精选服务，承载全球交易体系。",
    homeDesc0: "法律咨询、软件开发工程、物理艺术品手办、定制极速主板芯片：快速上架，多网络无忧结算。",
    homeAction0: "上架您的专属服务",
    homeTitle1: "采购尊贵纯手工艺术藏品",
    homeDesc1: "探索定制桃花心木雕刻、传统剑麻编织袋以及来自认证全球工匠的手工自然宝石。",
    homeAction1: "采购手工作品",
    homeTitle2: "次世代高性能图形计算节点租用",
    homeDesc2: "即时下单极客消费电子，高并发GPU物理硅晶元节点，和可重映射按键控制器。",
    homeAction2: "浏览电子芯片",
    checkGitWizard: "查看 Git 发布引导",
    escrowShieldTitle: "买家与卖家托管安全盾保障",
    escrowShieldDesc: "平台安全托管资金，直至买方确收相符方可放款结算。",
    globalShippingTitle: "全球物流协调及本地快速派送",
    globalShippingDesc: "卖家快速配合落地直邮或云端私有链接一键安全分发。",
    curatedTrendingTitle: "每日甄选全球趋势推荐",
    curatedTrendingDesc: "经过审核评级的信用账本和累计交易证明。",
    "All Vehicles/Parts": "车辆与配件",
    "Art & Collectibles": "手工艺与收藏品",
    "Digital Downloads": "数字资产与下载",
    "Fashion/Beauty": "时尚与奢美美妆",
    "Home/Office/Lifestyle": "居家办公生活美学",
    "Industrial Equipment/Tools": "重工业设备与组装工具",
    "Real Estate/Property": "房地产与奢华房产",
    "Services": "专业咨询与技能服务",
    "Electronics": "电子消费芯片"
  },
  ar: {
    tagline: "اكتشف المنتجات والخدمات والتنزيلات الرقمية في جميع أنحاء العالم",
    searchPlaceholder: "ابحث عن المنتجات، الخدمات، المحلات التجارية...",
    listings: "القوائم لمنتجاتنا",
    shops: "المحلات",
    sell: "وحدة تحكم البائع",
    cart: "سلة التسوق",
    login: "تسجيل الدخول",
    register: "إنشاء حساب الجديد",
    protection: "ضمان الضمان المالي المحمي للمشتري والبائع",
    globalShipping: "الخدمات اللوجستية العالمية والتسليم المحلي",
    curatedPicks: "مختارات الاتجاهات اليومية المنسقة",
    whoTitle: "من هو Moscovium115؟",
    whoDesc: "سميت على اسم العنصر الثقيل، Moscovium115 هي سوق عالمية نشطة للغاية حيث يدرج المبدعون المشغولات اليدوية والأصول التقنية والخدمات الاستشارية على الفور.",
    statsBuyers: "+50 ألف مشتري نشط",
    statsSellers: "+10 آلاف تاجر معتمد",
    statsCountries: "+80 دولة كبرى",
    contactUs: "مساعد نشر مشاريع جيت",
    popularHeader: "الأكثر شعبية الآن - العناصر الرائعة",
    recommendedHeader: "لك خصيصاً - اختياراتنا المميزة",
    trendingServices: "الخدمات الأكثر طلباً اليوم",
    featuredShops: "أعلى متاجر التجار تقييماً",
    allCategories: "القسم الشامل للتصنيفات",
    shopByCategory: "تسوق حسب فئة القسم المفضلة",
    liveCatalogue: "كتالوج الكتروني معروض الآن",
    matchingListings: "تم العثور على قوائم مطابقة لتفضيلك",
    searchNoResult: "لم نتمكن من العثور على سلع مطابقة لخيارات الفرز.",
    resetFilters: "إعادة ضبط الاختيارات وعرض الكتالوج بالكامل",
    customGitTitle: "معالج الرفع عبر جيت لملفاتك",
    merchantPortal: "بوابة المفرز التجاري للبائعين",
    homeTitle0: "أي مهارة. أي خدمة. منصة عالمية واحدة.",
    homeDesc0: "الاستشارات القانونية، هندسة البرمجيات، الحرف اليدوية المادية، الأجهزة المخصصة - ضع مهاراتك الآن لتكسب بأمان.",
    homeAction0: "ادرج خبرتك الخاصة",
    homeTitle1: "ادرج الكنوز الفريدة المصنوعة يدوياً",
    homeDesc1: "استكشف منحوتات الماهوجني الراقية، والحقائب التقليدية المحاكة من السيزال، والأحجار الكريمة النادرة غير المصقولة.",
    homeAction1: "تسوق المنتجات اليدوية",
    homeTitle2: "عقد حوسبة رسومية ذكية مخصصة للتعلم",
    homeDesc2: "طلبات فورية على الإلكترونيات الاستهلاكية المتميزة، وعقد معالجة بطاقات السيليكون لتسريع الذكاء الاصطناعي.",
    homeAction2: "استكشف الرقائق الإلكترونية",
    checkGitWizard: "افحص مساعد النشر عبر جيت",
    escrowShieldTitle: "ضمان الضمان المالي المحمي للمشتري والبائع",
    escrowShieldDesc: "يقوم نظام الأموال المعلقة بحبس الأرباح حتى تكتمل تأكيدات التسليم والمطابقة.",
    globalLogisticsTitle: "الخدمات اللوجستية العالمية والتسليم المحلي",
    globalLogisticsDesc: "ينسق البائعون شحن الطرود المادية أو روابط الاستحواذ بشكل آمن بالكامل.",
    curatedTrendingTitle: "مختارات الاتجاهات اليومية المنسقة",
    curatedTrendingDesc: "راجع ثقة التقييمات وقوة الدفاتر الحسابية للشراء.",
    "All Vehicles/Parts": "جميع المركبات وقطع الغيار",
    "Art & Collectibles": "الفنون والتحف الثمينة",
    "Digital Downloads": "تنزيلات رقمية برمجية",
    "Fashion/Beauty": "الموضة وأدوات التجميل",
    "Home/Office/Lifestyle": "المنزل والمكتب وأسلوب الحياة",
    "Industrial Equipment/Tools": "المعدات الثقيلة والآلات الصناعية",
    "Real Estate/Property": "مشاريع العقارات والأراضي",
    "Services": "الخدمات المهنية والاستشارات",
    "Electronics": "رقائق وحوسبة الإلكترونيات"
  },
  ru: {
    tagline: "Откройте для себя товары, услуги и цифровые загрузки по всему миру",
    searchPlaceholder: "Поиск товаров, услуг, магазинов...",
    listings: "Объявления",
    shops: "Магазины",
    sell: "Панель Продавца",
    cart: "Корзина",
    login: "Войти",
    register: "Создать аккаунт",
    protection: "Защищенный эскроу-сервис для Покупателя/Продавца",
    globalShipping: "Глобальная логистика и местная отправка",
    curatedPicks: "Ежедневные тщательно отобранные тренды",
    whoTitle: "Что такое Moscovium115?",
    whoDesc: "Названный в честь сверхтяжелого элемента, Moscovium115 — это глобальный рынок с высокой атомной энергией, где создатели мгновенно размещают физические поделки, технологические активы и консалтинговые услуги.",
    statsBuyers: "50k+ Активных Покупателей",
    statsSellers: "10k+ Торговцев",
    statsCountries: "80+ Суверенных Регионов",
    contactUs: "Помощник публикации Git",
    popularHeader: "Популярно прямо сейчас - Горячие товары",
    recommendedHeader: "Только для Вас - Персональные предложения",
    trendingServices: "Самые востребованные услуги сегодня",
    featuredShops: "Популярные магазины продавцов с высоким рейтингом",
    allCategories: "Все категории",
    shopByCategory: "Купить по категориям разделов",
    liveCatalogue: "ЖИВОЙ КАТАЛОГ",
    matchingListings: "соответствующих объявлений найдено",
    searchNoResult: "Мы не смогли найти товары, соответствующие вашим фильтрам поиска.",
    resetFilters: "Сбросить все фильтры и просмотреть весь каталог",
    customGitTitle: "Мастер загрузки Git",
    merchantPortal: "Портал продавца",
    homeTitle0: "Любой навык. Любая услуга. Одна глобальная платформа.",
    homeDesc0: "Юридический консалтинг, разработка ПО, физические поделки, кастомное оборудование — разместите свое предложение мгновенно, зарабатывайте безопасно через эскроу.",
    homeAction0: "Разместить услугу",
    homeTitle1: "Размещайте уникальные сокровища ручной работы",
    homeDesc1: "Изучите изготовленные на заказ скульптуры из красного дерева, традиционные плетеные сумки из сизали и редкие коллекционные драгоценные камни от проверенных мастеров.",
    homeAction1: "Купить ручную работу",
    homeTitle2: "Графические узлы следующего поколения",
    homeDesc2: "Мгновенные заказы на премиальную бытовую электронику, высокопроизводительные кремниевые узлы графических процессоров и перенастраиваемые механические медиа-контроллеры.",
    homeAction2: "Исследовать электронику",
    checkGitWizard: "Проверить Мастер загрузки Git",
    escrowShieldTitle: "Защищенный эскроу-сервис для Покупателя/Продавца",
    escrowShieldDesc: "Безопасность эскроу блокирует выплаты до тех пор, пока подтверждение сделки не совпадет.",
    globalLogisticsTitle: "Глобальная логистика и местная отправка",
    globalLogisticsDesc: "Продавцы координируют физическую доставку или мгновенные ссылки безопасно.",
    curatedTrendingTitle: "Ежедневные тщательно отобранные тренды",
    curatedTrendingDesc: "Проверяйте верифицированные рейтинги и количество совершенных транзакций.",
    "All Vehicles/Parts": "Транспорт и запчасти",
    "Art & Collectibles": "Искусство и коллекционирование",
    "Digital Downloads": "Цифровые загрузки",
    "Fashion/Beauty": "Мода и красота",
    "Home/Office/Lifestyle": "Дом, офис, образ жизни",
    "Industrial Equipment/Tools": "Промышленное оборудование и инструменты",
    "Real Estate/Property": "Недвижимость",
    "Services": "Услуги",
    "Electronics": "Электроника"
  },
  it: {
    tagline: "Scopri prodotti, servizi e download digitali in tutto il mondo",
    searchPlaceholder: "Cerca prodotti, servizi, negozi...",
    listings: "Annunci",
    shops: "Negozi",
    sell: "Console del Venditore",
    cart: "Carrello",
    login: "Accedi",
    register: "Crea un Account",
    protection: "Scorta di Deposito a Garanzia Protetta per Acquirente/Venditore",
    globalShipping: "Logistica Globale & Spedizioni Locali",
    curatedPicks: "Selezioni di Tendenza Giornaliere curate",
    whoTitle: "Chi è Moscovium115?",
    whoDesc: "Prende il nome dall'elemento superpesante, Moscovium115 è un mercato globale ad alta energia in cui i creatori pubblicano istantaneamente artigianato fisico, risorse tecnologiche e servizi di consulenza.",
    statsBuyers: "Oltre 50.000 Acquirenti Attivi",
    statsSellers: "Oltre 10.000 Commercianti",
    statsCountries: "Oltre 80 Regioni Sovrane",
    contactUs: "Assistente per la pubblicazione di Git",
    popularHeader: "Popolari in questo momento - Articoli di tendenza",
    recommendedHeader: "Solo per te - Consigli personalizzati",
    trendingServices: "Servizi più richiesti oggi",
    featuredShops: "Boutique di commercianti con valutazioni elevate",
    allCategories: "Tutte le Categorie",
    shopByCategory: "Acquista per categoria di reparto",
    liveCatalogue: "CATALOGO LIVE",
    matchingListings: "annunci corrispondenti trovati",
    searchNoResult: "Impossibile trovare articoli corrispondenti ai filtri di ricerca selezionati.",
    resetFilters: "Reimposta tutti i filtri e visualizza il catalogo completo",
    customGitTitle: "Creazione guidata di caricamento Git",
    merchantPortal: "Portale del Commerciante",
    homeTitle0: "Qualsiasi competenza. Qualsiasi servizio. Un'unica piattaforma globale.",
    homeDesc0: "Consulenza legale, ingegneria del software, artigianato fisico, hardware personalizzato: elenca la tua capacità all'istante, guadagna in sicurezza tramite deposito a garanzia.",
    homeAction0: "Elenca il Tuo Servizio",
    homeTitle1: "Elenca Tesori Unici Fatti a Mano",
    homeDesc1: "Esplora sculture in mogano su misura, borse tradizionali in sisal intrecciate a mano e gemme sfuse rare e da collezione di artigiani globali verificati.",
    homeAction1: "Acquista Fatti a Mano",
    homeTitle2: "Nodi di elaborazione grafica tech di nuova generazione",
    homeDesc2: "Ordini istantanei su elettronica di consumo premium, nodi di silicio GPU ad alta elaborazione e controller multimediali meccanici rimappabili.",
    homeAction2: "Esplora l'Elettronica",
    checkGitWizard: "Controlla la procedura guidata di caricamento di Git",
    escrowShieldTitle: "Scorta di Deposito a Garanzia Protetta per Acquirente/Venditore",
    escrowShieldDesc: "La sicurezza del deposito a garanzia blocca i pagamenti fino a quando la conferma dell'inserzione corrisponde.",
    globalLogisticsTitle: "Logistica Globale & Spedizioni Locali",
    globalLogisticsDesc: "I venditori coordinano il dropshipping fisico o i collegamenti istantanei in modo sicuro.",
    curatedTrendingTitle: "Selezioni di Tendenza Giornaliere curate",
    curatedTrendingDesc: "Visualizza i punteggi delle valutazioni verificati e il registro delle transazioni.",
    "All Vehicles/Parts": "Veicoli e ricambi",
    "Art & Collectibles": "Arte e collezionismo",
    "Digital Downloads": "Download digitali",
    "Fashion/Beauty": "Moda e bellezza",
    "Home/Office/Lifestyle": "Casa, ufficio e stile di vita",
    "Industrial Equipment/Tools": "Equipaggiamento e strumenti industriali",
    "Real Estate/Property": "Immobiliare",
    "Services": "Servizi professionali",
    "Electronics": "Elettronica"
  }
};

export default function App() {
  const [lang, setLang] = useState<string>('en');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const activeCurrency = CURRENCIES.find(c => c.code === selectedCurrencyCode) || CURRENCIES[0];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Unified State Engine
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [ads, setAds] = useState<MoscoviumAd[]>(INITIAL_ADS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerStats, setSellerStats] = useState<SellerStats>(INITIAL_SELLER_STATS);
  const [sellerUser, setSellerUser] = useState<Seller | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'marketplace' | 'dashboard' | 'git-assistant'>('marketplace');
  const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string) ?? '';
  const [apiError, setApiError] = useState<string | null>(null);

  // Hero Carousel State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const heroSlides = [
    {
      title: "Any Skill. Any Service. One Global Platform.",
      desc: "Legal consulting, software engineering, physical crafts, custom hardware – list your capability instantly, earn escrow rewards securely.",
      action: "List Your Service",
      bgGradient: "from-slate-900 via-red-950 to-rose-950",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "List Unique Handmade Treasures",
      desc: "Explore bespoke mahogany sculptures, traditional handwoven sisal totes, and rare collectible loose gemstones from verified global artisans.",
      action: "Shop Handmade",
      bgGradient: "from-rose-900 via-slate-900 to-emerald-950",
      img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Next-Gen Tech Graphic Nodes",
      desc: "Instant orders on premium consumer electronics, high-processing GPU silicon nodes, and re-mappable mechanical media controllers.",
      action: "Explore Electronics",
      bgGradient: "from-neutral-900 via-indigo-950 to-slate-900",
      img: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=500&q=80"
    }
  ];

  // Chat Support Panel States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Welcome to Moscovium115 Secure Escrow Support. I am your customer escort. How can I help you manage your digital shop, upload on Git, or complete smart purchases today?',
      time: '10:00 AM'
    }
  ]);

  // Handle Carousel Autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    async function loadBackendData() {
      try {
        const [itemsRes, ordersRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/api/items`),
          fetch(`${API_BASE}/api/orders`),
          fetch(`${API_BASE}/api/seller-stats`)
        ]);

        if (!itemsRes.ok || !ordersRes.ok || !statsRes.ok) {
          throw new Error('Backend API is not available');
        }

        const [itemsData, ordersData, statsData] = await Promise.all([
          itemsRes.json(),
          ordersRes.json(),
          statsRes.json()
        ]);

        setItems(itemsData);
        setOrders(ordersData);
        setSellerStats(statsData);
        setApiError(null);
      } catch (error) {
        setApiError('Backend unavailable. The app will continue using local sample data.');
        console.warn('Backend initialization failed:', error);
      }
    }

    loadBackendData();

    const savedSellerId = localStorage.getItem('sellerToken');
    if (savedSellerId) {
      fetch(`${API_BASE}/api/sellers/${encodeURIComponent(savedSellerId)}`)
        .then((res) => res.ok ? res.json() : Promise.reject(new Error('Not found')))
        .then((data) => {
          setSellerUser(data);
          setAuthError(null);
        })
        .catch(() => {
          localStorage.removeItem('sellerToken');
        });
    }
  }, [API_BASE]);

  const t = (key: string) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  // Cart operations
  const handleAddToCart = (item: Item, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playNotificationSound();
    setCartItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems((prev) => prev.map((i) => i.item.id === itemId ? { ...i, quantity: qty } : i));
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  const handleSellerLogin = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE}/api/sellers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Login failed');
      }

      const seller = await response.json();
      setSellerUser(seller);
      localStorage.setItem('sellerToken', seller.id);
      setCurrentView('dashboard');
      setAuthMode('login');
      setAuthError(null);
    } catch (error: any) {
      setAuthError(error?.message || 'Login failed.');
      console.warn('Seller login failed:', error);
    }
  };

  const handleSellerRegister = async (email: string, password: string, shopName: string, displayName: string) => {
    setAuthError(null);
    if (!shopName || !displayName) {
      setAuthError('Please enter both shop name and display name.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/sellers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, shopName, displayName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Registration failed');
      }

      const seller = await response.json();
      setSellerUser(seller);
      localStorage.setItem('sellerToken', seller.id);
      setCurrentView('dashboard');
      setAuthMode('login');
      setAuthError(null);
    } catch (error: any) {
      setAuthError(error?.message || 'Registration failed.');
      console.warn('Seller register failed:', error);
    }
  };

  const handleSellerLogout = () => {
    setSellerUser(null);
    localStorage.removeItem('sellerToken');
    setAuthError(null);
  };

  const handleCheckoutSuccess = async (customerName: string, customerEmail: string) => {
    const totalCost = cartItems.reduce((acc, item) => acc + (item.item.price * item.quantity), 0);
    const newOrder: Order = {
      id: `order-9${Math.floor(Math.random() * 900000 + 100000)}`,
      items: [...cartItems],
      total: totalCost,
      status: 'Completed',
      date: new Date().toISOString().split('T')[0],
      customerName,
      customerEmail
    };

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });

      if (!response.ok) {
        throw new Error('Unable to save order to backend');
      }

      const savedOrder = await response.json();
      setOrders((prev) => [savedOrder, ...prev]);
      setCartItems([]);
    } catch (error) {
      console.warn('Order backend request failed:', error);
      setOrders((prev) => [newOrder, ...prev]);
      setCartItems([]);
      setApiError('Order created locally. Backend order save failed.');
    }

    playCashRegisterSound();
    alert(`Escrow Checkout Confirmed!\nOrder Code: ${newOrder.id}\nThank you, ${customerName}. An item access pass has been dispatched to ${customerEmail}.`);
  };

  // Seller Dashboard Operations
  const handleAddListing = async (newItem: Item) => {
    const sellerId = sellerUser?.id ?? 'bestgemdiamond';
    const sellerName = sellerUser?.shopName ?? 'Bestgemdiamond';
    const payload = { ...newItem, sellerId, sellerName };

    try {
      const response = await fetch(`${API_BASE}/api/sellers/${encodeURIComponent(sellerId)}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Unable to save listing on backend');
      }

      const savedItem = await response.json();
      setItems((prev) => [savedItem, ...prev]);
      return savedItem;
    } catch (error) {
      console.warn('Add listing backend request failed:', error);
      setItems((prev) => [payload, ...prev]);
      setApiError('Listing created locally. Backend save failed.');
      return payload;
    }
  };

  const handleRemoveListing = async (itemId: string) => {
    const sellerId = sellerUser?.id ?? 'bestgemdiamond';
    try {
      await fetch(`${API_BASE}/api/sellers/${encodeURIComponent(sellerId)}/items/${encodeURIComponent(itemId)}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('Delete listing backend request failed:', error);
      setApiError('Unable to delete listing from backend. Removed locally.');
    } finally {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  // Support Chat simulator auto-answers
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: userText, time: timeStr };
    
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulated Smart Help Response Bank
    setTimeout(() => {
      let responseText = "Thank you for shopping on Moscovium115. Your inquiry is under priority evaluation. Let me know if you need instructions about product escrow payments!";
      
      const lower = userText.toLowerCase();
      if (lower.includes('git') || lower.includes('github') || lower.includes('upload') || lower.includes('repo')) {
        responseText = "To upload Moscovium115 onto your Git Repository, simply click 'Git Publish Wizard' in the top directory bar! We have generated interactive, pre-formatted terminal commands linked directly to your GitHub coordinates.";
      } else if (lower.includes('escrow') || lower.includes('pay') || lower.includes('payment') || lower.includes('withdraw')) {
        responseText = "Moscovium115 processes balances under escrow safety conditions. Earnings accumulate dynamically in your Seller Office under Wallet Balance. Once buyers confirm received listings, you can request direct cashouts to PayPal, Wise, or SWIFT wire transfers.";
      } else if (lower.includes('bestgem') || lower.includes('owner') || lower.includes('ruby')) {
        responseText = "Bestgemdiamond is one of our premium, top-rated merchants. They currently list natural African ruby specimens, mahogany giraffe statuettes, and provide custom Full-Stack React development contracts.";
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        responseText = "Hello! I am your local Moscovium customer advocate. How can I help you list a new product, or copy the git commands to sync your repository right now?";
      }

      const botMsg = { sender: 'bot' as const, text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages((prev) => [...prev, botMsg]);
      playNotificationSound();
    }, 1200);
  };

  // List categories inside horizontal rail
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car': return <Car className="h-4 w-4" />;
      case 'Paintbrush': return <Paintbrush className="h-4 w-4" />;
      case 'Download': return <Download className="h-4 w-4" />;
      case 'Shirt': return <Shirt className="h-4 w-4" />;
      case 'Home': return <Home className="h-4 w-4 text-emerald-600" />;
      case 'Wrench': return <Wrench className="h-4 w-4" />;
      case 'Building': return <Building className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  // Filter Catalog Listing Items
  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategory || item.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setCurrentView('marketplace'); setSelectedCategory(null); }}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            >
              <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-display font-black text-xl tracking-tight shadow-md group-hover:scale-105 transition-transform">
                M
              </div>
              <div className="text-left">
                <span className="text-lg font-black tracking-tight text-slate-900 block leading-none font-display">Moscovium115</span>
                <span className="text-[10px] text-slate-400 font-sans tracking-widest uppercase block mt-0.5 font-bold">Web Escrow Nodes</span>
              </div>
            </button>
          </div>

          {/* Large Screen Global search */}
          <div className="hidden flex-1 max-w-md lg:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Language and view selector */}
          <div className="flex items-center gap-3">
            
            {/* Currency Selector dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-400">💱</span>
              <select 
                value={selectedCurrencyCode} 
                onChange={(e) => {
                  setSelectedCurrencyCode(e.target.value);
                  playNotificationSound();
                }}
                className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-750 focus:ring-1 focus:ring-red-500/35 focus:outline-none cursor-pointer transition-all hover:bg-slate-50 font-mono"
              >
                {CURRENCIES.map(c => (
                  <option key={`header-${c.code}`} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector dropdown option */}
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-slate-400 animate-pulse" />
              <select 
                value={lang} 
                onChange={(e) => {
                  setLang(e.target.value);
                  playNotificationSound();
                }}
                className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-red-500/35 focus:outline-none cursor-pointer transition-all hover:bg-slate-50"
              >
                <option value="en">English (US)</option>
                <option value="sw">Kiswahili (KE)</option>
                <option value="es">Español (ES)</option>
                <option value="fr">Français (FR)</option>
                <option value="de">Deutsch (DE)</option>
                <option value="it">Italiano (IT)</option>
                <option value="ru">Русский (RU)</option>
                <option value="zh">中文 (CN)</option>
                <option value="ar">العربية (AR)</option>
              </select>
            </div>

            {/* Sound Effects Quick Test Buttons */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                type="button"
                onClick={() => playCashRegisterSound()}
                className="h-7 w-7 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200/60 transition-all active:scale-95 flex items-center justify-center text-xs cursor-pointer select-none"
                title="Test Money Bell Sound"
                id="btn-test-cash-register"
              >
                🔔
              </button>
              <button
                type="button"
                onClick={() => playNotificationSound()}
                className="h-7 w-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-all active:scale-95 flex items-center justify-center text-xs cursor-pointer select-none"
                title="Test Notification Chime"
                id="btn-test-notification"
              >
                🎵
              </button>
            </div>

            {/* Navigation Tabs (Router simulation) */}
            <nav className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-3">
              <button 
                onClick={() => setCurrentView('marketplace')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
                  currentView === 'marketplace' ? 'bg-red-650 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {t('listings')}
              </button>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
                  currentView === 'dashboard' ? 'bg-red-650 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {t('sell')}
              </button>
              <button 
                onClick={() => setCurrentView('git-assistant')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1 border ${
                  currentView === 'git-assistant' ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>{t('contactUs')}</span>
              </button>
            </nav>

            {sellerUser ? (
              <div className="hidden md:flex items-center gap-3 border-l border-slate-200 pl-3">
                <div className="text-right text-xs">
                  <p className="font-bold text-slate-900">{sellerUser.displayName}</p>
                  <p className="text-slate-500">{sellerUser.shopName}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSellerLogout}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setCurrentView('dashboard'); setAuthMode('login'); }}
                className="hidden md:inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                Sign In
              </button>
            )}

            {/* Cart Header button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-[10px] text-white font-bold flex items-center justify-center border border-white">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Mobile hamburger menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white p-4 space-y-4 md:hidden">
            {/* Search */}
            <div className="relative">
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-slate-700 placeholder:text-slate-450 focus:outline-none"
              />
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Mobile Nav Link List */}
            <nav className="flex flex-col gap-2 font-sans font-bold text-xs text-slate-700">
              <button 
                onClick={() => { setCurrentView('marketplace'); setIsMobileMenuOpen(false); }}
                className="text-left px-3 py-2 hover:bg-slate-50 rounded-xl"
              >
                {t('listings')} Marketplace
              </button>
              <button 
                onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }}
                className="text-left px-3 py-2 hover:bg-slate-50 rounded-xl"
              >
                {t('sell')} Merchant Portal
              </button>
              <button 
                onClick={() => { setCurrentView('git-assistant'); setIsMobileMenuOpen(false); }}
                className="text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center gap-1.5"
              >
                <GitBranch className="h-4 w-4 text-red-600" />
                <span>Git upload wizard</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 pb-16">
        
        {/* Marketplace Homepage View */}
        {currentView === 'marketplace' && (
          <div className="space-y-6">
            
            <MoscoviumAds 
              lang={lang}
              ads={ads}
              setAds={setAds}
              onSelectCategory={(category) => {
                setSelectedCategory(category);
              }}
              onSwitchView={(view) => {
                setCurrentView(view);
              }}
              setSearchQuery={setSearchQuery}
              sellerStats={sellerStats}
              onUpdateStats={setSellerStats}
            />

            {/* Hero sliding carousel and guarantees */}
            <section className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                
                {/* Active Slide item */}
                <div className={`p-6 sm:p-10 lg:p-12 bg-gradient-to-br ${heroSlides[currentHeroSlide].bgGradient} text-white flex flex-col md:flex-row items-center justify-between gap-6 min-h-[360px]`}>
                  <div className="max-w-xl space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>Earn Global Balances Securely</span>
                    </div>
                    <h1 className="text-2xl sm:text-3.5xl font-black font-display tracking-tight leading-tight">
                      {heroSlides[currentHeroSlide].title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-sans font-medium">
                      {heroSlides[currentHeroSlide].desc}
                    </p>
                    <div className="flex gap-2.5 justify-center md:justify-start pt-3">
                      <button 
                        onClick={() => setCurrentView('dashboard')}
                        className="bg-white hover:bg-slate-100 text-red-950 font-bold px-5 py-2.5 rounded-xl text-xs font-sans transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                      >
                        {heroSlides[currentHeroSlide].action}
                      </button>
                      <button 
                        onClick={() => setCurrentView('git-assistant')}
                        className="bg-transparent hover:bg-white/10 text-white font-bold border border-white/30 px-5 py-2.5 rounded-xl text-xs font-sans transition-all active:scale-[0.98]"
                      >
                        Check Git Upload Wizard
                      </button>
                    </div>
                  </div>

                  <div className="w-full max-w-[280px] sm:max-w-xs shrink-0 self-center hidden md:block">
                    <img 
                      src={heroSlides[currentHeroSlide].img} 
                      alt="Banner visualization" 
                      className="rounded-2xl shadow-2xl object-cover h-48 w-full border border-white/10"
                    />
                  </div>
                </div>

                {/* Slider Nav dots at bottom */}
                <div className="absolute bottom-4 left-6 flex gap-1.5 items-center">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentHeroSlide(i)}
                      className={`h-2 rounded-full transition-all ${currentHeroSlide === i ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                      title={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Left and Right arrows */}
                <button 
                  onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors focus:outline-none hidden sm:flex"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors focus:outline-none hidden sm:flex"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </section>

            {/* Shield features row */}
            <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-red-50 text-red-650 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">{t('protection')}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-sans">{t('escrowShieldDesc')}</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-red-50 text-red-650 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">{t('globalShipping')}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-sans">{t('globalLogisticsDesc')}</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-red-50 text-red-650 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">{t('curatedPicks')}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-sans">{t('curatedTrendingDesc')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Moscovium Currency Bureau de Change Widget */}
            <CurrencyConverter 
              selectedStoreCurrency={selectedCurrencyCode}
              onSelectStoreCurrency={setSelectedCurrencyCode}
              lang={lang}
            />

            {/* Horizontal Categories Filter Rail */}
            <section id="marketplace-anchor" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
              <h3 className="text-xs font-black tracking-wider uppercase text-slate-500">{t('shopByCategory')}</h3>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none leading-none ${
                    !selectedCategory 
                      ? 'border-red-600 bg-red-50 text-red-600 shadow-xs' 
                      : 'border-slate-250 bg-white text-slate-700 hover:border-slate-350'
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                  <span>{t('allCategories')}</span>
                </button>
                {CATEGORIES.map((cat) => {
                  const pathPattern = cat.name.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(pathPattern)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none leading-none shrink-0 ${
                        selectedCategory === pathPattern
                          ? 'border-red-600 bg-red-50 text-red-600 shadow-xs' 
                          : 'border-slate-250 bg-white text-slate-700 hover:border-slate-350'
                      }`}
                    >
                      {renderCategoryIcon(cat.icon)}
                      <span>{t(cat.name)}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Main Products Grid displaying active items array */}
            <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 rounded px-2 py-0.5 font-mono">{t('liveCatalogue')}</span>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight mt-1.5 font-sans">
                    {selectedCategory ? `${t(CATEGORIES.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === selectedCategory)?.name || '')}` : t('popularHeader')}
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-sans font-medium">{filteredItems.length} {t('matchingListings')}</span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="py-20 text-center space-y-3 bg-white border border-slate-200 rounded-3xl p-6">
                  <span className="text-4xl text-slate-300 block">👀</span>
                  <p className="text-sm font-semibold text-slate-500">{t('searchNoResult')}</p>
                  <button 
                    onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                    className="text-red-600 text-xs font-bold tracking-wide hover:underline focus:outline-none"
                  >
                    {t('resetFilters')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onViewDetails={(i) => setSelectedItem(i)}
                      onAddToCart={(i, e) => handleAddToCart(i, e)}
                      currency={activeCurrency}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Who is Moscovium card section */}
            <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800">
                <div className="absolute right-0 top-0 translate-y-[-10%] translate-x-[10%] h-80 w-80 bg-red-600/10 rounded-full blur-3xl" />
                
                <div className="mx-auto max-w-3xl text-center space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-3 py-1 rounded-full">
                    Moscovium115 Ecosystem
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1">
                    {t('whoTitle')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
                    {t('whoDesc')}
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs font-sans font-bold inline-flex items-center gap-1.5 text-slate-100">
                      <User className="h-4 w-4 text-red-500" />
                      {t('statsBuyers')}
                    </span>
                    <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs font-sans font-bold inline-flex items-center gap-1.5 text-slate-100">
                      <Briefcase className="h-4 w-4 text-red-500" />
                      {t('statsSellers')}
                    </span>
                    <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs font-sans font-bold inline-flex items-center gap-1.5 text-slate-100">
                      <Globe className="h-4 w-4 text-red-500" />
                      {t('statsCountries')}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <section className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
            {!sellerUser ? (
              <SellerAuth
                authMode={authMode}
                onModeChange={setAuthMode}
                onLogin={handleSellerLogin}
                onRegister={handleSellerRegister}
                authError={authError}
                sellerUser={sellerUser}
              />
            ) : (
              <Dashboard 
                items={items}
                orders={orders}
                sellerStats={sellerStats}
                seller={sellerUser}
                onAddListing={handleAddListing}
                onRemoveListing={handleRemoveListing}
                onUpdateStats={setSellerStats}
                currency={activeCurrency}
                ads={ads}
                onAddAd={(newAd) => setAds((prev) => [newAd, ...prev])}
                onUpdateAds={setAds}
              />
            )}
          </section>
        )}

        {/* Git Assistant View */}
        {currentView === 'git-assistant' && (
          <section className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
            <GitAssistant />
          </section>
        )}
      </main>

      {/* Floating Chat Assistant Panel on Bottom Right */}
      <div className="fixed bottom-4 right-4 z-40">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform hover:scale-105"
            title="Open Live Chat Assistance"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-80 h-[430px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
            {/* Direct header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold font-sans text-white leading-none">Moscovium Hub Support</h4>
                  <span className="text-[9px] text-slate-400 block mt-1 font-sans">Automated Escrow Advocate</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-[11px]">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 shadow-sm leading-normal ${
                    msg.sender === 'user' 
                      ? 'bg-red-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-850 rounded-bl-none border border-slate-150'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="block text-[8px] opacity-70 text-right">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                placeholder="Ask about Escrow, Payouts, or Git uploads..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-350 p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 px-3 font-bold font-sans text-xs shrink-0 active:scale-95"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Cart Modal rendering */}
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckoutSuccess={handleCheckoutSuccess}
        currency={activeCurrency}
      />

      {/* Item inspection dialog */}
      <ItemDetailsModal 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
        currency={activeCurrency}
      />

      {/* Dynamic footer matching extracted dump styling */}
      <footer className="bg-slate-950 text-slate-200 mt-auto border-t border-slate-850">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white font-display">Moscovium115 Ecosystem</h4>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li><button onClick={() => setCurrentView('marketplace')} className="hover:text-white text-left focus:outline-none">Department Listings</button></li>
              <li><button onClick={() => setCurrentView('dashboard')} className="hover:text-white text-left focus:outline-none">Fulfillment Office</button></li>
              <li><button onClick={() => setCurrentView('git-assistant')} className="hover:text-white text-left focus:outline-none">Git Source Integration</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white font-display">Git Infrastructure</h4>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li><button onClick={() => setCurrentView('git-assistant')} className="hover:text-white text-left focus:outline-none">Local Repo Setup Wizard</button></li>
              <li><button onClick={() => setCurrentView('git-assistant')} className="hover:text-white text-left focus:outline-none">Git Configuration Guide</button></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub Console</a></li>
              <li><a href="https://gitlab.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitLab Workspace</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white font-display">Assurance Guarantee</h4>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed font-sans font-medium">
              We bind transactions seamlessly into independent cryptosecure wallets. Deposits lock until digital access keys confirm locally.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white font-display">Merchant Registry</h4>
            <div className="mt-4 space-y-2.5 text-xs text-slate-400 font-medium">
              <p>Active Node Session ID:</p>
              <p className="font-mono text-[10px] text-red-400 bg-white/5 border border-white/5 px-2 py-1 rounded truncate">
                moscovium-node-es-4481691461
              </p>
              <div className="flex gap-1.5 items-center text-red-500 font-bold">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span>Node operational</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 bg-slate-950/80">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-slate-400 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-red-600 text-white font-display font-black flex items-center justify-center text-xs">M</div>
              <p>&copy; 2026 Moscovium115 Web Escrow Inc. All rights reserved.</p>
            </div>
            <div className="text-slate-500 flex gap-2 text-base">
              <span>💳 Visa</span>
              <span>&bull;</span>
              <span>💳 MasterCard</span>
              <span>&bull;</span>
              <span>💳 PayPal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
