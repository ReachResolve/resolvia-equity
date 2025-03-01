
import React, { createContext, useState, useContext, useEffect } from "react";
import { StockData, Transaction, Order, NewsItem, Wallet } from "../types";
import { mockStockData, mockTransactions, mockOrders, mockNewsItems, generateTodayPriceHistory } from "../data/mockData";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StockContextType {
  stockData: StockData;
  transactions: Transaction[];
  orders: Order[];
  newsItems: NewsItem[];
  buyShares: (shares: number, price: number) => void;
  sellShares: (shares: number, price: number) => void;
  placeOrder: (type: "buy" | "sell", shares: number, price: number) => void;
  cancelOrder: (orderId: string) => void;
  isLoading: boolean;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [stockData, setStockData] = useState<StockData>(mockStockData);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(mockNewsItems);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stock data
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    loadData();

    // Simulate real-time price updates
    const interval = setInterval(() => {
      setStockData(prev => {
        const lastPrice = prev.currentPrice;
        const change = lastPrice * 0.001 * (Math.random() * 2 - 1);
        const newPrice = parseFloat((lastPrice + change).toFixed(2));
        const newPercentChange = parseFloat((((newPrice - prev.previousClose) / prev.previousClose) * 100).toFixed(2));
        
        // Add new price to history
        const now = new Date().toISOString();
        const updatedHistory = [...prev.priceHistory];
        
        // Only add a new point every minute to not flood the chart
        if (updatedHistory.length === 0 || 
            (new Date(now).getTime() - new Date(updatedHistory[updatedHistory.length - 1].timestamp).getTime()) > 60000) {
          updatedHistory.push({ timestamp: now, price: newPrice });
        } else {
          // Update the last point
          updatedHistory[updatedHistory.length - 1] = { timestamp: now, price: newPrice };
        }
        
        return {
          ...prev,
          currentPrice: newPrice,
          percentChange: newPercentChange,
          dayHigh: Math.max(prev.dayHigh, newPrice),
          dayLow: Math.min(prev.dayLow, newPrice),
          priceHistory: updatedHistory,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to update wallet shares
  const updateWalletShares = async (walletId: string, shareChange: number) => {
    if (!walletId) {
      toast.error("Wallet not found");
      return false;
    }

    try {
      // Get current wallet data
      const { data: wallet, error: fetchError } = await supabase
        .from('wallets')
        .select('shares')
        .eq('id', walletId)
        .single();

      if (fetchError) {
        console.error("Error fetching wallet:", fetchError);
        throw fetchError;
      }

      // Calculate new shares amount (ensure it doesn't go below 0)
      const newShares = Math.max(0, (wallet?.shares || 0) + shareChange);

      // Update wallet
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ shares: newShares })
        .eq('id', walletId);

      if (updateError) {
        console.error("Error updating wallet:", updateError);
        throw updateError;
      }

      return true;
    } catch (error) {
      console.error("Wallet update error:", error);
      return false;
    }
  };

  const buyShares = async (shares: number, price: number) => {
    if (!user) {
      toast.error("You must be logged in to buy shares");
      return;
    }

    if (!user.walletId) {
      toast.error("Wallet not found");
      return;
    }

    if (user.balance < shares * price) {
      toast.error("Insufficient funds");
      return;
    }

    try {
      // Create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: "buy",
          shares,
          price,
          sender_wallet_id: null,
          receiver_wallet_id: user.walletId,
          credited_debited: "credited"
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update the wallet shares
      const walletUpdated = await updateWalletShares(user.walletId, shares);
      if (!walletUpdated) throw new Error("Failed to update wallet");

      // Update the user's balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ balance: user.balance - (shares * price) })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Add the transaction to local state
      if (transaction) {
        setTransactions(prev => [transaction as Transaction, ...prev]);
      }

      toast.success(`Successfully purchased ${shares} shares at $${price}`);
    } catch (error) {
      console.error("Buy shares error:", error);
      toast.error("Failed to complete purchase");
    }
  };

  const sellShares = async (shares: number, price: number) => {
    if (!user) {
      toast.error("You must be logged in to sell shares");
      return;
    }

    if (!user.walletId) {
      toast.error("Wallet not found");
      return;
    }

    if (user.sharesOwned < shares) {
      toast.error("Insufficient shares");
      return;
    }

    try {
      // Create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: "sell",
          shares,
          price,
          sender_wallet_id: user.walletId,
          receiver_wallet_id: null,
          credited_debited: "debited"
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update the wallet shares
      const walletUpdated = await updateWalletShares(user.walletId, -shares);
      if (!walletUpdated) throw new Error("Failed to update wallet");

      // Update the user's balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ balance: user.balance + (shares * price) })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Add the transaction to local state
      if (transaction) {
        setTransactions(prev => [transaction as Transaction, ...prev]);
      }

      toast.success(`Successfully sold ${shares} shares at $${price}`);
    } catch (error) {
      console.error("Sell shares error:", error);
      toast.error("Failed to complete sale");
    }
  };

  const placeOrder = (type: "buy" | "sell", shares: number, price: number) => {
    if (!user) {
      toast.error("You must be logged in to place orders");
      return;
    }

    if (type === "buy" && user.balance < shares * price) {
      toast.error("Insufficient funds to place buy order");
      return;
    }

    if (type === "sell" && user.sharesOwned < shares) {
      toast.error("Insufficient shares to place sell order");
      return;
    }

    const newOrder: Order = {
      id: `o${Date.now()}`,
      userId: user.id,
      type,
      shares,
      price,
      timestamp: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} order placed for ${shares} shares at $${price}`);
  };

  const cancelOrder = (orderId: string) => {
    if (!user) {
      toast.error("You must be logged in to cancel orders");
      return;
    }

    const orderToCancel = orders.find(order => order.id === orderId);
    
    if (!orderToCancel) {
      toast.error("Order not found");
      return;
    }

    if (orderToCancel.userId !== user.id) {
      toast.error("You can only cancel your own orders");
      return;
    }

    setOrders(prev => prev.filter(order => order.id !== orderId));
    toast.success("Order cancelled successfully");
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
