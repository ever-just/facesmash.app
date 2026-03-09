
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/integrations/api/client';

interface SimpleUser {
  email: string;
}

interface AuthContextType {
  user: SimpleUser | null;
  session: null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify session via httpOnly cookie (server checks the JWT)
    const verifySession = async () => {
      try {
        const res = await api.verify();
        if (res.ok && res.data.valid) {
          setUser({ email: res.data.user.email });
          // Keep localStorage in sync for display purposes
          localStorage.setItem('currentUserName', res.data.user.email);
        } else {
          // Cookie expired or invalid — fall back to localStorage for display
          const currentUser = localStorage.getItem('currentUserName');
          if (currentUser) {
            // localStorage has a name but cookie is gone — clear stale state
            localStorage.removeItem('currentUserName');
          }
          setUser(null);
        }
      } catch {
        // Network error — check localStorage as fallback
        const currentUser = localStorage.getItem('currentUserName');
        if (currentUser) {
          setUser({ email: currentUser });
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const signOut = async () => {
    try {
      await api.logout(); // Clears the httpOnly cookie server-side
      localStorage.removeItem('currentUserName');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear local state even if server call fails
      localStorage.removeItem('currentUserName');
      setUser(null);
    }
  };

  const value = {
    user,
    session: null,
    isLoading,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
