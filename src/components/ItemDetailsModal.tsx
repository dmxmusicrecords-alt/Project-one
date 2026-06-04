import React from 'react';
import { X, Star, ShoppingCart, ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';
import { Item } from '../types';

interface ItemDetailsModalProps {
  item: Item | null;
  onClose: () => void;
  onAddToCart: (item: Item) => void;
  currency?: { code: string; symbol: string; rate: number };
}

export default function ItemDetailsModal({ item, onClose, onAddToCart, currency }: ItemDetailsModalProps) {
  if (!item) return null;

  const formatPrice = (usdPrice: number) => {
    if (!currency) {
      return `$${usdPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const converted = usdPrice * currency.rate;
    return `${currency.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-40 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-full p-2 border border-slate-200 transition-colors shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Product Media Column */}
        <div className="md:w-1/2 relative bg-slate-50 min-h-64 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-pink-50/30" />
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover z-10"
            onError={(e) => {
              const tgt = e.target as HTMLImageElement;
              tgt.onerror = null;
              tgt.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </div>

        {/* Product Content Column */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[95vh] md:max-h-[90vh]">
          <div className="space-y-4">
            {/* Category and Type Row */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-205">
                {item.category}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                {item.type}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-extrabold text-slate-900 leading-snug font-sans">
              {item.title}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'fill-amber-500' : 'text-slate-300'}`} 
                  />
                ))}
                <span className="text-xs font-bold text-slate-850 ml-1.5">{item.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-300 text-xs">|</span>
              <span className="text-xs text-slate-400 font-sans">{item.reviewsCount} verified reviews</span>
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">Price</span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {formatPrice(item.price)}
                </span>
                {item.originalPrice && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
                {item.originalPrice && (
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                    SAVE {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.description}</p>
            </div>

            {/* Features list based on type */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              {item.type === 'product' && (
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Ships in 2-3 business days. Tracking details supplied.</span>
                </div>
              )}
              {item.type === 'service' && (
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Clock className="h-4 w-4 text-purple-600 shrink-0" />
                  <span>Scheduled online/in-person. Booking calendar provided upon booking.</span>
                </div>
              )}
              {item.type === 'digital' && (
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Instant delivery. Check your email or download directly after checkout.</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Buyer coverage activated. Secure Escrow payment processing.</span>
              </div>
            </div>
            
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-center gap-2.5 text-[11px] text-slate-500">
              <span className="text-sm font-semibold">💎</span>
              <span>Offered by <strong>{item.sellerName}</strong> with 100% positive fulfillment record.</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => {
                onAddToCart(item);
                onClose();
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-5 rounded-2xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 font-sans"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Shopping Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
