
import { User, StockPrice, Transaction, Order, NewsItem } from "../types";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg",
    role: "employee",
    sharesOwned: 150,
    balance: 5000,
    joinedAt: "2023-01-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "/placeholder.svg",
    role: "admin",
    sharesOwned: 500,
    balance: 10000,
    joinedAt: "2022-11-10T00:00:00Z",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    avatar: "/placeholder.svg",
    role: "employee",
    sharesOwned: 75,
    balance: 3000,
    joinedAt: "2023-03-05T00:00:00Z",
  },
];

// Generate price history for the last 30 days
export const generatePriceHistory = (
  startPrice: number = 100,
  volatility: number = 0.02,
  days: number = 30
): StockPrice[] => {
  const prices: StockPrice[] = [];
  let currentPrice = startPrice;

  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some random movement to the price
    const change = currentPrice * volatility * (Math.random() * 2 - 1);
    currentPrice += change;
    
    // Ensure price doesn't go negative
    currentPrice = Math.max(currentPrice, 10);
    
    prices.push({
      timestamp: date.toISOString(),
      price: parseFloat(currentPrice.toFixed(2)),
    });
  }

  return prices;
};

// Generate price history for today (hourly)
export const generateTodayPriceHistory = (
  startPrice: number = 100,
  volatility: number = 0.005
): StockPrice[] => {
  const prices: StockPrice[] = [];
  let currentPrice = startPrice;

  const now = new Date();
  now.setHours(now.getHours(), 0, 0, 0);
  
  for (let i = 9; i <= 17; i++) {
    const date = new Date(now);
    date.setHours(i);
    
    // Add some random movement to the price
    const change = currentPrice * volatility * (Math.random() * 2 - 1);
    currentPrice += change;
    
    // Ensure price doesn't go negative
    currentPrice = Math.max(currentPrice, 10);
    
    prices.push({
      timestamp: date.toISOString(),
      price: parseFloat(currentPrice.toFixed(2)),
    });
  }

  return prices;
};

const priceHistory = generatePriceHistory();
const currentPrice = priceHistory[priceHistory.length - 1].price;
const previousPrice = priceHistory[priceHistory.length - 2].price;
const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;

export const mockStockData = {
  currentPrice: currentPrice,
  previousClose: previousPrice,
  dayHigh: Math.max(...priceHistory.slice(-24).map(p => p.price)),
  dayLow: Math.min(...priceHistory.slice(-24).map(p => p.price)),
  percentChange: parseFloat(percentChange.toFixed(2)),
  volume: 15000,
  marketCap: currentPrice * 1000000,
  priceHistory: priceHistory,
};

export const mockTransactions: Transaction[] = [
  {
    id: "t1",
    userId: "1",
    type: "buy",
    shares: 25,
    price: 95.2,
    timestamp: "2023-05-12T09:30:00Z",
  },
  {
    id: "t2",
    userId: "1",
    type: "sell",
    shares: 10,
    price: 98.5,
    timestamp: "2023-05-15T11:45:00Z",
    counterpartyId: "3",
  },
  {
    id: "t3",
    userId: "1",
    type: "grant",
    shares: 50,
    price: 0,
    timestamp: "2023-06-01T00:00:00Z",
  },
  {
    id: "t4",
    userId: "1",
    type: "buy",
    shares: 15,
    price: 102.75,
    timestamp: "2023-06-10T14:20:00Z",
  },
  {
    id: "t5",
    userId: "1",
    type: "sell",
    shares: 5,
    price: 105.3,
    timestamp: "2023-06-20T10:15:00Z",
    counterpartyId: "2",
  },
];

export const mockOrders: Order[] = [
  {
    id: "o1",
    userId: "2",
    type: "buy",
    shares: 20,
    price: 99.5,
    timestamp: "2023-06-25T09:00:00Z",
  },
  {
    id: "o2",
    userId: "3",
    type: "buy",
    shares: 10,
    price: 98.75,
    timestamp: "2023-06-25T09:15:00Z",
  },
  {
    id: "o3",
    userId: "1",
    type: "sell",
    shares: 15,
    price: 102.0,
    timestamp: "2023-06-25T09:30:00Z",
  },
  {
    id: "o4",
    userId: "2",
    type: "sell",
    shares: 30,
    price: 103.5,
    timestamp: "2023-06-25T10:00:00Z",
  },
];

export const mockNewsItems: NewsItem[] = [
  {
    id: "n1",
    title: "Quarterly Results Exceed Expectations",
    content: "The company has reported Q2 earnings that exceeded analysts' expectations, with revenue up 15% year-over-year.",
    timestamp: "2023-06-20T12:00:00Z",
    author: "Finance Team",
  },
  {
    id: "n2",
    title: "New Product Launch Announced",
    content: "The company will be launching a new flagship product next month, which is expected to significantly boost sales.",
    timestamp: "2023-06-18T10:30:00Z",
    author: "Product Team",
  },
  {
    id: "n3",
    title: "Employee Stock Grant Program Expanded",
    content: "The board has approved an expansion of the employee stock grant program, increasing total share allocation by 10%.",
    timestamp: "2023-06-15T14:45:00Z",
    author: "HR Department",
  },
];

// Mock current user for demo purposes
export const currentUser = mockUsers[0];
