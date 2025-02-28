
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NewsItem as NewsItemType } from "@/types";
import { format } from "date-fns";

interface NewsItemProps {
  item: NewsItemType;
}

const NewsItem: React.FC<NewsItemProps> = ({ item }) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer animate-scale-in">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.content}</p>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{item.author}</span>
          <span>{format(new Date(item.timestamp), "MMM d, yyyy")}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsItem;
