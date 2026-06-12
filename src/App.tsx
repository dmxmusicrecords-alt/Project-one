import { useEffect, useState } from 'react';
import { Dashboard } from './Dashboard';

declare global {
  interface Window {
    google?: any;
  }
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller';
  picture?: string;
  shopName?: string;
  displayName?: string;
}

const runtimeEnv = (window as any).__ENV__ || {};
const apiBase = import.meta.env.VITE_API_BASE || runtimeEnv.VITE_API_BASE || window.location.origin;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || runtimeEnv.VITE_GOOGLE_CLIENT_ID || '';

const defaultUser: User = {
  id: 'guest-buyer',
  email: 'guest@moscovium115.app',
  name: 'Guest Buyer',
  role: 'buyer',
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [googleRole, setGoogleRole] = useState<'buyer' | 'seller'>('buyer');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`${apiBase}/api/auth/me`, {
          credentials: 'include',
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.warn('Auth check failed', error);
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const setupGoogle = () => {
      if (!window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          if (!response.credential) {
            return;
          }
          await handleGoogleLogin(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      const container = document.getElementById('google-signin-button');
      if (container) {
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'pill',
        });
      }
    };

    const interval = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        setupGoogle();
        window.clearInterval(interval);
      }
    }, 500);

    setupGoogle();
    return () => window.clearInterval(interval);
  }, [googleClientId]);

  const handleAuthResponse = async (data: any) => {
    if (data.success) {
      setUser(data.user);
      setAuthError(null);
      setEmail('');
      setPassword('');
      setName('');
      setShopName('');
      setDisplayName('');
    } else {
      setAuthError(data.error || 'Authentication failed');
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      await handleAuthResponse(data);
    } catch (error) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          shopName: role === 'seller' ? shopName : undefined,
          displayName: role === 'seller' ? displayName : undefined,
        }),
      });
      const data = await response.json();
      await handleAuthResponse(data);
    } catch (error) {
      setAuthError('Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${apiBase}/api/auth/google`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, role: googleRole }),
      });
      const data = await response.json();
      await handleAuthResponse(data);
    } catch (error) {
      setAuthError('Google sign-in failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.warn('Logout failed', error);
    }
    setUser(null);
  };

  const continueAsGuest = () => {
    setUser(defaultUser);
  };

  if (loadingUser) {
    return (
      <div className="app-shell">
        <div className="card">
          <header>
            <h1>Moscovium115</h1>
            <p>Checking your session…</p>
          </header>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell">
        <div className="card">
          <header>
            <h1>Moscovium115</h1>
            <p>Sign in as a buyer or seller with email/password or Google.</p>
          </header>

          <div className="login-card">
            <div className="selectors">
              <button
                type="button"
                className={`button ${authMode === 'login' ? 'active' : 'outline'}`}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`button ${authMode === 'register' ? 'active' : 'outline'}`}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
              {authMode === 'register' && (
                <>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="selectors">
                    <button
                      type="button"
                      className={`button ${role === 'buyer' ? 'active' : 'outline'}`}
                      onClick={() => setRole('buyer')}
                    >
                      Buyer
                    </button>
                    <button
                      type="button"
                      className={`button ${role === 'seller' ? 'active' : 'outline'}`}
                      onClick={() => setRole('seller')}
                    >
                      Seller
                    </button>
                  </div>
                  {role === 'seller' && (
                    <>
                      <input
                        type="text"
                        placeholder="Shop name"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </>
                  )}
                </>
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit" className="button" disabled={authLoading}>
                {authMode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <div id="google-signin-button" className="google-button-wrapper" />

            <div className="selectors auth-role-buttons">
              <button
                type="button"
                className={`button ${googleRole === 'buyer' ? 'active' : 'outline'}`}
                onClick={() => setGoogleRole('buyer')}
              >
                Google Buyer
              </button>
              <button
                type="button"
                className={`button ${googleRole === 'seller' ? 'active' : 'outline'}`}
                onClick={() => setGoogleRole('seller')}
              >
                Google Seller
              </button>
            </div>

            {authError && <div className="error-box">{authError}</div>}
            <button type="button" className="button outline" onClick={continueAsGuest}>
              Continue as guest
            </button>
          </div>

          <footer>
            <p>Already have an account? Sign in quickly with email/password or Google.</p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="card dashboard-wrapper">
        <Dashboard user={user} apiBase={apiBase} onSignOut={handleLogout} />
      </div>
      <footer>
        <p>Logged in as {user.name}. Use the dashboard to manage your marketplace experience.</p>
      </footer>
    </div>
  );
}

export default App;
