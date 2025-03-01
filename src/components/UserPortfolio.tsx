
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useStock } from "@/context/StockContext";
import { Progress } from "@/components/ui/progress";

const UserPortfolio: React.FC = () => {
  const { user } = useAuth();
  const { stockData } = useStock();
  
  if (!user) return null;
  
  const sharesValue = user.sharesOwned * stockData.currentPrice;
  const totalValue = sharesValue + user.balance;
  const sharesPercentage = (sharesValue / totalValue) * 100;
  const cashPercentage = (user.balance / totalValue) * 100;

  return (
    <Card className="shadow-sm w-full animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Total Value</span>
              <span className="text-sm font-semibold">${totalValue.toFixed(2)}</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Company Shares</span>
                <span className="text-sm">${sharesValue.toFixed(2)}</span>
              </div>
              <Progress value={sharesPercentage} className="h-2 bg-muted" />
              <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                <span>{user.sharesOwned} shares</span>
                <span>{sharesPercentage.toFixed(1)}%</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Cash Balance</span>
                <span className="text-sm">${user.balance.toFixed(2)}</span>
              </div>
              <Progress value={cashPercentage} className="h-2 bg-muted" />
              <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                <span>Available for trading</span>
                <span>{cashPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {user.walletId && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium mb-2">Wallet Information</p>
              <div className="text-xs text-muted-foreground">
                <p>Wallet ID: {user.walletId.substring(0, 8)}...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPortfolio;
