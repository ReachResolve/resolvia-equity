
import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "../types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Improved session handling
  useEffect(() => {
    // Check for active session on load
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await getUserProfile(session);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("Error retrieving your session. Please log in again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setIsLoading(true);
        
        if (event === 'SIGNED_IN' && session) {
          await getUserProfile(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Extract profile fetching logic to reuse it
  const getUserProfile = async (session: any) => {
    try {
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, wallets:wallet_id(*)')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }
      
      if (profile) {
        // Run a separate query to get the user's balance from a custom view or function
        // For now, let's use a default value
        const defaultBalance = 10000;

        const userData: User = {
          id: profile.id,
          name: profile.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar: profile["Profile Pic"] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
          role: (profile.role as 'employee' | 'admin') || 'employee',
          sharesOwned: profile.wallets?.shares || 0,
          balance: defaultBalance, // Using default balance temporarily
          joinedAt: profile.joined_at || new Date().toISOString(),
          walletId: profile.wallet_id,
        };
        
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Don't clear the user here as it could cause unnecessary logouts
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      if (data?.user) {
        toast.success("Login successful!");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred during login");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
      } else {
        setUser(null);
        toast.info("Logged out successfully");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
