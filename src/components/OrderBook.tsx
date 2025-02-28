
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { useStock } from "@/context/StockContext";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface OrderBookProps {
  orders: Order[];
}

const OrderBook: React.FC<OrderBookProps> = ({ orders }) => {
  const { cancelOrder } = useStock();
  const { user } = useAuth();

  // Separate buy and sell orders
  const buyOrders = orders.filter(order => order.type === "buy")
    .sort((a, b) => b.price - a.price); // Sort by price descending
    
  const sellOrders = orders.filter(order => order.type === "sell")
    .sort((a, b) => a.price - b.price); // Sort by price ascending

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "MMM d, h:mm a");
  };

  return (
    <Card className="shadow-sm w-full animate-fade-in animation-delay-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Order Book</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-sm mb-2 text-danger-600">Sell Orders</h3>
            {sellOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-2 text-sm">No sell orders</p>
            ) : (
              <div className="space-y-2">
                {sellOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                    <div>
                      <p className="text-sm font-medium">{order.shares} shares at ${order.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(order.timestamp)}</p>
                    </div>
                    {user && order.userId === user.id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => cancelOrder(order.id)}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-2 text-success-600">Buy Orders</h3>
            {buyOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-2 text-sm">No buy orders</p>
            ) : (
              <div className="space-y-2">
                {buyOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                    <div>
                      <p className="text-sm font-medium">{order.shares} shares at ${order.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(order.timestamp)}</p>
                    </div>
                    {user && order.userId === user.id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => cancelOrder(order.id)}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderBook;
