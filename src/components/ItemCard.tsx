import React from 'react';
import { Star, ShoppingCart, ArrowUpRight, Zap, Play, FileCode2 } from 'lucide-react';
import { Item } from '../types';
import { playCashInSound } from '../lib/audio';

interface ItemCardProps {
  key?: string;
  item: Item;
  onViewDetails: (item: Item) => void;
  onAddToCart: (item: Item, e: React.MouseEvent) => void;
  currency?: { code: string; symbol: string; rate: number };
}

export default function ItemCard({ item, onViewDetails, onAddToCart, currency }: ItemCardProps) {
  const formatPrice = (usdPrice: number) => {
    if (!currency) {
      return `$${usdPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const converted = usdPrice * currency.rate;
    return `${currency.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const getBadgeIcon = () => {
    switch (item.type) {
      case 'service': return <Zap className="h-3 w-3" />;
      case 'digital': return <FileCode2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const getBadgeStyle = () => {
    switch (item.type) {
      case 'service': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'digital': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const handleAddToCartWithSound = (e: React.MouseEvent) => {
    playCashInSound(); // Ka-cheng sound when adding item to cart
    onAddToCart(item, e);
  };

  return (
    <div 
      onClick={() => onViewDetails(item)}
      className="group cursor-pointer flex flex-col h-full bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.99] duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50 min-h-48 flex items-center justify-center">
        {/* Fallback gradients if Unsplash image breaks or loading */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-pink-50/50 z-0" />
        
        <img 
          src={item.image} 
          alt={item.title} 
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] z-10"
          onError={(e) => {
            const tgt = e.target as HTMLImageElement;
            tgt.onerror = null;
            // set standard gradient
            tgt.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Item Badges */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-wrap gap-1.5 pointer-events-none">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm ${getBadgeStyle()}`}>
            {getBadgeIcon()}
            <span>{item.type}</span>
          </span>
          {item.price > 1000 && (
            <span className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm flex items-center gap-0.5">
              <span>Premium</span>
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <div className="absolute bottom-2.5 right-2.5 z-20 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
          <span className="bg-slate-900/90 hover:bg-slate-900 text-white rounded-full p-2 text-xs shadow-lg inline-flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 z-10 bg-white">
        <div className="flex-1 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
            {item.category}
          </div>
          <h3 className="line-clamp-2 text-sm font-bold text-slate-850 group-hover:text-red-600 transition-colors leading-snug">
            {item.title}
          </h3>
        </div>

        {/* Ratings and Reviews */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-500" />
            <span className="text-xs font-bold ml-1 text-slate-700">{item.rating.toFixed(1)}</span>
          </div>
          <span className="text-slate-300 text-xs">|</span>
          <span className="text-xs text-slate-400">({item.reviewsCount} reviews)</span>
        </div>

        {/* Price and Add-To-Cart Footer */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-extrabold text-slate-900 font-mono">
                {formatPrice(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 truncate font-sans">by {item.sellerName}</p>
          </div>

          <button
            onClick={handleAddToCartWithSound}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-100 transition-all shadow-sm shrink-0"
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
