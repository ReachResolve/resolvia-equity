
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-border py-3 px-4 sm:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 animate-fade-in">
      <div className="flex justify-between items-center max-w-screen-xl mx-auto">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-semibold text-gradient">ShareTradeHub</Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors grow-underline">Dashboard</Link>
          <Link to="/trade" className="text-sm font-medium hover:text-primary transition-colors grow-underline">Trade</Link>
          <Link to="/portfolio" className="text-sm font-medium hover:text-primary transition-colors grow-underline">Portfolio</Link>
          <Link to="/news" className="text-sm font-medium hover:text-primary transition-colors grow-underline">News</Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <div className="relative group">
                <Avatar className="h-8 w-8 cursor-pointer transition-transform group-hover:scale-105">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-border overflow-hidden scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 origin-top-right z-50">
                  <div className="p-3">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="border-t border-border">
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">Settings</Link>
                    <button 
                      onClick={logout} 
                      className="block w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-muted transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
