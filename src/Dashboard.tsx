import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'buyer' | 'seller';
  shopName?: string;
  displayName?: string;
}

interface Item {
  id: string;
  title: string;
  price: number;
  description?: string;
  sellerId: string;
  sellerName: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: { id: string; title: string; price: number; quantity: number }[];
  total: number;
  status: string;
  date: string;
}

interface DashboardProps {
  user: User;
  apiBase: string;
  onSignOut?: () => void;
}

export function Dashboard({ user, apiBase, onSignOut }: DashboardProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${apiBase}/api/items`, { credentials: 'include' }).then((r) => r.json()),
      fetch(`${apiBase}/api/orders`, { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([itemsData, ordersData]) => {
        setItems(Array.isArray(itemsData) ? itemsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setError(null);
      })
      .catch((err) => {
        console.warn('Failed to fetch data:', err);
        setError('Failed to load data');
      })
      .finally(() => setLoading(false));
  }, [apiBase]);

  if (user.role === 'seller') {
    return <SellerDashboard user={user} items={items} orders={orders} apiBase={apiBase} onSignOut={onSignOut} />;
  }

  return <BuyerDashboard user={user} items={items} orders={orders} apiBase={apiBase} onSignOut={onSignOut} />;
}

interface ItemAd {
  id: string;
  itemId?: string;
  itemTitle: string;
  bid: number;
  durationDays: number;
  createdAt: string;
}

interface ShopAd {
  id: string;
  message: string;
  dailyCost: number;
  durationDays: number;
  totalCost: number;
  createdAt: string;
}

function SellerDashboard({ user, items, orders, apiBase, onSignOut }: DashboardProps & { items: Item[]; orders: Order[] }) {
  const [newItem, setNewItem] = useState({ title: '', price: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adError, setAdError] = useState<string | null>(null);
  const [itemAds, setItemAds] = useState<ItemAd[]>([]);
  const [shopAds, setShopAds] = useState<ShopAd[]>([]);
  const [newItemAd, setNewItemAd] = useState({ itemId: '', customTitle: '', bid: '0.50', duration: '1' });
  const [newShopAd, setNewShopAd] = useState({ message: '', dailyCost: '1', duration: '1' });

  const userItems = items.filter((item) => item.sellerId === user.id);
  const selectedItem = userItems.find((item) => item.id === newItemAd.itemId);
  const selectedItemTitle = selectedItem?.title || newItemAd.customTitle.trim();

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.price) {
      setError('Title and price are required');
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/sellers/${user.id}/items`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newItem.title,
          price: parseFloat(newItem.price),
          description: newItem.description,
        }),
      });

      if (!res.ok) throw new Error('Failed to add item');
      await res.json();
      setNewItem({ title: '', price: '', description: '' });
      alert('Item added successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding item');
    } finally {
      setAdding(false);
    }
  };

  const handleAddItemAd = (e: React.FormEvent) => {
    e.preventDefault();
    const bid = parseFloat(newItemAd.bid);
    const durationDays = parseInt(newItemAd.duration, 10);
    const title = selectedItemTitle || '';

    if (!title) {
      setAdError('Please choose an item or enter a custom product name.');
      return;
    }
    if (Number.isNaN(bid) || bid < 0.5 || bid > 100) {
      setAdError('Item ad price must be between $0.50 and $100.');
      return;
    }
    if (Number.isNaN(durationDays) || durationDays < 1 || durationDays > 30) {
      setAdError('Duration must be between 1 and 30 days.');
      return;
    }

    setItemAds((prev) => [
      {
        id: `item-ad-${Date.now()}`,
        itemId: newItemAd.itemId || undefined,
        itemTitle: title,
        bid,
        durationDays,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setAdError(null);
    setNewItemAd({ itemId: '', customTitle: '', bid: '0.50', duration: '1' });
  };

  const handleAddShopAd = (e: React.FormEvent) => {
    e.preventDefault();
    const dailyCost = parseFloat(newShopAd.dailyCost);
    const durationDays = parseInt(newShopAd.duration, 10);

    if (!newShopAd.message.trim()) {
      setAdError('Please enter a shop promotion message.');
      return;
    }
    if (Number.isNaN(dailyCost) || dailyCost < 1 || dailyCost > 100) {
      setAdError('Shop ad cost must be between $1 and $100 per day.');
      return;
    }
    if (Number.isNaN(durationDays) || durationDays < 1 || durationDays > 30) {
      setAdError('Duration must be between 1 and 30 days.');
      return;
    }

    const totalCost = dailyCost * durationDays;
    setShopAds((prev) => [
      {
        id: `shop-ad-${Date.now()}`,
        message: newShopAd.message.trim(),
        dailyCost,
        durationDays,
        totalCost,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setAdError(null);
    setNewShopAd({ message: '', dailyCost: '1', duration: '1' });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Seller Dashboard</h1>
          <p>Shop: {user.shopName}</p>
        </div>
        {onSignOut && (
          <button className="button secondary" onClick={onSignOut}>
            Sign out
          </button>
        )}
      </header>

      <div className="dashboard-grid">
        <div className="panel">
          <h2>Add New Item</h2>
          <form onSubmit={handleAddItem}>
            <input
              type="text"
              placeholder="Item title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              disabled={adding}
            />
            <input
              type="number"
              placeholder="Price (USD)"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              disabled={adding}
              step="0.01"
              min="0"
            />
            <textarea
              placeholder="Description (optional)"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              disabled={adding}
              rows={3}
            />
            <button type="submit" disabled={adding} className="button">
              {adding ? 'Adding…' : 'Add Item'}
            </button>
            {error && <div className="error-box">{error}</div>}
          </form>
        </div>

        <div className="panel">
          <h2>Marketing Ads</h2>
          <p className="hint">Promote products from $0.50 to $100, or promote your shop from $1 to $100 per day.</p>

          <form onSubmit={handleAddItemAd} className="ad-form">
            <h3>Product Promotion</h3>
            {userItems.length > 0 ? (
              <label>
                Select product to promote
                <select
                  value={newItemAd.itemId}
                  onChange={(e) => setNewItemAd({ ...newItemAd, itemId: e.target.value, customTitle: '' })}
                >
                  <option value="">Select an item to promote</option>
                  {userItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <input
                type="text"
                placeholder="Product name to promote"
                value={newItemAd.customTitle}
                onChange={(e) => setNewItemAd({ ...newItemAd, customTitle: e.target.value })}
              />
            )}
            <input
              type="number"
              placeholder="Ad price ($0.50 - $100)"
              value={newItemAd.bid}
              onChange={(e) => setNewItemAd({ ...newItemAd, bid: e.target.value })}
              step="0.01"
              min="0.5"
              max="100"
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={newItemAd.duration}
              onChange={(e) => setNewItemAd({ ...newItemAd, duration: e.target.value })}
              min="1"
              max="30"
            />
            <button type="submit" className="button">
              Create Product Ad
            </button>
          </form>

          <form onSubmit={handleAddShopAd} className="ad-form">
            <h3>Shop Promotion</h3>
            <textarea
              placeholder="Message to market your shop"
              value={newShopAd.message}
              onChange={(e) => setNewShopAd({ ...newShopAd, message: e.target.value })}
              rows={3}
            />
            <input
              type="number"
              placeholder="Daily budget ($1 - $100)"
              value={newShopAd.dailyCost}
              onChange={(e) => setNewShopAd({ ...newShopAd, dailyCost: e.target.value })}
              step="0.01"
              min="1"
              max="100"
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={newShopAd.duration}
              onChange={(e) => setNewShopAd({ ...newShopAd, duration: e.target.value })}
              min="1"
              max="30"
            />
            <button type="submit" className="button">
              Create Shop Ad
            </button>
          </form>

          {adError && <div className="error-box">{adError}</div>}

          <div className="ads-summary">
            <h3>Active Ads</h3>
            {itemAds.length === 0 && shopAds.length === 0 ? (
              <p className="hint">No active ads yet. Create an ad to promote your products or shop.</p>
            ) : (
              <div className="ads-list">
                {itemAds.map((ad) => (
                  <div key={ad.id} className="ad-card">
                    <strong>Product Ad:</strong> {ad.itemTitle}
                    <p>${ad.bid.toFixed(2)} for {ad.durationDays} day(s)</p>
                    <p className="hint">Created {new Date(ad.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
                {shopAds.map((ad) => (
                  <div key={ad.id} className="ad-card">
                    <strong>Shop Ad:</strong> {ad.message}
                    <p>${ad.dailyCost.toFixed(2)} per day × {ad.durationDays} days = ${ad.totalCost.toFixed(2)}</p>
                    <p className="hint">Created {new Date(ad.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <h2>Your Items ({userItems.length})</h2>
          {userItems.length === 0 ? (
            <p className="hint">No items listed yet</p>
          ) : (
            <div className="items-list">
              {userItems.map((item) => (
                <div key={item.id} className="item-card">
                  <div>
                    <h3>{item.title}</h3>
                    <p>${item.price}</p>
                    {item.description && <p className="hint">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="hint">No orders yet</p>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <strong>Order {order.id.slice(-6)}</strong>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <p>${order.total.toFixed(2)}</p>
                  <p className="hint">{order.items.length} item(s)</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BuyerDashboard({ user, items, orders, apiBase, onSignOut }: DashboardProps & { items: Item[]; orders: Order[] }) {
  const [cart, setCart] = useState<{ item: Item; quantity: number }[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checking, setChecking] = useState(false);

  const cartTotal = cart.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);

  const handleAddToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutEmail || cart.length === 0) return;

    setChecking(true);
    try {
      const order = {
        id: `order-${Date.now()}`,
        customerName: checkoutName,
        customerEmail: checkoutEmail,
        items: cart.map(({ item, quantity }) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity,
        })),
        total: cartTotal,
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
      };

      const res = await fetch(`${apiBase}/api/orders`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (!res.ok) throw new Error('Failed to place order');

      alert(`Order placed! Total: $${cartTotal.toFixed(2)}`);
      setCart([]);
      setShowCheckout(false);
      setCheckoutName('');
      setCheckoutEmail('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error placing order');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Buyer Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <div className="header-actions">
          <span className="cart-badge">Cart: {cart.length}</span>
          {onSignOut && (
            <button className="button secondary" onClick={onSignOut}>
              Sign out
            </button>
          )}
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="panel items-panel">
          <h2>Marketplace ({items.length} items)</h2>
          {items.length === 0 ? (
            <p className="hint">No items available</p>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="marketplace-item">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="price">${item.price}</p>
                    {item.description && <p className="hint">{item.description}</p>}
                    <p className="seller">by {item.sellerName}</p>
                  </div>
                  <button className="button" onClick={() => handleAddToCart(item)}>
                    Add to cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel cart-panel">
          <h2>Shopping Cart</h2>
          {cart.length === 0 ? (
            <p className="hint">Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(({ item, quantity }) => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <strong>{item.title}</strong>
                      <p>
                        ${item.price} × {quantity} = ${(item.price * quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      className="button outline"
                      onClick={() =>
                        setCart((prev) =>
                          prev
                            .map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity - 1 } : c))
                            .filter((c) => c.quantity > 0)
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <strong>Total: ${cartTotal.toFixed(2)}</strong>
              </div>
              <button className="button" onClick={() => setShowCheckout(true)}>
                Checkout
              </button>
            </>
          )}

          {showCheckout && (
            <form onSubmit={handleCheckout} className="checkout-form">
              <h3>Complete Your Order</h3>
              <input
                type="text"
                placeholder="Your name"
                value={checkoutName}
                onChange={(e) => setCheckoutName(e.target.value)}
                disabled={checking}
              />
              <input
                type="email"
                placeholder="Your email"
                value={checkoutEmail}
                onChange={(e) => setCheckoutEmail(e.target.value)}
                disabled={checking}
              />
              <button type="submit" disabled={checking || cart.length === 0} className="button">
                {checking ? 'Processing…' : 'Place Order'}
              </button>
              <button
                type="button"
                className="button outline"
                onClick={() => setShowCheckout(false)}
                disabled={checking}
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        <div className="panel orders-panel">
          <h2>Your Orders</h2>
          {orders.length === 0 ? (
            <p className="hint">No orders yet</p>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <strong>Order {order.id.slice(-6)}</strong>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <p>${order.total.toFixed(2)}</p>
                  <p className="hint">{order.items.length} item(s)</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
