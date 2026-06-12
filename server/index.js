import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 4174);
const staticDir = path.join(__dirname, '../dist');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/project_one';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const items = [];
const orders = [];

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function sendError(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function setupDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      email text UNIQUE NOT NULL,
      password text,
      name text NOT NULL,
      role text NOT NULL CHECK (role IN ('buyer', 'seller')),
      shop_name text,
      display_name text,
      picture text,
      google_id text,
      created_at timestamptz DEFAULT now()
    )
  `);
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error('Unable to verify Google token');
  return {
    email: payload.email || '',
    name: payload.name || '',
    picture: payload.picture || '',
    emailVerified: payload.email_verified || false,
    googleId: payload.sub || '',
  };
}

function requireAuth(req, res, next) {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Not authenticated' });
}

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role, shopName, displayName } = req.body;
  if (!email || !password || !name || !role) {
    return sendError(res, 'email, password, name, and role are required');
  }

  if (role !== 'buyer' && role !== 'seller') {
    return sendError(res, 'role must be buyer or seller');
  }

  if (role === 'seller' && !shopName) {
    return sendError(res, 'shopName is required for sellers');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rowCount > 0) {
    return sendError(res, 'User already exists with that email', 400);
  }

  const passwordHash = await hashPassword(String(password));
  const userId = createId('user');
  await query(
    'INSERT INTO users (id, email, password, name, role, shop_name, display_name) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [
      userId,
      normalizedEmail,
      passwordHash,
      String(name),
      role,
      role === 'seller' ? String(shopName) : null,
      role === 'seller' ? String(displayName || name) : null,
    ]
  );

  const user = {
    id: userId,
    email: normalizedEmail,
    name: String(name),
    role,
    shopName: role === 'seller' ? String(shopName) : undefined,
    displayName: role === 'seller' ? String(displayName || name) : undefined,
  };

  req.session.user = user;
  return res.json({ success: true, user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 'email and password are required');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
  if (result.rowCount === 0) {
    return sendError(res, 'Login failed', 401);
  }

  const user = result.rows[0];
  if (!user.password || !(await verifyPassword(String(password), user.password))) {
    return sendError(res, 'Login failed', 401);
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    shopName: user.shop_name || undefined,
    displayName: user.display_name || undefined,
    picture: user.picture || undefined,
  };

  req.session.user = sessionUser;
  return res.json({ success: true, user: sessionUser });
});

app.post('/api/auth/google', async (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return sendError(res, 'Server missing GOOGLE_CLIENT_ID environment variable', 500);
  }

  const { idToken, role } = req.body;
  if (!idToken) {
    return sendError(res, 'Missing idToken');
  }

  try {
    const payload = await verifyGoogleToken(idToken);
    const normalizedEmail = payload.email.toLowerCase();
    const existing = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    let user;

    if (existing.rowCount === 0) {
      const newRole = role === 'seller' ? 'seller' : 'buyer';
      const userId = createId('user');
      const shopName = newRole === 'seller' ? `${payload.name || normalizedEmail.split('@')[0]}'s shop` : null;
      await query(
        'INSERT INTO users (id, email, name, role, shop_name, display_name, picture, google_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          userId,
          normalizedEmail,
          payload.name || normalizedEmail,
          newRole,
          shopName,
          payload.name || null,
          payload.picture || null,
          payload.googleId,
        ]
      );
      user = {
        id: userId,
        email: normalizedEmail,
        name: payload.name || normalizedEmail,
        role: newRole,
        shopName: shopName || undefined,
        displayName: payload.name || undefined,
        picture: payload.picture || undefined,
      };
    } else {
      user = existing.rows[0];
      user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        shopName: user.shop_name || undefined,
        displayName: user.display_name || undefined,
        picture: user.picture || undefined,
      };
    }

    req.session.user = user;
    return res.json({ success: true, user });
  } catch (error) {
    console.error('Google auth failed:', error?.message || error);
    return sendError(res, 'Google authentication failed', 401);
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = req.session?.user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  return res.json({ success: true, user });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('/api/items', (req, res) => {
  return res.json(items);
});

app.post('/api/orders', (req, res) => {
  const order = req.body;
  order.id = order.id || createId('order');
  order.createdAt = new Date().toISOString();
  orders.unshift(order);
  return res.json(order);
});

app.get('/api/orders', (req, res) => {
  return res.json(orders);
});

app.get('/api/sellers/:sellerId', async (req, res) => {
  const result = await query('SELECT id, email, name, role, shop_name, display_name, picture FROM users WHERE id = $1 AND role = $2', [req.params.sellerId, 'seller']);
  if (result.rowCount === 0) {
    return sendError(res, 'Seller not found', 404);
  }

  const seller = result.rows[0];
  return res.json({
    success: true,
    id: seller.id,
    email: seller.email,
    name: seller.name,
    role: seller.role,
    shopName: seller.shop_name,
    displayName: seller.display_name,
    picture: seller.picture,
  });
});

app.post('/api/sellers/:sellerId/items', requireAuth, (req, res) => {
  const user = req.session.user;
  if (user.role !== 'seller' || user.id !== req.params.sellerId) {
    return sendError(res, 'Not authorized to add items for this seller', 403);
  }

  const item = {
    ...req.body,
    id: createId('item'),
    sellerId: user.id,
    sellerName: user.shopName || user.name,
    createdAt: new Date().toISOString(),
  };

  items.unshift(item);
  return res.json(item);
});

app.delete('/api/sellers/:sellerId/items/:itemId', requireAuth, (req, res) => {
  const user = req.session.user;
  if (user.role !== 'seller' || user.id !== req.params.sellerId) {
    return sendError(res, 'Not authorized to remove this item', 403);
  }

  const index = items.findIndex((item) => item.id === req.params.itemId && item.sellerId === user.id);
  if (index === -1) {
    return sendError(res, 'Item not found for this seller', 404);
  }

  items.splice(index, 1);
  return res.json({ success: true });
});

app.use(express.static(staticDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

setupDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend server running on http://localhost:${port}`);
      if (!GOOGLE_CLIENT_ID) {
        console.warn('GOOGLE_CLIENT_ID is not configured. Google login will fail until it is set.');
      }
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
