
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { format } from "date-fns";
import { ArrowUp, ArrowDown, Gift } from "lucide-react";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowDown className="h-4 w-4 text-success-600" />;
      case "sell":
        return <ArrowUp className="h-4 w-4 text-danger-600" />;
      case "grant":
        return <Gift className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  // Get transaction description based on type
  const getTransactionDescription = (transaction: Transaction) => {
    switch (transaction.type) {
      case "buy":
        return `Purchased ${transaction.shares} shares at $${transaction.price.toFixed(2)}`;
      case "sell":
        return `Sold ${transaction.shares} shares at $${transaction.price.toFixed(2)}`;
      case "grant":
        return `Received ${transaction.shares} shares as compensation`;
      default:
        return "";
    }
  };

  return (
    <Card className="shadow-sm w-full animate-fade-in animation-delay-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {sortedTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{getTransactionDescription(transaction)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    transaction.type === "buy" ? "text-danger-600" : 
                    transaction.type === "sell" ? "text-success-600" : ""
                  }`}>
                    {transaction.type === "buy" ? "-" : transaction.type === "sell" ? "+" : ""}
                    ${(transaction.shares * transaction.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.shares} shares
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
