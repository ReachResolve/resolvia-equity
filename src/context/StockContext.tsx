import React, { createContext, useState, useContext, useEffect } from "react";
import { StockData, Transaction, Order, NewsItem } from "../types";
import { mockStockData, mockTransactions, mockOrders, mockNewsItems } from "../data/mockData";
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
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    loadData();

    const interval = setInterval(() => {
      setStockData(prev => {
        const lastPrice = prev.currentPrice;
        const change = lastPrice * 0.001 * (Math.random() * 2 - 1);
        const newPrice = parseFloat((lastPrice + change).toFixed(2));
        const newPercentChange = parseFloat((((newPrice - prev.previousClose) / prev.previousClose) * 100).toFixed(2));
        
        const now = new Date().toISOString();
        const updatedHistory = [...prev.priceHistory];
        
        if (updatedHistory.length === 0 || 
            (new Date(now).getTime() - new Date(updatedHistory[updatedHistory.length - 1].timestamp).getTime()) > 60000) {
          updatedHistory.push({ timestamp: now, price: newPrice });
        } else {
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

  const updateWalletShares = async (walletId: string, shareChange: number) => {
    if (!walletId) {
      toast.error("Wallet not found");
      return false;
    }

    try {
      const { data: wallet, error: fetchError } = await supabase
        .from('wallets')
        .select('shares')
        .eq('"Wallet id"', walletId)
        .single();

      if (fetchError) {
        console.error("Error fetching wallet:", fetchError);
        throw fetchError;
      }

      const newShares = Math.max(0, (wallet?.shares || 0) + shareChange);

      const { error: updateError } = await supabase
        .from('wallets')
        .update({ shares: newShares })
        .eq('"Wallet id"', walletId);

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

      const walletUpdated = await updateWalletShares(user.walletId, shares);
      if (!walletUpdated) throw new Error("Failed to update wallet");

      if (transaction) {
        const formattedTransaction: Transaction = {
          id: transaction.id,
          userId: transaction.user_id,
          user_id: transaction.user_id,
          type: transaction.type as 'buy' | 'sell' | 'grant',
          shares: transaction.shares,
          price: transaction.price,
          timestamp: transaction.timestamp,
          counterpartyId: transaction.counterparty_id,
          counterparty_id: transaction.counterparty_id,
          senderWalletId: transaction.sender_wallet_id,
          sender_wallet_id: transaction.sender_wallet_id,
          receiverWalletId: transaction.receiver_wallet_id,
          receiver_wallet_id: transaction.receiver_wallet_id,
          creditedDebited: transaction.credited_debited as 'credited' | 'debited',
          credited_debited: transaction.credited_debited
        };
        setTransactions(prev => [formattedTransaction, ...prev]);
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

      const walletUpdated = await updateWalletShares(user.walletId, -shares);
      if (!walletUpdated) throw new Error("Failed to update wallet");

      if (transaction) {
        const formattedTransaction: Transaction = {
          id: transaction.id,
          userId: transaction.user_id,
          user_id: transaction.user_id,
          type: transaction.type as 'buy' | 'sell' | 'grant',
          shares: transaction.shares,
          price: transaction.price,
          timestamp: transaction.timestamp,
          counterpartyId: transaction.counterparty_id,
          counterparty_id: transaction.counterparty_id,
          senderWalletId: transaction.sender_wallet_id,
          sender_wallet_id: transaction.sender_wallet_id,
          receiverWalletId: transaction.receiver_wallet_id,
          receiver_wallet_id: transaction.receiver_wallet_id,
          creditedDebited: transaction.credited_debited as 'credited' | 'debited',
          credited_debited: transaction.credited_debited
        };
        setTransactions(prev => [formattedTransaction, ...prev]);
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
