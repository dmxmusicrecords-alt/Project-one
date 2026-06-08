import React, { useEffect, useState } from 'react';
import { Item } from '../types';

export default function AdminPanel() {
  const [pending, setPending] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminToken, setAdminToken] = useState<string>(() => {
    try { return localStorage.getItem('adminToken') || ''; } catch { return ''; }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const apiRequest = async (path: string, options: RequestInit = {}) => {
    const headers = { ...options.headers } as Record<string, string>;
    if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }
    const response = await fetch(path, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      setLoggedIn(false);
      throw new Error('Unauthorized');
    }
    return response;
  };

  const fetchPending = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      if (!adminToken) {
        setLoading(false);
        return;
      }
      const res = await apiRequest('/api/admin/pending-items');
      const data = await res.json();
      setPending(data);
      setLoggedIn(true);
    } catch (err: any) {
      setPending([]);
      if (err.message === 'Unauthorized') {
        setAuthError('Session expired or invalid token. Please log in again.');
      } else {
        setAuthError('Unable to load pending items.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchPending();
    }
  }, [adminToken]);

  const handleLogin = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Login failed');
      }
      const data = await response.json();
      setAdminToken(data.token);
      setLoggedIn(true);
      localStorage.setItem('adminToken', data.token);
      setUsername('');
      setPassword('');
      fetchPending();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid admin login.');
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try { localStorage.removeItem('adminToken'); } catch {}
    setAdminToken('');
    setPending([]);
    setLoggedIn(false);
    setAuthError(null);
  };

  const approve = async (id: string) => {
    try {
      await apiRequest(`/api/admin/items/${id}/approve`, { method: 'POST' });
      await fetchPending();
    } catch (err: any) {
      setAuthError('Unable to approve item.');
    }
  };

  const reject = async (id: string) => {
    if (!confirm('Reject and remove this item?')) return;
    try {
      await apiRequest(`/api/admin/items/${id}/reject`, { method: 'POST' });
      await fetchPending();
    } catch (err: any) {
      setAuthError('Unable to reject item.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Moderation — Pending Items</h2>
      {!loggedIn ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
          <p className="mb-4 text-sm text-slate-700">Sign in with your admin username and password to manage pending listings.</p>
          {authError && <div className="text-sm text-red-600 mb-3">{authError}</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Admin session active</p>
            <p className="text-xs text-slate-500">You can approve or reject pending items now.</p>
          </div>
          <button onClick={handleLogout} className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Log out</button>
        </div>
      )}
      {loggedIn && (
        <>
          {authError && <div className="text-sm text-red-600 mb-3">{authError}</div>}
          {loading && <p>Loading…</p>}
          {!loading && pending.length === 0 && <p>No pending items.</p>}
          <div className="space-y-4">
            {pending.map(item => (
              <div key={item.id} className="p-4 border rounded-md flex gap-4 items-start">
                <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{item.title}</h3>
                      <div className="text-sm text-slate-600">{item.sellerName} — {item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">${item.price.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{item.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => approve(item.id)} className="bg-emerald-600 text-white px-3 py-1 rounded">Approve</button>
                    <button onClick={() => reject(item.id)} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
