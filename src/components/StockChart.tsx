
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { StockPrice } from "@/types";
import { format } from "date-fns";

interface StockChartProps {
  priceHistory: StockPrice[];
  currentPrice: number;
  percentChange: number;
}

const StockChart: React.FC<StockChartProps> = ({ 
  priceHistory, 
  currentPrice, 
  percentChange 
}) => {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1M");
  
  const formatData = () => {
    const now = new Date();
    let filteredData = [...priceHistory];
    
    switch (timeframe) {
      case "1D":
        filteredData = priceHistory.filter(item => {
          const date = new Date(item.timestamp);
          return date.getDate() === now.getDate() && 
                 date.getMonth() === now.getMonth() && 
                 date.getFullYear() === now.getFullYear();
        });
        break;
      case "1W":
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredData = priceHistory.filter(item => new Date(item.timestamp) >= oneWeekAgo);
        break;
      case "1M":
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredData = priceHistory.filter(item => new Date(item.timestamp) >= oneMonthAgo);
        break;
      case "3M":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filteredData = priceHistory.filter(item => new Date(item.timestamp) >= threeMonthsAgo);
        break;
      case "1Y":
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        filteredData = priceHistory.filter(item => new Date(item.timestamp) >= oneYearAgo);
        break;
    }
    
    // Ensure we have at least 2 data points for the chart
    if (filteredData.length < 2) {
      return priceHistory.slice(-2);
    }
    
    return filteredData;
  };

  const chartData = formatData();
  const isPositive = percentChange >= 0;

  // Format date for display in tooltip or axis
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    
    switch (timeframe) {
      case "1D":
        return format(date, "HH:mm");
      case "1W":
        return format(date, "EEE");
      case "1M":
        return format(date, "dd MMM");
      default:
        return format(date, "dd MMM yyyy");
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-4 py-2 text-sm">
          <p className="font-medium">{formatDate(label)}</p>
          <p className="text-sm">
            Price: <span className="font-medium">{formatPrice(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full shadow-sm animate-fade-in">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{formatPrice(currentPrice)}</span>
              <span className={`text-sm font-medium ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Company Stock</p>
          </div>
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
            <TabsList className="grid grid-cols-5 h-8">
              <TabsTrigger value="1D" className="text-xs">1D</TabsTrigger>
              <TabsTrigger value="1W" className="text-xs">1W</TabsTrigger>
              <TabsTrigger value="1M" className="text-xs">1M</TabsTrigger>
              <TabsTrigger value="3M" className="text-xs">3M</TabsTrigger>
              <TabsTrigger value="1Y" className="text-xs">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']} 
                hide 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? "#10B981" : "#EF4444"} 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)" 
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;
