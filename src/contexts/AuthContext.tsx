
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    // Check for existing face-auth session in localStorage
    const currentUser = localStorage.getItem('currentUserName');
    if (currentUser) {
      setUser({ email: currentUser });
    }
    setIsLoading(false);
  }, []);

  const signOut = async () => {
    try {
      localStorage.removeItem('currentUserName');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
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
