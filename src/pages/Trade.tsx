
import React from "react";
import { useStock } from "@/context/StockContext";
import Header from "@/components/Header";
import StockChart from "@/components/StockChart";
import TradeForm from "@/components/TradeForm";
import OrderBook from "@/components/OrderBook";

const Trade = () => {
  const { stockData, orders, isLoading } = useStock();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading trade page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-screen-xl mx-auto py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in">Trade</h1>
          <p className="text-muted-foreground animate-fade-in">Buy and sell company shares</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StockChart 
              priceHistory={stockData.priceHistory} 
              currentPrice={stockData.currentPrice}
              percentChange={stockData.percentChange}
            />
          </div>
          <div>
            <TradeForm />
          </div>
        </div>
        
        <div className="mt-6">
          <OrderBook orders={orders} />
        </div>
      </main>
    </div>
  );
};

export default Trade;
