
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useStock } from "@/context/StockContext";
import Header from "@/components/Header";
import StockChart from "@/components/StockChart";
import StockStats from "@/components/StockStats";
import TransactionHistory from "@/components/TransactionHistory";
import UserPortfolio from "@/components/UserPortfolio";
import NewsItem from "@/components/NewsItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { user } = useAuth();
  const { stockData, transactions, newsItems, isLoading } = useStock();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter transactions for current user
  const userTransactions = transactions.filter(
    transaction => transaction.userId === user?.id
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-screen-xl mx-auto py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in">Dashboard</h1>
          <p className="text-muted-foreground animate-fade-in">Welcome back, {user?.name}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <StockChart 
              priceHistory={stockData.priceHistory} 
              currentPrice={stockData.currentPrice}
              percentChange={stockData.percentChange}
            />
          </div>
          <div>
            <UserPortfolio />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <StockStats stockData={stockData} />
          </div>
          <div className="lg:col-span-2">
            <TransactionHistory transactions={userTransactions} />
          </div>
        </div>
        
        <div className="mb-6">
          <Card className="shadow-sm w-full animate-fade-in animation-delay-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Latest News</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsItems.map((item) => (
                  <NewsItem key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
