import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, ArrowRight, Loader2, Key } from 'lucide-react';
import { CartItem } from '../types';
import { playCashOutSound, playCashInSound } from '../lib/audio';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, qty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckoutSuccess: (customerName: string, customerEmail: string) => void;
  currency?: { code: string; symbol: string; rate: number };
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutSuccess,
  currency
}: CartModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('Brian Wekesa');
  const [customerEmail, setCustomerEmail] = useState('brianwekesa155@gmail.com');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'processing'>('cart');

  if (!isOpen) return null;

  const formatPrice = (usdPrice: number) => {
    if (!currency) {
      return `$${usdPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const converted = usdPrice * currency.rate;
    return `${currency.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const total = cartItems.reduce((acc, item) => acc + (item.item.price * item.quantity), 0);

  const startCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutStep('details');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('processing');
    setIsProcessing(true);
    playCashOutSound(); // Transaction initiated sound

    // Simulate standard global payment processing securely
    setTimeout(() => {
      playCashInSound(); // Payment successful sound
      setIsProcessing(false);
      onCheckoutSuccess(customerName, customerEmail);
      setCheckoutStep('cart');
      onClose();
    }, 2500);
  };

  const handleRemoveItem = (itemId: string) => {
    playCashOutSound(); // Money leaves when item removed
    onRemoveItem(itemId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-sans">Shopping Cart</h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-md font-sans">
              {cartItems.length} items
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-full p-1.5 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body based on checkout step */}
        {checkoutStep === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <span className="text-4xl text-slate-300">🛒</span>
                  <p className="text-sm font-semibold text-slate-400 font-sans">Your shopping cart is currently empty</p>
                  <button 
                    onClick={onClose}
                    className="text-red-600 hover:text-red-700 text-xs font-bold font-sans"
                  >
                    Go browse unique items
                  </button>
                </div>
              ) : (
                cartItems.map((cartItem) => (
                  <div key={cartItem.item.id} className="flex gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl relative">
                    <img 
                      src={cartItem.item.image} 
                      alt={cartItem.item.title} 
                      className="h-16 w-16 object-cover rounded-xl border border-slate-200 shrink-0"
                      onError={(e) => {
                        const tgt = e.target as HTMLImageElement;
                        tgt.onerror = null;
                        tgt.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80';
                      }}
                    />
                    
                    <div className="flex-1 min-w-0 pr-6 space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-850 line-clamp-1 font-sans">{cartItem.item.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">{cartItem.item.category}</p>
                      
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        {/* Quantity Changer */}
                        <div className="flex items-center gap-1 bg-white border border-slate-250 rounded-lg p-0.5">
                          <button 
                            onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            className="h-6 w-6 inline-flex items-center justify-center text-slate-500 hover:text-slate-850 hover:bg-slate-100 rounded text-sm transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold px-2.5 font-mono">{cartItem.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            className="h-6 w-6 inline-flex items-center justify-center text-slate-500 hover:text-slate-850 hover:bg-slate-100 rounded text-sm transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-sm font-bold text-slate-900 font-mono">
                          {formatPrice(cartItem.item.price * cartItem.quantity)}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveItem(cartItem.item.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-5 bg-slate-50 border-t border-slate-150 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-500">Order Subtotal</span>
                  <span className="font-bold text-slate-900 font-mono text-lg">{formatPrice(total)}</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5 text-[11px] text-emerald-800">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Payments secured with 256-bit encrypted bank connection.</span>
                </div>

                <button
                  onClick={startCheckout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm font-sans"
                >
                  <span>Proceed to Escrow Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {checkoutStep === 'details' && (
          <form onSubmit={handlePayment} className="p-6 space-y-4 overflow-y-auto flex-1">
            <h3 className="font-bold text-slate-900 text-sm tracking-wider uppercase">Buyer Escrow Information</h3>
            <p className="text-xs text-slate-500">Provide payment receipt information. Escrow payouts are unlocked upon item receipt or link delivery.</p>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Buyer Full Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Receipt Email Address</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5 text-xs font-semibold">
              <button 
                type="button"
                onClick={() => setCheckoutStep('cart')}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Back to Cart
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-[0.98]"
              >
                Pay {formatPrice(total)} Now
              </button>
            </div>
          </form>
        )}

        {checkoutStep === 'processing' && (
          <div className="p-12 text-center space-y-4 flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-850 font-sans">Verifying Escrow Transaction</p>
              <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto">Syncing payment tokens with Moscovium115 ledgers &amp; wallet gateways...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
