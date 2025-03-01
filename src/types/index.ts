export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'employee' | 'admin';
  sharesOwned: number;
  balance: number;
  joinedAt: string;
  walletId?: string;
}

export interface StockPrice {
  timestamp: string;
  price: number;
}

export interface StockData {
  currentPrice: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  percentChange: number;
  volume: number;
  marketCap: number;
  priceHistory: StockPrice[];
}

export interface Transaction {
  id: string;
  userId: string;
  user_id?: string;
  type: 'buy' | 'sell' | 'grant';
  shares: number;
  price: number;
  timestamp: string;
  counterpartyId?: string;
  counterparty_id?: string;
  senderWalletId?: string;
  sender_wallet_id?: string;
  receiverWalletId?: string;
  receiver_wallet_id?: string;
  creditedDebited?: 'credited' | 'debited';
  credited_debited?: string;
}

export interface OrderBook {
  buyOrders: Order[];
  sellOrders: Order[];
}

export interface Order {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  author: string;
}

export interface Wallet {
  id: string;
  userId: string;
  shares: number;
  createdAt: string;
}
