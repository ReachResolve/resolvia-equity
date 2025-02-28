
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useStock } from "@/context/StockContext";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

const UserPortfolio: React.FC = () => {
  const { user } = useAuth();
  const { stockData } = useStock();
  
  useEffect(() => {
    // This effect will refresh the user data when stock price changes
    const refreshUserData = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        // User data is refreshed via AuthContext subscription
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };
    
    // The refreshUserData function will be triggered every time stockData.currentPrice changes
  }, [user, stockData.currentPrice]);
  
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
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPortfolio;
