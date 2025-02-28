
import React, { createContext, useState, useContext, useEffect } from "react";
import { StockData, Transaction, Order, NewsItem, StockPrice } from "../types";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StockContextType {
  stockData: StockData;
  transactions: Transaction[];
  orders: Order[];
  newsItems: NewsItem[];
  buyShares: (shares: number, price: number) => Promise<boolean>;
  sellShares: (shares: number, price: number) => Promise<boolean>;
  placeOrder: (type: "buy" | "sell", shares: number, price: number) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  isLoading: boolean;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [stockData, setStockData] = useState<StockData>({
    currentPrice: 0,
    previousClose: 0,
    dayHigh: 0,
    dayLow: 0,
    percentChange: 0,
    volume: 0,
    marketCap: 1000000,
    priceHistory: []
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial stock data and set up realtime listener
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch stock prices
        const { data: pricesData, error: pricesError } = await supabase
          .from('stock_prices')
          .select('*')
          .order('timestamp', { ascending: true });
        
        if (pricesError) {
          console.error('Error fetching stock prices:', pricesError);
        } else if (pricesData && pricesData.length > 0) {
          const priceHistory: StockPrice[] = pricesData.map(item => ({
            timestamp: item.timestamp,
            price: parseFloat(item.price)
          }));
          
          const currentPrice = priceHistory[priceHistory.length - 1].price;
          const previousClose = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].price : currentPrice;
          
          // Calculate day high and low from today's prices
          const today = new Date().toISOString().split('T')[0];
          const todayPrices = priceHistory.filter(item => 
            new Date(item.timestamp).toISOString().split('T')[0] === today
          );
          
          const dayHigh = todayPrices.length > 0 
            ? Math.max(...todayPrices.map(item => item.price))
            : currentPrice;
            
          const dayLow = todayPrices.length > 0 
            ? Math.min(...todayPrices.map(item => item.price))
            : currentPrice;
          
          const percentChange = ((currentPrice - previousClose) / previousClose) * 100;
          
          setStockData({
            currentPrice,
            previousClose,
            dayHigh,
            dayLow,
            percentChange,
            volume: 1000, // This could be calculated from transactions
            marketCap: 1000000, // This could be a more complex calculation
            priceHistory
          });
        }
        
        // Fetch news items
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('*')
          .order('timestamp', { ascending: false });
        
        if (newsError) {
          console.error('Error fetching news:', newsError);
        } else if (newsData) {
          const formattedNews: NewsItem[] = newsData.map(item => ({
            id: item.id,
            title: item.title,
            content: item.content,
            author: item.author,
            timestamp: item.timestamp
          }));
          
          setNewsItems(formattedNews);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchInitialData:', error);
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
    
    // Subscribe to realtime stock price updates
    const stockPricesSubscription = supabase
      .channel('stock_prices_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'stock_prices' }, 
        (payload) => {
          const newPrice = {
            timestamp: payload.new.timestamp,
            price: parseFloat(payload.new.price)
          };
          
          setStockData(prev => {
            const updatedHistory = [...prev.priceHistory, newPrice];
            const currentPrice = newPrice.price;
            const percentChange = ((currentPrice - prev.previousClose) / prev.previousClose) * 100;
            
            return {
              ...prev,
              currentPrice,
              percentChange,
              dayHigh: Math.max(prev.dayHigh, currentPrice),
              dayLow: Math.min(prev.dayLow, currentPrice),
              priceHistory: updatedHistory
            };
          });
        }
      )
      .subscribe();
      
    // Subscribe to realtime news updates
    const newsSubscription = supabase
      .channel('news_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'news' }, 
        (payload) => {
          const newItem: NewsItem = {
            id: payload.new.id,
            title: payload.new.title,
            content: payload.new.content,
            author: payload.new.author,
            timestamp: payload.new.timestamp
          };
          
          setNewsItems(prev => [newItem, ...prev]);
        }
      )
      .subscribe();
    
    // Simulate price updates every 30 seconds
    const interval = setInterval(async () => {
      if (!isLoading) {
        try {
          const currentPrice = stockData.currentPrice;
          // Generate a random price change within ±2%
          const change = currentPrice * 0.02 * (Math.random() * 2 - 1);
          const newPrice = parseFloat((currentPrice + change).toFixed(2));
          
          // Insert the new price into the database - Here we need to use number type
          await supabase
            .from('stock_prices')
            .insert({ price: newPrice });
        } catch (error) {
          console.error('Error updating stock price:', error);
        }
      }
    }, 30000);
    
    return () => {
      clearInterval(interval);
      stockPricesSubscription.unsubscribe();
      newsSubscription.unsubscribe();
    };
  }, [isLoading]);
  
  // Fetch user-specific data when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setTransactions([]);
        setOrders([]);
        return;
      }
      
      try {
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });
        
        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError);
        } else if (transactionsData) {
          const formattedTransactions: Transaction[] = transactionsData.map(item => ({
            id: item.id,
            userId: item.user_id,
            type: item.type as 'buy' | 'sell' | 'grant',
            shares: item.shares,
            price: parseFloat(item.price),
            timestamp: item.timestamp,
            counterpartyId: item.counterparty_id
          }));
          
          setTransactions(formattedTransactions);
        }
        
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'pending')
          .order('timestamp', { ascending: false });
        
        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
        } else if (ordersData) {
          const formattedOrders: Order[] = ordersData.map(item => ({
            id: item.id,
            userId: item.user_id,
            type: item.type as 'buy' | 'sell',
            shares: item.shares,
            price: parseFloat(item.price),
            timestamp: item.timestamp
          }));
          
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    };
    
    fetchUserData();
    
    // Subscribe to realtime transaction and order updates
    if (user) {
      const transactionsSubscription = supabase
        .channel('transactions_channel')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, 
          (payload) => {
            const newTransaction: Transaction = {
              id: payload.new.id,
              userId: payload.new.user_id,
              type: payload.new.type as 'buy' | 'sell' | 'grant',
              shares: payload.new.shares,
              price: parseFloat(payload.new.price),
              timestamp: payload.new.timestamp,
              counterpartyId: payload.new.counterparty_id
            };
            
            setTransactions(prev => [newTransaction, ...prev]);
          }
        )
        .subscribe();
      
      const ordersSubscription = supabase
        .channel('orders_channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'orders' }, 
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newOrder: Order = {
                id: payload.new.id,
                userId: payload.new.user_id,
                type: payload.new.type as 'buy' | 'sell',
                shares: payload.new.shares,
                price: parseFloat(payload.new.price),
                timestamp: payload.new.timestamp
              };
              
              if (payload.new.status === 'pending') {
                setOrders(prev => [newOrder, ...prev]);
              }
            } else if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
              // Remove orders that are no longer pending
              setOrders(prev => prev.filter(order => order.id !== payload.old.id));
            }
          }
        )
        .subscribe();
      
      return () => {
        transactionsSubscription.unsubscribe();
        ordersSubscription.unsubscribe();
      };
    }
  }, [user]);

  const buyShares = async (shares: number, price: number): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to buy shares");
      return false;
    }

    if (user.balance < shares * price) {
      toast.error("Insufficient funds");
      return false;
    }

    try {
      // Begin transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'buy',
          shares,
          price
        })
        .select()
        .single();
      
      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        toast.error("Failed to complete transaction");
        return false;
      }
      
      // Update user profile (decrease balance, increase shares)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          balance: user.balance - (shares * price),
          shares_owned: user.sharesOwned + shares
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error("Failed to update your balance");
        return false;
      }
      
      toast.success(`Successfully purchased ${shares} shares at $${price}`);
      return true;
    } catch (error) {
      console.error('Error in buyShares:', error);
      toast.error("An unexpected error occurred");
      return false;
    }
  };

  const sellShares = async (shares: number, price: number): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to sell shares");
      return false;
    }

    if (user.sharesOwned < shares) {
      toast.error("Insufficient shares");
      return false;
    }

    try {
      // Begin transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'sell',
          shares,
          price
        })
        .select()
        .single();
      
      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        toast.error("Failed to complete transaction");
        return false;
      }
      
      // Update user profile (increase balance, decrease shares)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          balance: user.balance + (shares * price),
          shares_owned: user.sharesOwned - shares
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error("Failed to update your balance");
        return false;
      }
      
      toast.success(`Successfully sold ${shares} shares at $${price}`);
      return true;
    } catch (error) {
      console.error('Error in sellShares:', error);
      toast.error("An unexpected error occurred");
      return false;
    }
  };

  const placeOrder = async (type: "buy" | "sell", shares: number, price: number): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to place orders");
      return false;
    }

    if (type === "buy" && user.balance < shares * price) {
      toast.error("Insufficient funds to place buy order");
      return false;
    }

    if (type === "sell" && user.sharesOwned < shares) {
      toast.error("Insufficient shares to place sell order");
      return false;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          type,
          shares,
          price
        });
      
      if (error) {
        console.error('Error placing order:', error);
        toast.error("Failed to place order");
        return false;
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} order placed for ${shares} shares at $${price}`);
      return true;
    } catch (error) {
      console.error('Error in placeOrder:', error);
      toast.error("An unexpected error occurred");
      return false;
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to cancel orders");
      return false;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error cancelling order:', error);
        toast.error("Failed to cancel order");
        return false;
      }
      
      toast.success("Order cancelled successfully");
      return true;
    } catch (error) {
      console.error('Error in cancelOrder:', error);
      toast.error("An unexpected error occurred");
      return false;
    }
  };

  return (
    <StockContext.Provider value={{ 
      stockData, 
      transactions, 
      orders, 
      newsItems, 
      buyShares, 
      sellShares, 
      placeOrder, 
      cancelOrder, 
      isLoading 
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error("useStock must be used within a StockProvider");
  }
  return context;
};
