export interface Item {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  type: 'product' | 'service' | 'digital';
  image: string;
  description: string;
  rating: number;
  reviewsCount: number;
  sellerName: string;
  sellerId: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  createdAt: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Completed' | 'Refunded';
  date: string;
  customerName: string;
  customerEmail: string;
}

export interface Seller {
  id: string;
  email: string;
  password?: string;
  shopName: string;
  displayName: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  method: 'SWIFT' | 'Wise' | 'PayPal' | 'Bank Transfer';
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  accountDetails: string;
}

export interface SellerStats {
  earnings: number;
  wallet: number;
  completedOrders: number;
  withdrawals: WithdrawalRequest[];
}
