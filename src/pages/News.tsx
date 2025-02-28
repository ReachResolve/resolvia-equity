
import React from "react";
import { useStock } from "@/context/StockContext";
import Header from "@/components/Header";
import NewsItem from "@/components/NewsItem";
import { Card, CardContent } from "@/components/ui/card";

const News = () => {
  const { newsItems, isLoading } = useStock();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading news...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-screen-xl mx-auto py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in">Company News</h1>
          <p className="text-muted-foreground animate-fade-in">Stay updated with the latest company announcements</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {newsItems.map((item) => (
            <div key={item.id} className="animate-fade-in">
              <NewsItem item={item} />
            </div>
          ))}
        </div>
        
        <div className="mt-10 mb-6 animate-fade-in animation-delay-300">
          <Card className="shadow-sm w-full bg-muted/50">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Stay Informed</h2>
              <p className="text-muted-foreground mb-4">
                Subscribe to our newsletter to receive company updates directly in your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" 
                />
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring bg-primary text-primary-foreground h-10 px-4 py-2">
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default News;
