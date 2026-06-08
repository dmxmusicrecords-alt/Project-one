import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import multer from 'multer';
import fsSync from 'fs';
import { INITIAL_ITEMS } from './src/data';
import { Item, Order, Seller, SellerStats } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_STORE_PATH = path.join(__dirname, 'data-store.json');
const DIST_PATH = path.join(__dirname, 'dist');
const PUBLIC_UPLOADS = path.join(__dirname, 'public', 'assets', 'uploads');

const DEFAULT_SELLER: Seller = {
  id: 'bestgemdiamond',
  email: 'seller@bestgemdiamond.com',
  password: 'password123',
  shopName: 'Bestgemdiamond',
  displayName: 'Bestgemdiamond',
  createdAt: new Date().toISOString()
};

interface Store {
  items: Item[];
  orders: Order[];
  sellers: Seller[];
  sellerStats: Record<string, SellerStats>;
}

const DEFAULT_STORE: Store = {
  items: INITIAL_ITEMS,
  orders: [],
  sellers: [DEFAULT_SELLER],
  sellerStats: {
    [DEFAULT_SELLER.id]: {
      earnings: 84215.32,
      wallet: 1154.45,
      completedOrders: 324,
      withdrawals: []
    }
  }
};

async function ensureStore(): Promise<void> {
  try {
    await fs.access(DATA_STORE_PATH);
  } catch {
    await fs.writeFile(DATA_STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
  }
}

// ensure uploads directory exists
try {
  fsSync.mkdirSync(PUBLIC_UPLOADS, { recursive: true });
} catch (err) {
  // ignore
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PUBLIC_UPLOADS);
  },
  filename: function (req, file, cb) {
    const safe = `${Date.now()}-${file.originalname.replace(/[^a-z0-9.\-]/gi, '-')}`;
    cb(null, safe);
  }
});
const upload = multer({ storage });

function normalizeSellerStats(rawStats: any): Record<string, SellerStats> {
  if (!rawStats || typeof rawStats !== 'object') {
    return { [DEFAULT_SELLER.id]: DEFAULT_STORE.sellerStats[DEFAULT_SELLER.id] };
  }

  if ('earnings' in rawStats && 'wallet' in rawStats) {
    return { [DEFAULT_SELLER.id]: rawStats as SellerStats };
  }

  return rawStats as Record<string, SellerStats>;
}

async function loadStore(): Promise<Store> {
  try {
    await ensureStore();
    const fileContents = await fs.readFile(DATA_STORE_PATH, 'utf-8');
    const raw = JSON.parse(fileContents) as Partial<Store>;

    const items = Array.isArray(raw.items) ? raw.items : DEFAULT_STORE.items;
    const orders = Array.isArray(raw.orders) ? raw.orders : DEFAULT_STORE.orders;
    const sellers = Array.isArray(raw.sellers) ? raw.sellers : DEFAULT_STORE.sellers;
    const sellerStats = normalizeSellerStats(raw.sellerStats);

    const store: Store = {
      items,
      orders,
      sellers,
      sellerStats
    };

    if (!raw.sellers || !raw.sellerStats) {
      await saveStore(store);
    }

    return store;
  } catch (error) {
    console.warn('Unable to load store, falling back to defaults.', error);
    return DEFAULT_STORE;
  }
}

async function saveStore(store: Store): Promise<void> {
  await fs.writeFile(DATA_STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

const app = express();
app.use(express.json());

app.get('/api/items', async (req, res) => {
  const store = await loadStore();
  const sellerId = req.query.sellerId?.toString();
  if (sellerId) {
    return res.json(store.items.filter((item) => item.sellerId === sellerId));
  }
  res.json(store.items);
});

// Image upload endpoint for sellers
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  const r = req as any;
  if (!r.file) return res.status(400).json({ error: 'No file uploaded.' });
  // Return a public URL for the uploaded asset
  const url = `/assets/uploads/${r.file.filename}`;
  res.json({ url });
});

app.post('/api/items', async (req, res) => {
  const { title, price, originalPrice, category, type, image, description, sellerName, sellerId } = req.body;

  if (!title || !price || !category || !type || !description || !sellerName) {
    return res.status(400).json({ error: 'Missing required item fields.' });
  }

  const normalizedSellerId = sellerId && typeof sellerId === 'string'
    ? sellerId
    : sellerName.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') || 'anonymous-shop';

  const newItem: Item = {
    id: `item-${Date.now()}`,
    title,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category,
    type,
    image: image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    description,
    rating: 5.0,
    reviewsCount: 0,
    sellerName,
    sellerId: normalizedSellerId,
    createdAt: new Date().toISOString()
  };

  const store = await loadStore();
  store.items.unshift(newItem);
  await saveStore(store);
  res.status(201).json(newItem);
});

app.delete('/api/items/:id', async (req, res) => {
  const store = await loadStore();
  const itemId = req.params.id;
  store.items = store.items.filter((item) => item.id !== itemId);
  await saveStore(store);
  res.json({ success: true });
});

app.get('/api/sellers', async (req, res) => {
  const store = await loadStore();
  const sellers = store.sellers.map(({ password, ...seller }) => seller);
  res.json(sellers);
});

app.get('/api/sellers/:sellerId', async (req, res) => {
  const store = await loadStore();
  const seller = store.sellers.find((s) => s.id === req.params.sellerId);
  if (!seller) {
    return res.status(404).json({ error: 'Seller not found.' });
  }
  const { password, ...safeSeller } = seller;
  res.json(safeSeller);
});

app.post('/api/sellers/register', async (req, res) => {
  const { email, password, shopName, displayName } = req.body;
  if (!email || !password || !shopName || !displayName) {
    return res.status(400).json({ error: 'Missing required registration fields.' });
  }

  const store = await loadStore();
  const existingSeller = store.sellers.find((seller) => seller.email.toLowerCase() === email.toLowerCase());
  if (existingSeller) {
    return res.status(400).json({ error: 'Seller account already exists with that email.' });
  }

  const newSeller: Seller = {
    id: `seller-${Date.now()}`,
    email,
    password,
    shopName,
    displayName,
    createdAt: new Date().toISOString()
  };

  // generate a simple token for the seller session
  (newSeller as any).token = `t_${Math.random().toString(36).slice(2, 12)}_${Date.now()}`;

  store.sellers.push(newSeller);
  store.sellerStats[newSeller.id] = {
    earnings: 0,
    wallet: 0,
    completedOrders: 0,
    withdrawals: []
  };
  await saveStore(store);

  const { password: _password, ...safeSeller } = newSeller;
  res.status(201).json(safeSeller);
});

app.post('/api/sellers/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password.' });
  }

  const store = await loadStore();
  const seller = store.sellers.find((s) => s.email.toLowerCase() === email.toLowerCase() && s.password === password);
  if (!seller) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  // generate/update token and return with safe seller info
  const token = `t_${Math.random().toString(36).slice(2, 12)}_${Date.now()}`;
  seller.token = token;
  await saveStore(store);
  const { password: _password, ...safeSeller } = seller as any;
  res.json({ ...safeSeller, token });
});

app.get('/api/sellers/:sellerId/items', async (req, res) => {
  const store = await loadStore();
  const sellerId = req.params.sellerId;
  const items = store.items.filter((item) => item.sellerId === sellerId);
  res.json(items);
});

app.post('/api/sellers/:sellerId/items', async (req, res) => {
  const { title, price, originalPrice, category, type, image, description } = req.body;
  const sellerId = req.params.sellerId;
  const store = await loadStore();
  const seller = store.sellers.find((s) => s.id === sellerId);
  if (!seller) {
    return res.status(404).json({ error: 'Seller not found.' });
  }

  // Simple token auth: require Authorization: Bearer <token>
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header.' });
  }
  const token = auth.split(' ')[1];
  if (!token || seller.token !== token) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }

  if (!title || !price || !category || !type || !description) {
    return res.status(400).json({ error: 'Missing required item fields.' });
  }

  const newItem: Item = {
    id: `item-${Date.now()}`,
    title,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category,
    type,
    image: image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    description,
    rating: 5.0,
    reviewsCount: 0,
    sellerName: seller.shopName,
    sellerId: seller.id,
    createdAt: new Date().toISOString()
  };

  store.items.unshift(newItem);
  await saveStore(store);
  res.status(201).json(newItem);
});

app.delete('/api/sellers/:sellerId/items/:itemId', async (req, res) => {
  const sellerId = req.params.sellerId;
  const itemId = req.params.itemId;
  const store = await loadStore();
  const item = store.items.find((item) => item.id === itemId && item.sellerId === sellerId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found or does not belong to seller.' });
  }

  store.items = store.items.filter((item) => item.id !== itemId);
  await saveStore(store);
  res.json({ success: true });
});

app.get('/api/sellers/:sellerId/stats', async (req, res) => {
  const store = await loadStore();
  const sellerId = req.params.sellerId;
  const stats = store.sellerStats[sellerId];
  if (!stats) {
    return res.status(404).json({ error: 'Seller statistics not found.' });
  }
  res.json(stats);
});

app.get('/api/sellers/:sellerId/dashboard', async (req, res) => {
  const store = await loadStore();
  const sellerId = req.params.sellerId;
  const seller = store.sellers.find((s) => s.id === sellerId);

  if (!seller) {
    return res.status(404).json({ error: 'Seller not found.' });
  }

  const items = store.items.filter((item) => item.sellerId === sellerId);
  const stats = store.sellerStats[sellerId] || {
    earnings: 0,
    wallet: 0,
    completedOrders: 0,
    withdrawals: []
  };

  const { password, ...safeSeller } = seller;
  res.json({ seller: safeSeller, stats, inventoryCount: items.length, items });
});

app.get('/api/orders', async (req, res) => {
  const store = await loadStore();
  res.json(store.orders);
});

app.post('/api/orders', async (req, res) => {
  const { id, items, total, status, date, customerName, customerEmail } = req.body;
  if (!id || !items || !total || !status || !date || !customerName || !customerEmail) {
    return res.status(400).json({ error: 'Missing required order fields.' });
  }

  const newOrder: Order = {
    id,
    items,
    total: Number(total),
    status,
    date,
    customerName,
    customerEmail
  };

  const store = await loadStore();
  store.orders.unshift(newOrder);
  // Update seller stats for each seller represented in the order items
  const sellerTotals: Record<string, { earnings: number; completedOrders: number }> = {};
  for (const cartItem of newOrder.items) {
    const sid = cartItem.item?.sellerId || 'bestgemdiamond';
    const itemTotal = Number(cartItem.item?.price || 0) * (cartItem.quantity || 1);
    if (!sellerTotals[sid]) sellerTotals[sid] = { earnings: 0, completedOrders: 0 };
    sellerTotals[sid].earnings += itemTotal;
    sellerTotals[sid].completedOrders += 1;
  }

  for (const [sid, totals] of Object.entries(sellerTotals)) {
    if (!store.sellerStats[sid]) {
      store.sellerStats[sid] = { earnings: 0, wallet: 0, completedOrders: 0, withdrawals: [] };
    }
    store.sellerStats[sid].earnings = Number((store.sellerStats[sid].earnings + totals.earnings).toFixed(2));
    store.sellerStats[sid].wallet = Number((store.sellerStats[sid].wallet + totals.earnings).toFixed(2));
    store.sellerStats[sid].completedOrders = store.sellerStats[sid].completedOrders + totals.completedOrders;
  }
  await saveStore(store);
  res.status(201).json(newOrder);
});

app.get('/api/seller-stats', async (req, res) => {
  const store = await loadStore();
  res.json(store.sellerStats);
});

// Serve uploaded assets before serving built static files
app.use('/assets/uploads', express.static(PUBLIC_UPLOADS));

app.use(express.static(DIST_PATH));

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Moscovium115 backend running at http://localhost:${port}`);
});
