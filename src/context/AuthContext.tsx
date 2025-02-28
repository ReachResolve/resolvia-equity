
import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "../types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          role: data.role as 'employee' | 'admin',
          sharesOwned: data.shares_owned,
          balance: data.balance,
          joinedAt: data.joined_at
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Check for session on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsLoading(true);
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
          }
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setUser(profile);
          toast.success("Login successful!");
          return true;
        }
      }
      
      toast.error("Failed to fetch user profile");
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success("Registration successful! Please verify your email if required.");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.info("Logged out successfully");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Failed to log out");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register,
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
