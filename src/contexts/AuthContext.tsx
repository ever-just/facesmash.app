
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

// Cache key for last verified session
const SESSION_CACHE_KEY = 'facesmash_session_cache';
const SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes — skip verify if recently verified

interface SessionCache {
  email: string;
  verifiedAt: number;
}

function getCachedSession(): SessionCache | null {
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const cached: SessionCache = JSON.parse(raw);
    if (Date.now() - cached.verifiedAt < SESSION_CACHE_TTL) return cached;
    return null; // expired
  } catch {
    return null;
  }
}

function setCachedSession(email: string) {
  try {
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ email, verifiedAt: Date.now() }));
  } catch { /* localStorage full — non-critical */ }
}

function clearCachedSession() {
  localStorage.removeItem(SESSION_CACHE_KEY);
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Instantly hydrate from localStorage cache for faster first paint
  const cachedSession = getCachedSession();
  const savedUser = cachedSession?.email || localStorage.getItem('currentUserName');
  const [user, setUser] = useState<SimpleUser | null>(savedUser ? { email: savedUser } : null);
  const [isLoading, setIsLoading] = useState(!cachedSession); // skip loading if cache hit

  useEffect(() => {
    // If we have a valid session cache, skip the network verify on first load
    // (background verify will still happen for security)
    const verifySession = async () => {
      try {
        const res = await api.verify();
        if (res.ok && res.data.user) {
          setUser({ email: res.data.user.email });
          localStorage.setItem('currentUserName', res.data.user.email);
          setCachedSession(res.data.user.email);
        } else {
          // Cookie expired or invalid
          const currentUser = localStorage.getItem('currentUserName');
          if (currentUser) {
            localStorage.removeItem('currentUserName');
          }
          clearCachedSession();
          setUser(null);
        }
      } catch {
        // Network error — keep cached user if available
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
      clearCachedSession();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear local state even if server call fails
      localStorage.removeItem('currentUserName');
      clearCachedSession();
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
