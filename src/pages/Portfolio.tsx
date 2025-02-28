
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useStock } from "@/context/StockContext";
import Header from "@/components/Header";
import UserPortfolio from "@/components/UserPortfolio";
import TransactionHistory from "@/components/TransactionHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowUp, ArrowDown, DollarSign } from "lucide-react";

const Portfolio = () => {
  const { user } = useAuth();
  const { stockData, transactions, isLoading } = useStock();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter transactions for current user
  const userTransactions = transactions.filter(
    transaction => transaction.userId === user.id
  );

  // Calculate value of shares
  const sharesValue = user.sharesOwned * stockData.currentPrice;
  const totalValue = sharesValue + user.balance;

  // Calculate earnings from transactions
  const buyTransactions = userTransactions.filter(t => t.type === "buy");
  const sellTransactions = userTransactions.filter(t => t.type === "sell");
  const grantTransactions = userTransactions.filter(t => t.type === "grant");
  
  const totalSpent = buyTransactions.reduce((sum, t) => sum + (t.shares * t.price), 0);
  const totalSold = sellTransactions.reduce((sum, t) => sum + (t.shares * t.price), 0);
  const totalGrants = grantTransactions.reduce((sum, t) => sum + t.shares, 0);
  
  const unrealizedGains = sharesValue - totalSpent + totalSold;
  const percentGain = totalSpent > 0 ? (unrealizedGains / totalSpent) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-screen-xl mx-auto py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in">Portfolio</h1>
          <p className="text-muted-foreground animate-fade-in">Manage your investments</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <UserPortfolio />
          </div>
          <div className="lg:col-span-2">
            <Card className="shadow-sm w-full h-full animate-fade-in animation-delay-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Portfolio Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Total Value</span>
                    </div>
                    <p className="text-2xl font-semibold">${totalValue.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Shares Value</span>
                    </div>
                    <p className="text-2xl font-semibold">${sharesValue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user.sharesOwned} shares</p>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Cash Balance</span>
                    </div>
                    <p className="text-2xl font-semibold">${user.balance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Available for trading</p>
                  </div>
                  
                  <div className={`bg-muted rounded-lg p-4 ${unrealizedGains >= 0 ? 'bg-success-50' : 'bg-danger-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${unrealizedGains >= 0 ? 'bg-success-100' : 'bg-danger-100'}`}>
                        {unrealizedGains >= 0 ? (
                          <ArrowUp className="h-4 w-4 text-success-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-danger-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium">Total Return</span>
                    </div>
                    <p className={`text-2xl font-semibold ${unrealizedGains >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                      ${Math.abs(unrealizedGains).toFixed(2)}
                    </p>
                    <p className={`text-xs ${unrealizedGains >= 0 ? 'text-success-700' : 'text-danger-700'} mt-1`}>
                      {unrealizedGains >= 0 ? '+' : '-'}{Math.abs(percentGain).toFixed(2)}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Portfolio Activity</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm border-b border-border pb-2">
                      <span className="text-muted-foreground">Joined on</span>
                      <span className="font-medium">{format(new Date(user.joinedAt), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-border pb-2">
                      <span className="text-muted-foreground">Shares purchased</span>
                      <span className="font-medium">{buyTransactions.reduce((sum, t) => sum + t.shares, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-border pb-2">
                      <span className="text-muted-foreground">Shares sold</span>
                      <span className="font-medium">{sellTransactions.reduce((sum, t) => sum + t.shares, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shares granted</span>
                      <span className="font-medium">{totalGrants}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mb-6">
          <TransactionHistory transactions={userTransactions} />
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
