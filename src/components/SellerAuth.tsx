import React, { useState } from 'react';
import { Lock, User, ArrowRight, UserPlus, Megaphone } from 'lucide-react';
import { Seller } from '../types';

interface SellerAuthProps {
  authMode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, shopName: string, displayName: string) => Promise<void>;
  authError?: string | null;
  sellerUser?: Seller | null;
}

export default function SellerAuth({ authMode, onModeChange, onLogin, onRegister, authError, sellerUser }: SellerAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      await onLogin(email.trim(), password);
      return;
    }
    await onRegister(email.trim(), password, shopName.trim(), displayName.trim());
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-6 flex flex-col gap-2 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Seller Access</span>
        <h2 className="text-2xl font-black text-slate-900">{authMode === 'login' ? 'Seller Login' : 'Register Your Shop'}</h2>
        <p className="text-sm text-slate-500">Create or sign in to manage your shop, upload inventory, and view seller analytics.</p>
      </div>

      {sellerUser ? (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-900">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-emerald-700" />
            <div>
              <p className="font-bold">Signed in as {sellerUser.displayName}</p>
              <p className="text-slate-600">{sellerUser.shopName}</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {authError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{authError}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@email.com"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </label>
          </div>

          {authMode === 'register' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Shop Name
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Your Shop Name"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Display Name
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </label>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              {authMode === 'login' ? <><Lock className="h-4 w-4" /> Sign In</> : <><UserPlus className="h-4 w-4" /> Register</>}
            </button>
            <button
              type="button"
              onClick={() => onModeChange(authMode === 'login' ? 'register' : 'login')}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              {authMode === 'login' ? 'Create a new seller account' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
          <Megaphone className="h-4 w-4" /> Seller Dashboard API
        </div>
        <p>Securely manage your shop inventory, view orders, and withdraw funds from a dedicated seller account.</p>
      </div>
    </div>
  );
}
