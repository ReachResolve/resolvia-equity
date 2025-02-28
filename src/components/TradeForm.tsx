
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useStock } from "@/context/StockContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const TradeForm: React.FC = () => {
  const { stockData, buyShares, sellShares, placeOrder } = useStock();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"market" | "limit">("market");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState<string>("1");
  const [limitPrice, setLimitPrice] = useState<string>(stockData.currentPrice.toFixed(2));
  const [total, setTotal] = useState<number>(0);

  // Update the total cost/proceeds whenever inputs change
  useEffect(() => {
    const sharesNum = parseFloat(shares) || 0;
    const price = activeTab === "market" ? stockData.currentPrice : parseFloat(limitPrice) || 0;
    setTotal(sharesNum * price);
  }, [shares, limitPrice, activeTab, stockData.currentPrice]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "market" | "limit");
  };

  const handleTradeTypeChange = (value: string) => {
    setTradeType(value as "buy" | "sell");
  };

  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and limit to positive values
    const value = e.target.value.replace(/[^0-9]/g, "");
    setShares(value === "" ? "" : value);
  };

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "");
    
    // Ensure only one decimal point
    const decimalCount = value.split(".").length - 1;
    if (decimalCount <= 1) {
      setLimitPrice(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to trade");
      return;
    }

    const sharesNum = parseInt(shares);
    if (isNaN(sharesNum) || sharesNum <= 0) {
      toast.error("Please enter a valid number of shares");
      return;
    }

    if (activeTab === "market") {
      if (tradeType === "buy") {
        buyShares(sharesNum, stockData.currentPrice);
      } else {
        sellShares(sharesNum, stockData.currentPrice);
      }
    } else {
      // Limit order
      const price = parseFloat(limitPrice);
      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price");
        return;
      }
      
      placeOrder(tradeType, sharesNum, price);
    }
  };

  return (
    <Card className="shadow-sm w-full animate-fade-in animation-delay-100">
      <CardHeader>
        <CardTitle className="text-lg">Trade Shares</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Order Type</Label>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="limit">Limit</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label>Trade Type</Label>
            <Tabs value={tradeType} onValueChange={handleTradeTypeChange} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shares">Number of Shares</Label>
            <Input
              id="shares"
              type="text"
              placeholder="Enter number of shares"
              value={shares}
              onChange={handleSharesChange}
            />
          </div>

          {activeTab === "limit" && (
            <div className="space-y-2">
              <Label htmlFor="limitPrice">Limit Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="limitPrice"
                  type="text"
                  className="pl-6"
                  placeholder="0.00"
                  value={limitPrice}
                  onChange={handleLimitPriceChange}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Estimated {tradeType === "buy" ? "Cost" : "Proceeds"}</Label>
            <p className="text-lg font-medium">${total.toFixed(2)}</p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              variant={tradeType === "buy" ? "default" : "outline"}
            >
              {activeTab === "market" ? `${tradeType === "buy" ? "Buy" : "Sell"} at Market Price` : `Place ${tradeType === "buy" ? "Buy" : "Sell"} Limit Order`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TradeForm;
