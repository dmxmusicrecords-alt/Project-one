import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, DollarSign, PlusCircle, Grid, FileText, CheckCircle, 
  Calendar, TrendingUp, Send, AlertCircle, Trash2, ArrowUpRight, Megaphone, X, CreditCard, Save
} from 'lucide-react';
import { Item, Seller, SellerStats, WithdrawalRequest, Order } from '../types';
import { CATEGORIES } from '../data';
import { playCashInSound, playCashOutSound, playCashRegisterSound, playNotificationSound } from '../lib/audio';
import { MoscoviumAd } from './MoscoviumAds';

interface DashboardProps {
  items: Item[];
  orders: Order[];
  seller: Seller;
  sellerStats: SellerStats;
  onAddListing: (newItem: Item) => void;
  onRemoveListing: (itemId: string) => void;
  onUpdateStats: (newStats: SellerStats) => void;
  currency?: { code: string; symbol: string; rate: number; name: string };
  ads?: MoscoviumAd[];
  onAddAd?: (newAd: MoscoviumAd) => void;
  onUpdateAds?: (updatedAds: MoscoviumAd[]) => void;
}

export default function Dashboard({
  items,
  orders,
  seller,
  sellerStats,
  onAddListing,
  onRemoveListing,
  onUpdateStats,
  currency,
  ads = [],
  onAddAd,
  onUpdateAds
}: DashboardProps) {
  const formatPrice = (usdPrice: number) => {
    if (!currency) {
      return `$${usdPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const converted = usdPrice * currency.rate;
    return `${currency.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [activeTab, setActiveTab] = useState<'seller' | 'buyer' | 'list-item'>('seller');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'SWIFT' | 'Wise' | 'PayPal' | 'Bank Transfer'>('PayPal');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  // Listing Form States
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOrigPrice, setNewOrigPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Art & Collectibles');
  const [newType, setNewType] = useState<'product' | 'service' | 'digital'>('product');
  const [newImg, setNewImg] = useState('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80');
  const [newDesc, setNewDesc] = useState('');
  const [listSuccess, setListSuccess] = useState(false);

  // Promotional Campaign States
  const [promotingItem, setPromotingItem] = useState<Item | null>(null);
  const [promoType, setPromoType] = useState<'product' | 'shop'>('product');
  const [promoDurationDays, setPromoDurationDays] = useState<number>(7);
  const [promoTagline, setPromoTagline] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoCta, setPromoCta] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const promoFormRef = useRef<HTMLDivElement | null>(null);
  // Promo daily rate (USD) — default: product $0.50, shop $1.00
  const [promoDailyRate, setPromoDailyRate] = useState<number>(0.5);
  const [promoteExternally, setPromoteExternally] = useState<boolean>(false);
  const [externalBoostDaily, setExternalBoostDaily] = useState<number>(0);

  // Catalog Filter / Multi-Shop Campaign selector states
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('mine');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Pre-configured royalty-free stock imagery presets for easy user creation
  const imagePresets = [
    { name: 'Craft & Art', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80' },
    { name: 'Premium Tech', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80' },
    { name: 'Minimal Decor', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Fashion Wear', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Please enter a valid transfer amount.');
      return;
    }

    if (amt > sellerStats.wallet) {
      setWithdrawError('Insufficient balance in Moscovium wallet.');
      return;
    }

    if (!withdrawAccount.trim()) {
      setWithdrawError('Please enter withdrawal destination account coordinates.');
      return;
    }

    // Process valid withdrawal
    const request: WithdrawalRequest = {
      id: `w-${Date.now()}`,
      amount: amt,
      method: withdrawMethod,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      accountDetails: withdrawAccount
    };

    onUpdateStats({
      ...sellerStats,
      wallet: sellerStats.wallet - amt,
      withdrawals: [request, ...sellerStats.withdrawals]
    });

    playCashOutSound();

    setWithdrawAmount('');
    setWithdrawAccount('');
    setWithdrawSuccess(`Transfer request of ${formatPrice(amt)} submitted successfully!`);
  };

  const handleListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setListSuccess(false);

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please specify a valid item price.');
      return;
    }

    const origPriceNum = newOrigPrice ? parseFloat(newOrigPrice) : undefined;

    const sellerName = seller?.shopName || 'Bestgemdiamond';
    const sellerId = seller?.id || 'bestgemdiamond';
    const newItem: Item = {
      id: `item-${Date.now()}`,
      title: newTitle,
      price: priceNum,
      originalPrice: origPriceNum && !isNaN(origPriceNum) ? origPriceNum : undefined,
      category: newCategory,
      type: newType,
      image: newImg,
      description: newDesc,
      rating: 5.0,
      reviewsCount: 0,
      sellerName,
      sellerId,
      createdAt: new Date().toISOString()
    };

    onAddListing(newItem);
    setListSuccess(true);
    playCashInSound();
    
    // Reset Form
    setNewTitle('');
    setNewPrice('');
    setNewOrigPrice('');
    setNewDesc('');

    // Switch tab back to list preview after brief pause
    setTimeout(() => {
      setListSuccess(false);
      setActiveTab('seller');
    }, 2000);
  };

  const handleInitiatePromote = (item: Item) => {
    setPromotingItem(item);
    setPromoType('product');
    setPromoDurationDays(7);
    setPromoTagline('Featured Daily Deal! ★★★★★');
    setPromoDesc(item.description);
    setPromoCta(`Inspect Offer (${formatPrice(item.price)})`);
    setPromoSuccess(false);
    // ensure daily rate default aligns with promo type
    setPromoDailyRate(0.5);
    // scroll the promotion form into view for quick access to payment
    setTimeout(() => {
      promoFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = promoFormRef.current?.querySelector('input, textarea, select') as HTMLElement | null;
      firstInput?.focus();
    }, 150);
  };

  useEffect(() => {
    // When promo type toggles, reset daily rate to sensible default
    if (promoType === 'shop') setPromoDailyRate(1.0);
    else setPromoDailyRate(0.5);
  }, [promoType]);

  const handleConfirmPromotionWithChoice = (isPaid: boolean) => {
    if (!promotingItem) return;

    const days = promoDurationDays || 7;
    const minRate = promoType === 'shop' ? 1.0 : 0.5;
    const dailyRate = Number(promoDailyRate);
    if (isNaN(dailyRate) || dailyRate < minRate || dailyRate > 100) {
      alert(`Daily rate must be between $${minRate.toFixed(2)} and $100.00`);
      return;
    }

    const boost = promoteExternally ? Number(externalBoostDaily) : 0;
    if (isNaN(boost) || boost < 0 || boost > 100) {
      alert('External boost must be between $0 and $100 per day.');
      return;
    }

    const totalDaily = Number((dailyRate + boost).toFixed(2));
    const totalCost = totalDaily * days;

    if (isPaid && sellerStats.wallet < totalCost) {
      alert(`Insufficient available funds! You require ${formatPrice(totalCost)} but only possess ${formatPrice(sellerStats.wallet)} in your merchant wallet. Please list more files, complete orders or adjust campaign duration.`);
      return;
    }

    if (onAddAd) {
      // Find matching category ID in categories data safely
      const catObj = CATEGORIES.find(c => c.name.toLowerCase() === promotingItem.category.toLowerCase()) || 
                     CATEGORIES.find(c => promotingItem.category.toLowerCase().includes(c.id.split('-')[0])) || 
                     CATEGORIES[0];
      const catActionValue = catObj ? catObj.id : 'art-collectibles';

      const isShop = promoType === 'shop';
      const cleanSellerName = promotingItem.sellerName.replace(' (Your Shop)', '');

      // Build a beautiful campaign
      const newAd: MoscoviumAd = {
        id: `ad-promoted-${Date.now()}`,
        title: isShop ? `${cleanSellerName} Storefront` : promotingItem.title,
        tagline: promoTagline.trim() || (isShop ? 'Genuine Premium Merchant Outlet' : 'Featured Daily Deal! ★★★★★'),
        description: promoDesc.trim() || (isShop ? `Explore certified items, prompt escrow settlement, and curated collections of ${cleanSellerName}.` : promotingItem.description),
        ctaText: promoCta.trim() || (isShop ? 'Visit Storefront' : 'Inspect Offer'),
        image: promotingItem.image,
        bgColor: isShop ? 'from-amber-950 via-slate-900 to-indigo-950' : 'from-slate-900 via-rose-955 to-indigo-955',
        tag: isShop ? 'Certified Shop' : 'Featured Product',
        badgeColor: isShop ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-rose-500/10 text-rose-300 border-rose-500/20',
        actionType: 'category',
        actionValue: catActionValue,
        clicks: 0,
        durationDays: days,
        dailyRate: dailyRate,
        advertiseOnM11: promoteExternally,
        externalBoostDaily: boost,
        isActive: isPaid
      };

      onAddAd(newAd);

      if (isPaid) {
        // Deduct cost of promotion from seller wallet
        onUpdateStats({
          ...sellerStats,
          wallet: Number((sellerStats.wallet - totalCost).toFixed(2))
        });
        playCashOutSound(); // Money leaving for promotion
      } else {
        playCashInSound(); // Free promotion activated
      }

      setPromoSuccess(true);

      // Dismiss dialog after success presentation
      setTimeout(() => {
        setPromoSuccess(false);
        setPromotingItem(null);
      }, 3000);
    }
  };

  const handleConfirmPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    handleConfirmPromotionWithChoice(true);
  };

  // Filter items specifically created by the current authenticated seller
  const userItems = items.filter(item => item.sellerId === seller?.id);

  // Dynamic filter for shop and products to advertise
  const activeShops = Array.from(new Set(items.map(item => item.sellerName || 'Anonymous Shop'))).filter(Boolean);

  const displayedCatalogItems = items.filter(item => {
    // 1. Shop choice filter
    if (selectedShopFilter === 'mine') {
      if (item.sellerId !== 'bestgemdiamond') return false;
    } else if (selectedShopFilter !== 'all') {
      // Normalize comparison to prevent minor naming variations inside mock listings
      const cleanFilter = selectedShopFilter.replace(' (Your Shop)', '').toLowerCase();
      const cleanSellerName = item.sellerName.replace(' (Your Shop)', '').toLowerCase();
      if (cleanSellerName !== cleanFilter) return false;
    }

    // 2. Specific product search query filter
    if (productSearchQuery.trim()) {
      const q = productSearchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchSeller = item.sellerName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat && !matchSeller) return false;
    }

    return true;
  });

  // ——————————————————————————————————————————————————————————
  // Derived Campaign Analysis & Investment Ledger
  // ——————————————————————————————————————————————————————————
  const userPromotedAds = ads.filter(ad => ad.id.startsWith('ad-promoted-') || ad.id.startsWith('ad-custom-'));
  
  // Calculate aggregate metrics
  const activeSponsorPlacements = userPromotedAds.filter(ad => ad.isActive !== false).length;
  const totalCampaignClicks = userPromotedAds.reduce((sum, ad) => sum + ad.clicks, 0);
  const totalInvestedFunds = userPromotedAds.reduce((sum, ad) => {
    if (ad.isActive === false) return sum;
    const rate = Math.min(100, ad.dailyRate ?? (ad.tag === 'Certified Shop' ? 1.0 : 0.5));
    const duration = ad.durationDays || 7;
    return sum + (rate * duration);
  }, 0);
  
  // Calculated CPC (Cost-per-click) safely
  const averageCPC = totalCampaignClicks > 0 ? (totalInvestedFunds / totalCampaignClicks) : 0;
  
  // Dynamic daily active burn
  const dailyActiveBurn = userPromotedAds.reduce((sum, ad) => {
    if (ad.isActive === false) return sum;
    return sum + Math.min(100, (ad.dailyRate ?? (ad.tag === 'Certified Shop' ? 1.0 : 0.5)));
  }, 0);

  const handlePayAndLaunchPromo = (adId: string) => {
    const targetAd = ads.find(a => a.id === adId);
    if (!targetAd) return;

    const rate = Math.min(100, targetAd.dailyRate ?? 0.5);
    const duration = targetAd.durationDays || 7;
    const cost = rate * duration;

    // Check balance
    if (sellerStats.wallet < cost) {
      alert(`Insufficient funds in your Merchant Wallet (${formatPrice(sellerStats.wallet)}) to satisfy this ad campaign budget ($${cost.toFixed(2)}). Please carry out more deliveries, sell some crafts, or fulfill active order queues to accrue wallet funds.`);
      playNotificationSound();
      return;
    }

    // Deduct wallet balance
    if (onUpdateStats) {
      onUpdateStats({
        ...sellerStats,
        wallet: Number((sellerStats.wallet - cost).toFixed(2))
      });
    }

    // Set ad to active
    if (onUpdateAds) {
      const updated = ads.map(a => a.id === adId ? { ...a, isActive: true } : a);
      onUpdateAds(updated);
    }

    playCashOutSound();
    alert(`Escrow Transaction Succeeded! Credited ${formatPrice(cost)} to the advertising engine. Campaign "${targetAd.title}" is now immediately active in the sponsors carousel!`);
  };

  const handleSimulateClick = (adId: string) => {
    if (onUpdateAds) {
      const updated = ads.map(ad => ad.id === adId ? { ...ad, clicks: ad.clicks + Math.floor(Math.random() * 3) + 1 } : ad);
      onUpdateAds(updated);
      playCashInSound(); // Simulated click = potential earnings
    }
  };

  const handleKillCampaign = (adId: string) => {
    const adToKill = ads.find(ad => ad.id === adId);
    if (!adToKill) return;
    
    const isUnpaid = adToKill.isActive === false;
    if (isUnpaid) {
      if (onUpdateAds) {
        onUpdateAds(ads.filter(ad => ad.id !== adId));
      }
      playNotificationSound();
      alert(`Unpaid draft campaign "${adToKill.title}" has been discarded.`);
      return;
    }

    const rate = Math.min(100, adToKill.dailyRate ?? (adToKill.tag === 'Certified Shop' ? 1.0 : 0.5));
    const duration = adToKill.durationDays || 7;
    const cost = rate * duration;
    
    // 70% refund of initial cost credited back
    const refund = Number((cost * 0.70).toFixed(2));
    
    if (onUpdateAds) {
      onUpdateAds(ads.filter(ad => ad.id !== adId));
    }
    
    onUpdateStats({
      ...sellerStats,
      wallet: sellerStats.wallet + refund
    });
    
    playCashRegisterSound();
    alert(`Campaign terminated successfully! Escrow Ledger credited back with a refund of ${formatPrice(refund)} (representing 70% remaining runtime compensation).`);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Subheader Controls */}
      <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('seller')}
          className={`flex items-center gap-2 px-5 py-3 font-sans text-sm font-bold transition-all border-b-2 truncate shrink-0 ${
            activeTab === 'seller' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wallet className="h-4 w-4" />
          <span>Seller Office ({userItems.length} listed)</span>
        </button>
        <button
          onClick={() => setActiveTab('list-item')}
          className={`flex items-center gap-2 px-5 py-3 font-sans text-sm font-bold transition-all border-b-2 truncate shrink-0 ${
            activeTab === 'list-item' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>List a New Offer</span>
        </button>
        <button
          onClick={() => setActiveTab('buyer')}
          className={`flex items-center gap-2 px-5 py-3 font-sans text-sm font-bold transition-all border-b-2 truncate shrink-0 ${
            activeTab === 'buyer' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>My Purchase Orders ({orders.length})</span>
        </button>
      </div>

      {activeTab === 'seller' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (lg:col-span-4): Stats cards + Payout submission */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-black tracking-wider uppercase text-slate-500 font-sans block">Business Operations</span>
              
              {/* Stat 1: Lifetime Earnings */}
              <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-850 relative overflow-hidden shadow-sm">
                <div className="absolute right-0 bottom-0 translate-y-3 translate-x-3 opacity-5">
                  <DollarSign className="h-28 w-28" />
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-sans">Lifetime Earnings</p>
                <h3 className="text-xl font-black mt-1 font-mono leading-none">
                  {formatPrice(sellerStats.earnings)}
                </h3>
                <div className="flex items-center gap-1 mt-2.5 text-emerald-400 text-[10px] font-sans font-bold">
                  <TrendingUp className="h-3 w-3 animate-pulse" />
                  <span>+14.8% up this quarter</span>
                </div>
              </div>

              {/* Stat 2: Active Wallet balance */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 relative overflow-hidden shadow-xs">
                <div className="absolute right-2 bottom-2 text-slate-100 font-black text-xs select-none">
                  ESCROW ACCREDITED
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-sans">Available Wallet Balance</p>
                <h3 className="text-xl font-black mt-1 text-slate-900 font-mono leading-none">
                  {formatPrice(sellerStats.wallet)}
                </h3>
                <p className="text-slate-450 text-[10px] mt-2 font-sans font-medium">Secured by cryptographic Escrow release covenants</p>
              </div>

              {/* Stat 3: Completed orders counter */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 relative overflow-hidden shadow-xs">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-sans">Completed Orders</p>
                <h3 className="text-xl font-black mt-1 text-slate-900 font-mono leading-none">
                  {sellerStats.completedOrders}
                </h3>
                <p className="text-slate-455 text-[10px] mt-2 font-sans font-medium">Verified by 99.8% customer reviews</p>
              </div>
            </div>

            {/* Wallet Cashout Module */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xs">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">Withdraw Cash Earnings</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">Transfer available funds securely to global payout channels</p>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-705">Withdrawal Payout Method</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 text-slate-755 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  >
                    <option value="PayPal">PayPal Balance Wallet</option>
                    <option value="Wise">Wise Cross-border Account</option>
                    <option value="SWIFT">SWIFT International Wire</option>
                    <option value="Bank Transfer">Local Bank Transfer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-705">Withdraw Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 150.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-705">Recipient Account Coordinate Details</label>
                  <input
                    type="text"
                    placeholder="e.g. paypal-acc@mail.com or IBAN number"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  />
                </div>

                {withdrawError && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                {withdrawSuccess && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{withdrawSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs font-sans cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Execute Payout Request</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column (lg:col-span-8): Active Offers Catalog + Withdrawal historical logs */}
          <div className="lg:col-span-8 space-y-6">

            {/* Moscovium Sponsors Ad Desk & Live Investment Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 translate-y-[-20%] translate-x-[20%] opacity-15 pointer-events-none">
                <Megaphone className="h-64 w-64 text-red-500 rotate-12" />
              </div>

              {/* Title Header */}
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-[10px] font-black tracking-widest uppercase text-red-400 font-sans">
                      Moscovium Live Sponsors Array
                    </span>
                  </div>
                  <h3 className="text-base font-black uppercase tracking-wider font-sans text-slate-100">
                    Advertising Console & Smart Investment Ledger
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Track promotional performance analytics, live click CTRs, and manage your marketing ledger budgets in real-time.
                  </p>
                </div>
                
                {/* Simulated ROI Metrics indicator */}
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl px-4 py-2.5 shrink-0 flex items-center gap-3">
                  <div className="p-1.5 bg-red-500/10 text-red-400 rounded-lg">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Simulated Network Reach</span>
                    <span className="text-xs font-black font-mono text-white mt-1 block">99.98% SLA Guaranteed</span>
                  </div>
                </div>
              </div>

              {/* Investment Summary Analytics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                
                {/* Metric 1 */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden hover:bg-slate-950/90 transition-all group">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">Active Campaigns</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-2xl font-black font-mono tracking-tight text-white">{activeSponsorPlacements}</span>
                    <span className="text-[10px] text-slate-400 font-medium font-sans">Slots</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-sans mt-2">Running active banners</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden hover:bg-slate-950/90 transition-all group">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">Total Clicks</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-2xl font-black font-mono tracking-tight text-red-400">{totalCampaignClicks}</span>
                    <span className="text-[10px] text-slate-400 font-medium font-sans">Nodes</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-sans mt-2">Simulated visitor telemetry</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden hover:bg-slate-950/90 transition-all group">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">Capital Committed</span>
                  <div className="flex items-baseline gap-0.5 mt-2">
                    <span className="text-xl font-black font-mono tracking-tight text-slate-100">{formatPrice(totalInvestedFunds)}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-sans mt-2">Total investment ledger</p>
                </div>

                {/* Metric 4 */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden hover:bg-slate-950/90 transition-all group">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">Avg Cost-Per-Click</span>
                  <div className="flex items-baseline gap-0.5 mt-2">
                    <span className="text-xl font-black font-mono tracking-tight text-emerald-400">
                      {averageCPC > 0 ? formatPrice(averageCPC) : '$0.00'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-sans mt-2">Optimized marketing CPC</p>
                </div>

              </div>

              {/* Promotional Ad Campaigns Summary List */}
              <div className="space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans block">
                    Current Active Ad Placements Summary ({activeSponsorPlacements})
                  </span>
                  {activeSponsorPlacements > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 font-sans">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Ledger Burn: {formatPrice(dailyActiveBurn)} / Day
                    </span>
                  )}
                </div>

                {userPromotedAds.length === 0 ? (
                  <div className="text-center py-10 px-5 bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl space-y-4 font-sans">
                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-300">No active promotions running inside this workspace.</p>
                      <p className="text-[10px] text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                        Provide a budget, customized tags, and slogan to any product from your <b>Active Offers Catalog</b> below to deploy a campaign onto our homepage sponsors ticker instantly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                    {userPromotedAds.map(ad => {
                      const adCost = (ad.durationDays || 7) * Math.min(100, (ad.dailyRate ?? 0.5));
                      const isUnpaid = ad.isActive === false;
                      return (
                        <div key={ad.id} className={`bg-slate-950/40 border p-4 rounded-2xl flex flex-col justify-between gap-4 hover:bg-slate-950/80 transition-all relative group/ad ${
                          isUnpaid ? 'border-amber-550/20 bg-amber-550/5 hover:border-amber-550/40' : 'border-slate-850 hover:border-slate-700'
                        }`}>
                          
                          {/* Banner Info */}
                          <div className="flex gap-3">
                            <img 
                              src={ad.image} 
                              alt={ad.title} 
                              className="h-11 w-11 rounded-lg object-cover border border-slate-800 shrink-0" 
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${ad.badgeColor}`}>
                                  {ad.tag}
                                </span>
                                {isUnpaid ? (
                                  <span className="text-[8px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded animate-pulse">
                                    Unpaid Draft
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                    Live Rotation
                                  </span>
                                )}
                                <span className="text-[9px] text-slate-400 font-mono font-medium">
                                  {ad.durationDays} days @ {formatPrice(ad.dailyRate || 0.5)}/d
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-100 font-sans truncate" title={ad.title}>
                                {ad.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 italic line-clamp-1 font-sans">
                                "{ad.tagline}"
                              </p>
                            </div>
                          </div>

                          {/* Footer Action Parameters */}
                          <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-1 gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              {isUnpaid ? (
                                <div className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg font-mono font-bold flex items-center gap-1">
                                  <span>Pending Payment</span>
                                </div>
                              ) : (
                                <div className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded-lg font-mono font-bold flex items-center gap-1" title="Recorded Click traffic nodes">
                                  <span>{ad.clicks} Clicks</span>
                                </div>
                              )}
                              <span className="text-[9px] text-slate-500 font-semibold font-sans">Ttl cost: {formatPrice(adCost)}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isUnpaid ? (
                                /* Immediate Pay Now Checkout Button */
                                <button
                                  type="button"
                                  onClick={() => handlePayAndLaunchPromo(ad.id)}
                                  className="text-[9.5px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 rounded-lg transition-all font-semibold hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex items-center gap-0.5 shadow-sm font-sans"
                                  title="Charge wallet escrow and push live to sponsors instantly"
                                >
                                  <CreditCard className="h-3 w-3" />
                                  <span>Pay Now</span>
                                </button>
                              ) : (
                                /* Simulate Click Interaction */
                                <button
                                  type="button"
                                  onClick={() => handleSimulateClick(ad.id)}
                                  className="text-[9px] bg-red-650 hover:bg-red-600 text-white px-2 py-1 rounded-lg transition-all font-bold hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex items-center gap-0.5 shadow-2xs font-sans"
                                  title="Add simulated clicks to test smart ticker ROI"
                                >
                                  <ArrowUpRight className="h-2.5 w-2.5" />
                                  <span>Sim Clicks</span>
                                </button>
                              )}

                              {/* Terminate Campaign & Redeem Refund */}
                              <button
                                type="button"
                                onClick={() => handleKillCampaign(ad.id)}
                                className="text-[9px] hover:bg-red-500/10 text-slate-400 hover:text-red-400 p-1.5 rounded-lg transition-all cursor-pointer"
                                title={isUnpaid ? "Discard unpaid campaign draft" : "Terminate Promo Campaign & Re-credit Merchant Ledger"}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Active Offers Catalog & Promoters Deck */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">Active Offers Catalog</h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">Choose store portfolios or individual items to launch campaigns on the Moscovium115 Sponsors network</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full shrink-0">
                  ⭐ {displayedCatalogItems.length} options matching selection
                </span>
              </div>

              {/* Selector panel to filter either by shop portfolio or search specific individual product */}
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl gap-3 flex flex-col md:grid md:grid-cols-2">
                {/* Dropdown Shop Choice Filter */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Select Shop Portfolio</label>
                  <select
                    value={selectedShopFilter}
                    onChange={(e) => {
                      setSelectedShopFilter(e.target.value);
                      playNotificationSound();
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 font-bold text-slate-850 focus:ring-1 focus:ring-red-500/50 focus:outline-none cursor-pointer transition-all hover:bg-slate-50"
                  >
                    <option value="mine">🏪 My Shop (Bestgemdiamond)</option>
                    <option value="all">🌐 All Registered Shops</option>
                    {activeShops.map(sh => {
                      const cleanName = sh.replace(' (Your Shop)', '');
                      if (cleanName.toLowerCase() === 'bestgemdiamond') return null;
                      return (
                        <option key={sh} value={sh}>🏢 Shop: {cleanName}</option>
                      );
                    })}
                  </select>
                </div>

                {/* Specific Product search target */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Search / Filter Products</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Search product keys, description or tags..."
                      className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 focus:ring-1 focus:ring-red-500/50 focus:outline-none text-slate-800 placeholder-slate-400"
                    />
                    {productSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setProductSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 hover:text-slate-600 px-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Fast selector dropdown to choose an individual product to instantly start the promotion */}
                <div className="md:col-span-2 space-y-1 border-t border-slate-200/50 pt-3 mt-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Fast-Select Target Product to Advertise</label>
                  <select
                    onChange={(e) => {
                      const pickedId = e.target.value;
                      if (pickedId) {
                        const found = items.find(i => i.id === pickedId);
                        if (found) {
                          handleInitiatePromote(found);
                        }
                        e.target.value = ''; // Reset select
                      }
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 text-slate-755 focus:ring-1 focus:ring-red-500/50 focus:outline-none cursor-pointer hover:bg-slate-50 transition-all font-medium"
                  >
                    <option value="">-- Choose specific product to immediately configure ad coordinates --</option>
                    {items.map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.sellerName.replace(' (Your Shop)', '')}] {p.title} ({formatPrice(p.price)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Catalog Product Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {displayedCatalogItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 col-span-2 font-sans bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                    No active products match your current filtering guidelines. Relax selection metrics above.
                  </div>
                ) : (
                  displayedCatalogItems.map((item) => {
                    const featuredCount = ads.filter(a => a.title === item.title).length;

                    return (
                      <div key={item.id} className="flex gap-4 p-4 border border-slate-205 hover:border-slate-350 hover:bg-slate-50/10 bg-slate-50/10 rounded-2xl relative transition-all group">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="h-14 w-14 object-cover rounded-xl border border-slate-200 shrink-0 animate-fade-in" 
                        />
                        <div className="space-y-1 min-w-0 pr-6 flex-1">
                          <div className="flex gap-1.5 items-center flex-wrap">
                            <span className="text-[9px] font-extrabold text-red-650 uppercase tracking-wider bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                              {item.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{item.category}</span>
                            {item.sellerId === 'bestgemdiamond' ? (
                              <span className="text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded">
                                Your Shop
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded truncate max-w-28" title={item.sellerName}>
                                Store: {item.sellerName}
                              </span>
                            )}
                            {featuredCount > 0 && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-250 px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                                ★ Ad Active ({featuredCount}x)
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-850 line-clamp-1 font-sans group-hover:text-red-650 transition-colors">{item.title}</h4>
                          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                            <p className="text-sm font-bold font-mono text-slate-900">{formatPrice(item.price)}</p>
                            <button
                              type="button"
                              onClick={() => handleInitiatePromote(item)}
                              className="text-[10px] font-black uppercase tracking-wider text-red-655 hover:text-white hover:bg-red-655 border border-red-300 rounded-lg px-2.5 py-1.5 transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95 shadow-2xs"
                            >
                              <Megaphone className="h-3 w-3" />
                              <span>Advertise</span>
                            </button>
                          </div>
                        </div>

                        {item.sellerId === 'bestgemdiamond' && (
                          <button 
                            onClick={() => onRemoveListing(item.id)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-650 transition-colors"
                            title="De-list Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Withdrawal Requests History */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">Withdrawal Requests History</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">Recent payout requests and execution statuses</p>
              </div>

              <div className="overflow-x-auto min-h-60 max-h-[300px]">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Payout Method</th>
                      <th className="py-2.5">Recipients</th>
                      <th className="py-2.5 text-right">Amount</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-sans text-slate-655">
                    {sellerStats.withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                          No processed cashout history found.
                        </td>
                      </tr>
                    ) : (
                      sellerStats.withdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-mono">{w.date}</td>
                          <td className="py-3">
                            <span className="font-semibold block">{w.method}</span>
                          </td>
                          <td className="py-3 font-mono text-[10px] truncate max-w-40">{w.accountDetails}</td>
                          <td className="py-3 text-right font-bold text-slate-900 font-mono">{formatPrice(w.amount)}</td>
                          <td className="py-3 text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              w.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'list-item' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 font-sans">Produce a New Shop Offer</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Submit item credentials to instantaneously make your offer active onto our global marketplace search catalog</p>
          </div>

          <form onSubmit={handleListSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Offer Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handmade Ceremonial Teacup sculpture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 text-slate-750 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Selling Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 45.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Original Price ($) - Optional comparison</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 60.00"
                  value={newOrigPrice}
                  onChange={(e) => setNewOrigPrice(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Type of Offer</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'product', label: 'Physical Product' },
                    { id: 'service', label: 'In-person Service' },
                    { id: 'digital', label: 'Digital Download' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewType(t.id as any)}
                      className={`text-xs py-2 px-3 border rounded-xl font-bold transition-all text-center leading-none ${
                        newType === t.id 
                          ? 'border-red-600 bg-red-50 text-red-600 shadow-xs' 
                          : 'border-slate-300 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Cover Image URL</label>
                <input
                  type="text"
                  required
                  value={newImg}
                  onChange={(e) => setNewImg(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick stock preset list */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Or Select Standard Visual Preset Template:</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {imagePresets.map((preset) => (
                  <div 
                    key={preset.name}
                    onClick={() => setNewImg(preset.url)}
                    className={`cursor-pointer rounded-xl border p-2 relative overflow-hidden transition-all ${
                      newImg === preset.url ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="h-10 w-full object-cover rounded-lg" />
                    <span className="block text-[10px] text-slate-700 font-bold mt-1 text-center font-sans">{preset.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Offer Summary / Details</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your item details, measurements, shipping policies, support options..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full text-xs font-sans rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {listSuccess && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 text-emerald-800 text-xs">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="space-y-0.5">
                  <p className="font-bold">Item Listed Live Successfully!</p>
                  <p>Check the search grid where your offer is currently listed.</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold text-xs rounded-xl active:scale-[0.98] transition-all"
            >
              List Item Live on Moscovium115
            </button>
          </form>
        </div>
      )}

      {activeTab === 'buyer' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">Completed Purchase Invoices</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">Full list of receipts acquired during your active session shopping</p>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-sans">
              No completed invoices found. Fill your shopping cart to complete your first purchase order!
            </div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {orders.map((order) => (
                <div key={order.id} className="border border-slate-250 bg-slate-50/50 rounded-2xl overflow-hidden shadow-sm">
                  {/* Order summary header */}
                  <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between font-sans text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block">Order Identifier</span>
                      <span className="font-mono font-bold text-slate-800">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Fulfillment Date</span>
                      <span className="font-bold text-slate-700">{order.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Secure Payment Status</span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Paid Escrow
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Total Receipt Price</span>
                      <span className="font-black text-slate-900 font-mono">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {/* Order Item List */}
                  <div className="p-4 divide-y divide-slate-100">
                    {order.items.map((cartItem) => (
                      <div key={cartItem.item.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-3">
                          <img src={cartItem.item.image} className="h-8 w-8 object-cover rounded" alt={cartItem.item.title} />
                          <div>
                            <p className="font-bold text-slate-800 leading-snug line-clamp-1">{cartItem.item.title}</p>
                            <p className="text-[10px] text-slate-400">Sold by {cartItem.item.sellerName} &bull; Qty {cartItem.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-750 font-mono">{formatPrice(cartItem.item.price * cartItem.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-red-50 text-slate-700 text-[10px] border-t border-slate-150 leading-relaxed font-sans px-4">
                    🛒 Digital access receipt and shipment codes were routed to your mailbox <strong>{order.customerEmail}</strong>.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Promotional Campaign Maker Dialog */}
      {promotingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs cursor-pointer" 
            onClick={() => setPromotingItem(null)} 
          />
          {/* Content Card */}
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 overflow-hidden z-10 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-red-650 animate-bounce" />
                <h3 className="font-sans font-black text-slate-900 text-sm tracking-tight uppercase">Launch Moscovium115 Banner Ad</h3>
              </div>
              <button 
                onClick={() => setPromotingItem(null)} 
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-4 p-3 bg-red-50/50 rounded-2xl border border-red-100/40 mb-4 items-center">
              <img 
                src={promotingItem.image} 
                alt={promotingItem.title} 
                className="h-12 w-12 object-cover rounded-xl border border-slate-200 shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-extrabold text-red-600 tracking-wider">Campaign Source Product</p>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{promotingItem.title}</p>
                <p className="text-xs font-mono font-medium text-slate-500">{formatPrice(promotingItem.price)} &bull; {promotingItem.category}</p>
              </div>
            </div>

            {promoSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-pulse">✓</div>
                <h4 className="text-sm font-bold text-slate-900">Campaign Activated Live!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Your customized promotional campaign was set active on the Moscovium115 Sponsors array. Campaign cost deducted from your available seller balances.</p>
              </div>
            ) : (
              <div ref={promoFormRef} id="promotion-form">
                <form onSubmit={handleConfirmPromotion} className="space-y-4 text-xs font-medium text-slate-700">
                {/* Promo Scope Choice */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Campaign Scope Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPromoType('product');
                        setPromoCta(`Inspect Offer (${formatPrice(promotingItem.price)})`);
                        playNotificationSound();
                      }}
                      className={`p-3 text-left border rounded-xl transition-all cursor-pointer select-none relative ${
                        promoType === 'product'
                          ? 'border-red-655 bg-red-50/70 text-red-950 ring-1 ring-red-600'
                          : 'border-slate-300 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight">Specific Item</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-sans">Focus on single product clicks</p>
                      <span className="absolute top-2 right-2 text-[10px] font-black font-mono text-red-650">$0.50<span className="text-[8px] font-medium text-slate-400">/d</span></span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPromoType('shop');
                        setPromoCta('Browse Merchant Shop');
                        playNotificationSound();
                      }}
                      className={`p-3 text-left border rounded-xl transition-all cursor-pointer select-none relative ${
                        promoType === 'shop'
                          ? 'border-red-655 bg-red-50/70 text-red-950 ring-1 ring-red-600'
                          : 'border-slate-300 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight">Entire Brand Shop</p>
                      <p className="text-[10px] text-slate-550 mt-1 font-sans">Direct buyers to store feed</p>
                      <span className="absolute top-2 right-2 text-[10px] font-black font-mono text-red-650">$1.00<span className="text-[8px] font-medium text-slate-400">/d</span></span>
                    </button>
                  </div>
                </div>

                {/* Campaign Duration in Days */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Campaign Duration</label>
                    <span className="text-xs font-black font-mono text-slate-800">{promoDurationDays} Days</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 7, 14, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setPromoDurationDays(d);
                          playNotificationSound();
                        }}
                        className={`py-2 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          promoDurationDays === d
                            ? 'border-red-650 bg-red-50/70 text-red-700 shadow-xs ring-1 ring-red-600'
                            : 'border-slate-200 text-slate-550 hover:bg-slate-50'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200/55 mt-1.5 animate-fade-in">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 font-sans">Custom Days:</span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={promoDurationDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setPromoDurationDays(val > 90 ? 90 : val);
                      }}
                      className="w-full text-xs font-mono rounded bg-white border border-slate-280 px-2 py-1 text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Daily rate input for campaign (enforced range) */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Daily Promotion Rate (USD)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={promoType === 'shop' ? 1.0 : 0.5}
                      max={100}
                      step={0.25}
                      value={promoDailyRate}
                      onChange={(e) => setPromoDailyRate(Number(e.target.value))}
                      className="w-32 rounded-xl border border-slate-300 p-2.5 text-slate-900 bg-white text-sm font-mono"
                    />
                    <div className="text-xs text-slate-500">Min: ${promoType === 'shop' ? '1.00' : '0.50'} — Max: $100.00</div>
                  </div>
                </div>

                {/* External advertising option for moscovium11.org */}
                <div className="space-y-1 text-left">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={promoteExternally}
                      onChange={(e) => setPromoteExternally(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Advertise on moscovium11.org</span>
                  </label>

                  {promoteExternally && (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.25}
                        value={externalBoostDaily}
                        onChange={(e) => setExternalBoostDaily(Number(e.target.value))}
                        className="w-36 rounded-xl border border-slate-300 p-2.5 text-slate-900 bg-white text-sm font-mono"
                      />
                      <div className="text-xs text-slate-500">Additional boost per day (USD) — Max: $100</div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Advertisement Slogan / Tagline</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Rare Certified Item - Instant Escrow Clearance!"
                    value={promoTagline}
                    onChange={(e) => setPromoTagline(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Campaign Body Description</label>
                  <textarea 
                    required
                    rows={2}
                    placeholder="Explain why buyers must purchase this product today..."
                    value={promoDesc}
                    onChange={(e) => setPromoDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none font-sans bg-white"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Call-to-Action (CTA) Label</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Inspect Unique Special Deal"
                    value={promoCta}
                    onChange={(e) => setPromoCta(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                  />
                </div>

                {/* Ledger cost dynamically calculated */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-205 space-y-1.5 text-slate-800">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-amber-900 tracking-wider">
                    <span>Investment Summary</span>
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
                      moscovium campaign config
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Daily Promotion Rate:</span>
                    <span className="font-bold font-mono text-slate-800">
                      {formatPrice(promoDailyRate)} per day
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-amber-200/50 pb-2 mb-1.5">
                    <span className="text-slate-500">Scheduled Run Time:</span>
                    <span className="font-bold text-slate-850">{promoDurationDays} days total</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-855">Total Campaign Budget:</span>
                    <span className="font-black font-mono text-emerald-800 text-base">
                      {formatPrice((promoDailyRate + (promoteExternally ? externalBoostDaily : 0)) * promoDurationDays)}
                    </span>
                  </div>
                  {promoteExternally && (
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>External Boost (per day):</span>
                      <span className="font-mono font-bold">{formatPrice(externalBoostDaily)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[10px] pt-1.5 text-slate-500 border-t border-dashed border-amber-200">
                    <span>Available Wallet Balance:</span>
                    <span className={`font-mono font-bold ${sellerStats.wallet < (promoDailyRate * promoDurationDays) ? 'text-red-650' : 'text-emerald-700'}`}>
                      {formatPrice(sellerStats.wallet)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleConfirmPromotionWithChoice(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs active:scale-98 shadow-sm flex items-center justify-center gap-1.5 font-sans"
                    title="Save this campaign draft onto your dashboard advertisement ledger without funding"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmPromotionWithChoice(true)}
                    className="bg-red-650 hover:bg-red-750 text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs active:scale-98 shadow-sm flex items-center justify-center gap-1.5 font-sans"
                    title="Charge merchant balance now and set campaign live immediately"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Pay & Launch</span>
                  </button>
                </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
