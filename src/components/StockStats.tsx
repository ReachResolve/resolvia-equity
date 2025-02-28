
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StockData } from "@/types";

interface StockStatsProps {
  stockData: StockData;
}

const StockStats: React.FC<StockStatsProps> = ({ stockData }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const stats = [
    { label: "Previous Close", value: formatNumber(stockData.previousClose) },
    { label: "Open", value: formatNumber(stockData.priceHistory[0]?.price || 0) },
    { label: "Day High", value: formatNumber(stockData.dayHigh) },
    { label: "Day Low", value: formatNumber(stockData.dayLow) },
    { label: "Volume", value: stockData.volume.toLocaleString() },
    { label: "Market Cap", value: formatNumber(stockData.marketCap) },
  ];

  return (
    <Card className="shadow-sm w-full animate-fade-in animation-delay-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="text-sm font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockStats;
