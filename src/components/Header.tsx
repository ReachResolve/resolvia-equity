
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart2,
  TrendingUp,
  Newspaper,
  Briefcase,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useStock } from "@/context/StockContext";

const Header = () => {
  const { user, logout } = useAuth();
  const { stockData } = useStock();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <BarChart2 className="w-4 h-4 mr-2" /> },
    { name: "Trade", path: "/trade", icon: <TrendingUp className="w-4 h-4 mr-2" /> },
    { name: "Portfolio", path: "/portfolio", icon: <Briefcase className="w-4 h-4 mr-2" /> },
    { name: "News", path: "/news", icon: <Newspaper className="w-4 h-4 mr-2" /> },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-foreground flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-primary" />
              <span>ReachResolve Equity</span>
            </Link>
            {user && (
              <div className="ml-8 hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center mr-2">
                  <span className="text-sm font-medium mr-1">Stock:</span>
                  <span className="text-sm font-bold">${stockData.currentPrice.toFixed(2)}</span>
                  <span
                    className={`text-xs ml-1 ${
                      stockData.percentChange >= 0
                        ? "text-success-600"
                        : "text-danger-600"
                    }`}
                  >
                    {stockData.percentChange >= 0 ? "+" : ""}
                    {stockData.percentChange.toFixed(2)}%
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {navItems.map((item) => (
                      <DropdownMenuItem
                        key={item.path}
                        className="md:hidden cursor-pointer"
                        onClick={() => navigate(item.path)}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          {item.name}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {navItems.length > 0 && <DropdownMenuSeparator className="md:hidden" />}
                    <DropdownMenuItem
                      className="cursor-pointer text-danger-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-foreground"
                  >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center text-sm font-medium p-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="flex items-center justify-start text-danger-600 p-2 rounded-md"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Log out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
